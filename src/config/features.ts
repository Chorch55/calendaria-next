import type { SubscriptionPlan } from '@prisma/client'

// Definición de claves de feature usadas en el sistema
export type FeatureKey =
  | 'api_access'
  | 'custom_branding'
  // añade aquí más features si las quieres gatear desde backend
  | 'call_bot'
  | 'recording'
  | 'staff_mgmt'
  | 'task_mgmt_team'
  | 'advanced_call_analytics'
  | 'multilanguage'
  | 'embed_chat'
  | 'unified_inbox'
  | 'calendar_events'
  | 'phone_call_logs'
  | 'contacts_companies'
  | 'tasks_kanban'
  | 'time_tracking'
  | 'leave_management'
  | 'ai_assistant'
  | 'analytics_basic'
  | 'analytics_advanced'
  | 'webhooks'

export interface FeatureRule {
  basePlans?: SubscriptionPlan[]
  addonType?: 'INTEGRATIONS' | 'CUSTOM_BRANDING' | 'API_CALLS' | 'EXTRA_USERS' | 'EXTRA_STORAGE'
}

// Matriz centralizada: qué planes incluyen la feature por defecto y qué add-on la desbloquea
export const FEATURE_MATRIX: Record<FeatureKey, FeatureRule> = {
  api_access: {
    basePlans: ['ENTERPRISE'],
    addonType: 'INTEGRATIONS',
  },
  custom_branding: {
    basePlans: ['PREMIUM', 'ENTERPRISE'],
    addonType: 'CUSTOM_BRANDING',
  },
  // Ejemplos extendibles; ajustar cuando tengas los add-ons concretos en Stripe
  call_bot: { basePlans: ['PREMIUM', 'ENTERPRISE'] },
  recording: { basePlans: ['ENTERPRISE'] },
  staff_mgmt: { basePlans: ['ENTERPRISE'] },
  task_mgmt_team: { basePlans: ['ENTERPRISE'] },
  advanced_call_analytics: { basePlans: ['ENTERPRISE'] },
  multilanguage: { basePlans: ['PREMIUM', 'ENTERPRISE'], addonType: 'INTEGRATIONS' },
  embed_chat: { basePlans: ['ENTERPRISE'] },
  unified_inbox: { basePlans: ['BASIC', 'PREMIUM', 'ENTERPRISE'] },
  calendar_events: { basePlans: ['BASIC', 'PREMIUM', 'ENTERPRISE'] },
  phone_call_logs: { basePlans: ['BASIC', 'PREMIUM', 'ENTERPRISE'] },
  contacts_companies: { basePlans: ['BASIC', 'PREMIUM', 'ENTERPRISE'] },
  tasks_kanban: { basePlans: ['BASIC', 'PREMIUM', 'ENTERPRISE'] },
  time_tracking: { basePlans: ['PREMIUM', 'ENTERPRISE'] },
  leave_management: { basePlans: ['PREMIUM', 'ENTERPRISE'] },
  ai_assistant: { basePlans: ['BASIC', 'PREMIUM', 'ENTERPRISE'] },
  analytics_basic: { basePlans: ['PREMIUM', 'ENTERPRISE'] },
  analytics_advanced: { basePlans: ['ENTERPRISE'] },
  webhooks: { basePlans: ['ENTERPRISE'], addonType: 'INTEGRATIONS' },
}
