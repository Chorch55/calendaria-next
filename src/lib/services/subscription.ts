import { prisma } from '@/lib/prisma'
import { stripe, STRIPE_PLANS, PLAN_LIMITS } from '@/lib/stripe'
import type { SubscriptionPlan, BillingCycle } from '@prisma/client'
import type Stripe from 'stripe'

export class SubscriptionService {
  
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
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: stripeCustomerId,
        items: [{ price: priceId }],
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
          max_users: limits.max_users === -1 ? 999999 : limits.max_users,
          max_storage: BigInt(limits.max_storage === -1 ? 999999999999 : limits.max_storage),
          max_api_calls: limits.max_api_calls === -1 ? 999999 : limits.max_api_calls,
          max_projects: limits.max_projects === -1 ? 999999 : limits.max_projects,
          max_integrations: limits.max_integrations === -1 ? 999999 : limits.max_integrations,
          features: limits.features,
          trial_start: new Date(),
          trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
          current_period_start: new Date((stripeSubscription as any).current_period_start * 1000),
          current_period_end: new Date((stripeSubscription as any).current_period_end * 1000),
        }
      })

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
      include: { subscription: true }
    })

    if (!company?.subscription) {
      throw new Error('No subscription found')
    }

    const { subscription } = company
    let currentUsage: number
    let limit: number

    switch (resource) {
      case 'users':
        currentUsage = company.current_users
        limit = subscription.max_users
        break
      case 'storage':
        currentUsage = Number(company.current_storage)
        limit = Number(subscription.max_storage)
        break
      case 'api_calls':
        currentUsage = company.monthly_api_calls
        limit = subscription.max_api_calls
        break
      case 'projects':
        currentUsage = await prisma.service.count({
          where: { company_id: companyId }
        })
        limit = subscription.max_projects || 999999
        break
      case 'integrations':
        currentUsage = await prisma.apiKey.count({
          where: { company_id: companyId }
        })
        limit = subscription.max_integrations || 999999
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
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: {
          include: {
            addons: true,
            invoices: {
              orderBy: { created_at: 'desc' },
              take: 5
            }
          }
        }
      }
    })

    if (!company?.subscription) {
      return null
    }

    // Get current usage for each resource
    const [usersUsage, storageUsage, apiCallsUsage, projectsUsage, integrationsUsage] = await Promise.all([
      this.checkUsageLimit(companyId, 'users'),
      this.checkUsageLimit(companyId, 'storage'),
      this.checkUsageLimit(companyId, 'api_calls'),
      this.checkUsageLimit(companyId, 'projects'),
      this.checkUsageLimit(companyId, 'integrations'),
    ])

    return {
      ...company.subscription,
      usage: {
        users: usersUsage,
        storage: storageUsage,
        api_calls: apiCallsUsage,
        projects: projectsUsage,
        integrations: integrationsUsage,
      }
    }
  }
}
