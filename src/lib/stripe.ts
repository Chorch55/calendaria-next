import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Stripe Price configurations for different plans
export const STRIPE_PLANS = {
  BASIC: {
    monthly: 'price_basic_monthly',
    yearly: 'price_basic_yearly',
  },
  PREMIUM: {
    monthly: 'price_premium_monthly', 
    yearly: 'price_premium_yearly',
  },
  ENTERPRISE: {
    monthly: 'price_enterprise_monthly',
    yearly: 'price_enterprise_yearly',
  },
} as const

export const STRIPE_ADDONS = {
  EXTRA_USERS: 'price_extra_users',
  EXTRA_STORAGE: 'price_extra_storage',
  API_CALLS: 'price_api_calls',
  INTEGRATIONS: 'price_integrations',
  CUSTOM_BRANDING: 'price_custom_branding',
} as const

// Plan limits and features
export const PLAN_LIMITS = {
  BASIC: {
    max_users: 1,
    max_storage: 1073741824, // 1GB
    max_api_calls: 1000,
    max_projects: 3,
    max_integrations: 1,
    features: ['basic_support', 'email_notifications'],
  },
  PREMIUM: {
    max_users: 10,
    max_storage: 10737418240, // 10GB
    max_api_calls: 10000,
    max_projects: 20,
    max_integrations: 5,
    features: ['priority_support', 'email_notifications', 'sms_notifications', 'custom_branding'],
  },
  ENTERPRISE: {
    max_users: -1, // unlimited
    max_storage: -1, // unlimited
    max_api_calls: -1, // unlimited
    max_projects: -1, // unlimited
    max_integrations: -1, // unlimited
    features: ['dedicated_support', 'all_notifications', 'custom_branding', 'sso', 'api_access'],
  },
} as const

export type StripePlan = keyof typeof STRIPE_PLANS
export type StripeBillingCycle = 'monthly' | 'yearly'
export type StripeAddon = keyof typeof STRIPE_ADDONS
