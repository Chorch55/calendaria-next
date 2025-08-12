// Central billing config (no Stripe client dependency)

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

// Public-safe display info for add-ons (for UI only)
// Prices can differ by plan; adjust to your real Stripe pricing
export const ADDON_DISPLAY = {
  // Users in packs of 5
  EXTRA_USERS: {
    unit: 'pack (5 users)',
    monthlyByPlan: {
      BASIC: '€7.99',
      PREMIUM: '€6.99',
      ENTERPRISE: '€5.99',
    },
  },
  EXTRA_STORAGE: { unit: 'GB', monthlyByPlan: { BASIC: '€1', PREMIUM: '€1', ENTERPRISE: '€1' } },
  API_CALLS: { unit: '1000 calls', monthlyByPlan: { BASIC: '€2', PREMIUM: '€2', ENTERPRISE: '€2' } },
  INTEGRATIONS: { unit: 'integration', monthlyByPlan: { BASIC: '€9', PREMIUM: '€9', ENTERPRISE: '€9' } },
  CUSTOM_BRANDING: { unit: 'branding', monthlyByPlan: { BASIC: '€15', PREMIUM: '€15', ENTERPRISE: '€15' } },
} as const

export const PLAN_LIMITS = {
  BASIC: {
  max_users: 5,
  max_storage: 1073741824 * 5, // 5GB
  max_api_calls: 5000,
  max_projects: 5,
  max_integrations: 1,
  included_reminders: 50,
  overage_reminder_price_eur: 0.05,
  included_languages: ['ES'],
  language_extra_price_eur: 5,
  language_pack_full_eur: 15,
    features: ['basic_support', 'email_notifications'],
  },
  PREMIUM: {
  max_users: 25,
  max_storage: 1073741824 * 50, // 50GB
  max_api_calls: 25000,
  max_projects: 25,
  max_integrations: 5,
  included_reminders: 200,
  overage_reminder_price_eur: 0.03,
  included_languages: ['ES', 'EN'],
  language_extra_price_eur: 4,
  language_pack_full_eur: 10,
    features: ['priority_support', 'email_notifications', 'sms_notifications', 'custom_branding'],
  },
  ENTERPRISE: {
  max_users: 50,
    max_storage: -1, // unlimited
    max_api_calls: -1, // unlimited
    max_projects: -1, // unlimited
    max_integrations: -1, // unlimited
  included_reminders: 1000,
  overage_reminder_price_eur: 0.015,
  included_languages: ['ES', 'EN', 'FR', 'DE', 'PT', 'IT', 'AR'],
  language_extra_price_eur: 0,
  language_pack_full_eur: 0,
    features: ['dedicated_support', 'all_notifications', 'custom_branding', 'sso', 'api_access'],
  },
} as const

export type PlanKey = keyof typeof STRIPE_PLANS
export type StripeBillingCycle = 'monthly' | 'yearly'
export type StripeAddonKey = keyof typeof STRIPE_ADDONS
