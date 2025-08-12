import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { FEATURE_MATRIX } from '@/config/features'
import { SubscriptionService } from '@/lib/services/subscription'
import { usageSummaryCache } from '@/lib/cache'

export interface LimitCheckOptions {
  resource: 'users' | 'storage' | 'api_calls' | 'projects' | 'integrations'
  increment?: number
  strict?: boolean // If true, will reject request if limit is reached
}

export async function withLimitsCheck(
  request: NextRequest,
  options: LimitCheckOptions
) {
  try {
    // Get user token
    const token = await getToken({ req: request })
    
    if (!token?.companyId) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 400 }
      )
    }

    const companyId = token.companyId as string
    
    // Check current usage
    const usage = await SubscriptionService.checkUsageLimit(companyId, options.resource)
    
    // If increment specified, check if adding would exceed limit
    const futureUsage = usage.currentUsage + (options.increment || 0)
    const wouldExceedLimit = futureUsage > usage.limit
    
    // Add usage info to headers for client
    const response = NextResponse.next()
    response.headers.set('X-Usage-Current', usage.currentUsage.toString())
    response.headers.set('X-Usage-Limit', usage.limit.toString())
    response.headers.set('X-Usage-Percent', Math.round(usage.percentUsed).toString())
    
    // If strict mode and would exceed limit, reject
    if (options.strict && wouldExceedLimit) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          current: usage.currentUsage,
          limit: usage.limit,
          resource: options.resource
        },
        { status: 429 } // Too Many Requests
      )
    }
    
    // If would exceed limit but not strict, add warning header
    if (wouldExceedLimit) {
      response.headers.set('X-Usage-Warning', 'Approaching or exceeding limit')
    }
    
    return response
    
  } catch (error) {
    console.error('Error in limits check:', error)
    return NextResponse.json(
      { error: 'Error checking limits' },
      { status: 500 }
    )
  }
}

// Middleware for API routes to check limits
export function createLimitsMiddleware(options: LimitCheckOptions) {
  return async (request: NextRequest) => {
    return withLimitsCheck(request, options)
  }
}

// Usage tracking utility
export async function trackUsage(
  companyId: string,
  resource: 'users' | 'storage' | 'api_calls',
  amount: number
) {
  try {
    await SubscriptionService.updateUsage(companyId, resource, amount)
  } catch (error) {
    console.error('Error tracking usage:', error)
  }
}

// Check if company has specific feature
export async function hasFeature(companyId: string, feature: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        company: {
          id: companyId
        }
      },
      include: { addons: true }
    })
    
    if (!subscription) {
      return false
    }
    
    // Source of truth: FEATURE_MATRIX
    const rule = FEATURE_MATRIX[feature as keyof typeof FEATURE_MATRIX]
    if (!rule) {
      // fallback al array features en DB si existe
      const features = subscription.features as any
      return Array.isArray(features) ? features.includes(feature) : false
    }
    if (rule.basePlans?.includes(subscription.plan)) return true
    if (rule.addonType && Array.isArray(subscription.addons)) {
      return subscription.addons.some(a => a.addon_type === rule.addonType)
    }
    return false
    
  } catch (error) {
    console.error('Error checking feature:', error)
    return false
  }
}

// Utility to get company usage summary
export async function getUsageSummary(companyId: string) {
  try {
  const cached = usageSummaryCache.get(companyId)
  if (cached) return cached
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true }
    })
    
    if (!company?.subscription) {
      return null
    }
    
    const [
      usersCount,
      servicesCount,
      apiKeysCount,
      storageUsed,
      thisMonthApiCalls,
      thisMonthUsage
    ] = await Promise.all([
      prisma.user.count({
        where: { company_id: companyId, is_active: true }
      }),
      prisma.service.count({
        where: { company_id: companyId }
      }),
      prisma.apiKey.count({
        where: { company_id: companyId, is_active: true }
      }),
      Promise.resolve(Number(company.current_storage)),
      Promise.resolve(company.monthly_api_calls),
      prisma.usageLog.findMany({
        where: {
          company_id: companyId,
          period: new Date().toISOString().substring(0, 7) // Current month
        }
      })
    ])
    
    const subscription = company.subscription
    
  const result = {
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
      },
      limits: {
        users: subscription.max_users,
        storage: Number(subscription.max_storage),
        api_calls: subscription.max_api_calls,
        projects: subscription.max_projects,
        integrations: subscription.max_integrations,
      },
      usage: {
        users: usersCount,
        storage: storageUsed,
        api_calls: thisMonthApiCalls,
        projects: servicesCount,
        integrations: apiKeysCount,
      },
      percentages: {
        users: subscription.max_users > 0 ? (usersCount / subscription.max_users) * 100 : 0,
        storage: Number(subscription.max_storage) > 0 ? (storageUsed / Number(subscription.max_storage)) * 100 : 0,
        api_calls: subscription.max_api_calls > 0 ? (thisMonthApiCalls / subscription.max_api_calls) * 100 : 0,
      },
      thisMonthUsage
    }
  usageSummaryCache.set(companyId, result, 30_000)
  return result
    
  } catch (error) {
    console.error('Error getting usage summary:', error)
    return null
  }
}
