import { prisma } from '@/lib/prisma'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { STRIPE_ADDONS } from '@/config/billing'
import { PLAN_LIMITS } from '@/config/billing'
import type { SubscriptionPlan, BillingCycle } from '@prisma/client'
import type Stripe from 'stripe'
import { subscriptionCache } from '@/lib/cache'

export class SubscriptionService {
  // Unit increments per addon
  private static readonly ADDON_UNIT_INCREMENTS = {
  EXTRA_USERS: 5, // packs of 5 users
    EXTRA_STORAGE: 1073741824, // 1GB in bytes
    API_CALLS: 1000,
    INTEGRATIONS: 1,
  } as const

  // Build effective limits from base subscription + addons
  static buildEffectiveLimits(subscription: any) {
    const base = {
      users: subscription.max_users ?? 0,
      storage: Number(subscription.max_storage ?? 0),
      api_calls: subscription.max_api_calls ?? 0,
      projects: subscription.max_projects ?? 0,
      integrations: subscription.max_integrations ?? 0,
    }
    let extra = { users: 0, storage: 0, api_calls: 0, projects: 0, integrations: 0 }

    if (Array.isArray(subscription.addons)) {
      for (const a of subscription.addons) {
        const qty = Number(a.quantity ?? 0)
        switch (a.addon_type) {
          case 'EXTRA_USERS':
            extra.users += qty * this.ADDON_UNIT_INCREMENTS.EXTRA_USERS
            break
          case 'EXTRA_STORAGE':
            extra.storage += qty * this.ADDON_UNIT_INCREMENTS.EXTRA_STORAGE
            break
          case 'API_CALLS':
            extra.api_calls += qty * this.ADDON_UNIT_INCREMENTS.API_CALLS
            break
          case 'INTEGRATIONS':
            extra.integrations += qty * this.ADDON_UNIT_INCREMENTS.INTEGRATIONS
            break
          default:
            break
        }
      }
    }

    // Unlimited handling: if base is a very high cap (our stored cap), treat as unlimited
    const effective = {
      users: base.users + extra.users,
      storage: base.storage + extra.storage,
      api_calls: base.api_calls + extra.api_calls,
      projects: base.projects, // assuming no addon for projects by default
      integrations: base.integrations + extra.integrations,
    }

    return effective
  }

  // Reminders quota helpers (plan-included only)
  static async getIncludedReminders(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    })
    if (!company?.subscription) return 0
    const plan = company.subscription.plan as keyof typeof PLAN_LIMITS
    const limits = PLAN_LIMITS[plan]
    return (limits as any).included_reminders ?? 0
  }

  static async getMonthlyRemindersUsed(companyId: string) {
    const period = new Date().toISOString().substring(0, 7) // YYYY-MM
    // We log reminders as UsageLog with resource=BOOKINGS and metadata='REMINDER_SENT'
    const count = await prisma.usageLog.count({
      where: {
        company_id: companyId,
        period,
        resource: 'BOOKINGS' as any,
        // metadata equals string JSON 'REMINDER_SENT'
        metadata: 'REMINDER_SENT' as any,
      }
    })
    return count
  }

  static async ensureCanSendReminder(companyId: string, amount = 1) {
    const [included, used] = await Promise.all([
      this.getIncludedReminders(companyId),
      this.getMonthlyRemindersUsed(companyId),
    ])
    if (included <= 0) {
      throw new Error('Tu plan no incluye recordatorios. Actualiza tu plan para activar recordatorios.')
    }
    if (used + amount > included) {
      throw new Error('Has alcanzado el límite de recordatorios incluidos de tu plan.')
    }
    return { included, used, remaining: included - used }
  }

  static async trackReminderSent(companyId: string, amount = 1) {
    const period = new Date().toISOString().substring(0, 7)
    for (let i = 0; i < amount; i++) {
      await prisma.usageLog.create({
        data: {
          company_id: companyId,
          resource: 'BOOKINGS' as any,
          amount: 1,
          period,
          metadata: 'REMINDER_SENT' as any,
        }
      })
    }
  }
  
  // Create a new subscription
  static async createSubscription(data: {
    companyId: string
    plan: SubscriptionPlan
    billingCycle: BillingCycle
    email: string
    paymentMethodId?: string
  }) {
    const { companyId, plan, billingCycle, email, paymentMethodId } = data
    
    try {
      // Get company
  const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: { subscription: true }
      })
      
      if (!company) {
        throw new Error('Company not found')
      }

      // Create or get Stripe customer
      let stripeCustomerId = company.subscription?.stripe_customer_id
      
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email,
          name: company.name,
          metadata: {
            companyId,
          }
        })
        stripeCustomerId = customer.id
      }

      // Get price ID
      const cycleLower = billingCycle.toLowerCase() as 'monthly' | 'yearly'
      const priceId = STRIPE_PLANS[plan][cycleLower]
      
      if (!priceId) {
        throw new Error(`Price not found for plan ${plan} ${billingCycle}`)
      }

      // Create Stripe subscription
      // Extra items from selected add-ons (if set during signup)
      const selectedAddons: any = (company.settings as any)?.selectedAddons || null
      const extraItems: Stripe.SubscriptionCreateParams.Item[] = []
      if (selectedAddons) {
        const qty = (n: any) => (typeof n === 'number' && n > 0 ? n : undefined)
        if (qty(selectedAddons.EXTRA_USERS)) {
          extraItems.push({ price: STRIPE_ADDONS.EXTRA_USERS, quantity: selectedAddons.EXTRA_USERS })
        }
        if (qty(selectedAddons.EXTRA_STORAGE)) {
          extraItems.push({ price: STRIPE_ADDONS.EXTRA_STORAGE, quantity: selectedAddons.EXTRA_STORAGE })
        }
        if (qty(selectedAddons.API_CALLS)) {
          extraItems.push({ price: STRIPE_ADDONS.API_CALLS, quantity: selectedAddons.API_CALLS })
        }
        if (qty(selectedAddons.INTEGRATIONS)) {
          extraItems.push({ price: STRIPE_ADDONS.INTEGRATIONS, quantity: selectedAddons.INTEGRATIONS })
        }
        if (selectedAddons.CUSTOM_BRANDING) {
          extraItems.push({ price: STRIPE_ADDONS.CUSTOM_BRANDING, quantity: 1 })
        }
      }

      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: [{ price: priceId }, ...extraItems],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          companyId,
          plan,
          billingCycle,
        }
      }

      // Add payment method if provided
      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId
      }

  const stripeSubscription = await stripe.subscriptions.create(subscriptionData)
      
      // Get plan limits
      const limits = PLAN_LIMITS[plan]
      
      // Create subscription in database
      const subscription = await prisma.subscription.create({
        data: {
          companyId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscription.id,
          stripe_price_id: priceId,
          plan,
          billing_cycle: billingCycle,
          status: 'TRIALING', // Start with trial
          unit_amount: stripeSubscription.items.data[0].price.unit_amount || 0,
          currency: stripeSubscription.currency.toUpperCase(),
          max_users: limits.max_users,
          max_storage: BigInt(limits.max_storage),
          max_api_calls: limits.max_api_calls,
          max_projects: limits.max_projects,
          max_integrations: limits.max_integrations,
          features: limits.features,
          trial_start: new Date(),
          trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          current_period_start: new Date((stripeSubscription as any).current_period_start * 1000),
          current_period_end: new Date((stripeSubscription as any).current_period_end * 1000),
        }
      })

      // Persist addons in DB for effective limits calculations
      if (extraItems.length > 0) {
        for (const item of extraItems) {
          if (!item.price) continue
          const price = await stripe.prices.retrieve(item.price as string)
          const addonType = (Object.entries(STRIPE_ADDONS).find(([, v]) => v === item.price)?.[0] || 'INTEGRATIONS') as any
          await prisma.subscriptionAddon.create({
            data: {
              subscription_id: subscription.id,
              addon_type: addonType,
              name: price.nickname || addonType,
              description: price.metadata?.description || null,
              unit_amount: price.unit_amount || 0,
              quantity: (item.quantity as number) || 1,
              stripe_price_id: item.price as string,
            }
          })
        }
      }

      // Update company
      await prisma.company.update({
        where: { id: companyId },
        data: {
          subscriptionId: subscription.id,
          current_users: 1, // Start with 1 user
        }
      })

      return {
        subscription,
        stripeSubscription,
        clientSecret: (stripeSubscription.latest_invoice as any)?.payment_intent?.client_secret || null
      }
      
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  }

  // Cancel subscription
  static async cancelSubscription(companyId: string, cancelAtPeriodEnd = true) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true }
    })

    if (!company?.subscription?.stripe_subscription_id) {
      throw new Error('Subscription not found')
    }

    // Update Stripe subscription
    const stripeSubscription = await stripe.subscriptions.update(
      company.subscription.stripe_subscription_id,
      {
        cancel_at_period_end: cancelAtPeriodEnd,
        metadata: {
          canceled_by: 'user',
          canceled_at: new Date().toISOString()
        }
      }
    )

    // Update database
    const subscription = await prisma.subscription.update({
      where: { id: company.subscription.id },
      data: {
        cancel_at_period_end: cancelAtPeriodEnd,
        canceled_at: cancelAtPeriodEnd ? new Date() : null,
        status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELED'
      }
    })

    return { subscription, stripeSubscription }
  }

  // Check usage against limits
  static async checkUsageLimit(companyId: string, resource: 'users' | 'storage' | 'api_calls' | 'projects' | 'integrations') {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: { include: { addons: true } } }
    })

    if (!company?.subscription) {
      throw new Error('No subscription found')
    }

    const { subscription } = company
    const effective = this.buildEffectiveLimits(subscription)
    let currentUsage: number
    let limit: number

    switch (resource) {
      case 'users':
        currentUsage = company.current_users
        limit = effective.users
        break
      case 'storage':
        currentUsage = Number(company.current_storage)
        limit = effective.storage
        break
      case 'api_calls':
        currentUsage = company.monthly_api_calls
        limit = effective.api_calls
        break
      case 'projects':
        currentUsage = await prisma.service.count({
          where: { company_id: companyId }
        })
        limit = effective.projects || 999999
        break
      case 'integrations':
        currentUsage = await prisma.apiKey.count({
          where: { company_id: companyId }
        })
        limit = effective.integrations || 999999
        break
      default:
        throw new Error('Unknown resource type')
    }

    return {
      currentUsage,
      limit,
      isAtLimit: currentUsage >= limit,
      percentUsed: limit > 0 ? (currentUsage / limit) * 100 : 0
    }
  }

  // Update usage
  static async updateUsage(companyId: string, resource: 'users' | 'storage' | 'api_calls', increment: number) {
    const updateData: any = {}
    
    switch (resource) {
      case 'users':
        updateData.current_users = { increment }
        break
      case 'storage':
        updateData.current_storage = { increment: BigInt(increment) }
        break
      case 'api_calls':
        updateData.monthly_api_calls = { increment }
        break
    }

    await prisma.company.update({
      where: { id: companyId },
      data: updateData
    })

    // Log usage
    await prisma.usageLog.create({
      data: {
        company_id: companyId,
        resource: resource.toUpperCase() as any,
        amount: increment,
        period: new Date().toISOString().substring(0, 7) // YYYY-MM format
      }
    })
  }

  // Get subscription with usage data
  static async getSubscriptionWithUsage(companyId: string) {
  const cached = subscriptionCache.get(companyId)
  if (cached) return cached
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: {
          include: {
            addons: true,
            invoices: { orderBy: { created_at: 'desc' }, take: 5 },
          },
        },
      },
    })

    if (!company?.subscription) {
      return null
    }

    const effective = this.buildEffectiveLimits(company.subscription)

    // Compute current usage with minimal queries
    const [projectsCount, integrationsCount] = await Promise.all([
      prisma.service.count({ where: { company_id: companyId } }),
      prisma.apiKey.count({ where: { company_id: companyId } }),
    ])

    const usersUsage = {
      currentUsage: company.current_users,
      limit: effective.users,
      isAtLimit: company.current_users >= effective.users,
      percentUsed: effective.users > 0 ? (company.current_users / effective.users) * 100 : 0,
    }
    const storageCurrent = Number(company.current_storage || 0)
    const storageUsage = {
      currentUsage: storageCurrent,
      limit: effective.storage,
      isAtLimit: storageCurrent >= effective.storage,
      percentUsed: effective.storage > 0 ? (storageCurrent / effective.storage) * 100 : 0,
    }
    const apiCallsUsage = {
      currentUsage: company.monthly_api_calls,
      limit: effective.api_calls,
      isAtLimit: company.monthly_api_calls >= effective.api_calls,
      percentUsed: effective.api_calls > 0 ? (company.monthly_api_calls / effective.api_calls) * 100 : 0,
    }
    const projectsUsage = {
      currentUsage: projectsCount,
      limit: effective.projects || 999999,
      isAtLimit: projectsCount >= (effective.projects || 999999),
      percentUsed: (effective.projects || 999999) > 0 ? (projectsCount / (effective.projects || 999999)) * 100 : 0,
    }
    const integrationsUsage = {
      currentUsage: integrationsCount,
      limit: effective.integrations || 999999,
      isAtLimit: integrationsCount >= (effective.integrations || 999999),
      percentUsed: (effective.integrations || 999999) > 0 ? (integrationsCount / (effective.integrations || 999999)) * 100 : 0,
    }

  const result = {
      ...company.subscription,
      effective_limits: effective,
      usage: {
        users: usersUsage,
        storage: storageUsage,
        api_calls: apiCallsUsage,
        projects: projectsUsage,
        integrations: integrationsUsage,
      },
    }
  subscriptionCache.set(companyId, result, 30_000)
  return result
  }
}
