
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslation } from '@/hooks/use-translation'
import { Building2, Users, Crown, CheckCircle2, ArrowLeft, ArrowRight, Bell, Phone, Languages, Mic, Bot, Briefcase, BarChart3, TrendingUp, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlanKey } from '@/config/billing'
import { cn } from '@/lib/utils'

// Planes disponibles
const PLANS = [
  {
    id: 'basic',
    name: 'home_plan_individual_name',
    icon: Users,
    price: '€19/mo',
    features: [
      'plan_feature_from_1_user',
      'plan_feature_2gb_storage',
      'plan_compare_booking_calendar',
      'plan_compare_whatsapp_bot',
      'plan_compare_email_bot',
      'plan_compare_unified_inbox',
      'plan_feature_50_reminders',
      'plan_feature_language_es',
      'plan_feature_5000_automatizations',
      'plan_feature_support_email'
    ]
  },
  {
    id: 'premium',
    name: 'home_plan_professional_name',
    icon: Crown,
    price: '€99/mo',
    features: [
      'plan_feature_from_20_users',
      'plan_feature_5gb_storage',
      'plan_compare_booking_calendar',
      'plan_compare_call_bot',
      'plan_compare_call_transfer',
      'plan_feature_200_reminders',
      'plan_feature_language_es_en',
      'plan_feature_25000_automatizations',
      'plan_feature_support_whatsapp_email'
    ]
  },
  {
    id: 'enterprise',
    name: 'home_plan_enterprise_name',
    icon: Building2,
    price: '€299/mo',
    features: [
      'plan_feature_from_50_users',
      'plan_feature_10gb_storage',
      'plan_compare_call_bot',
      'plan_compare_booking_calendar',
      'plan_compare_advanced_call_analytics',
      'home_plan_feature_admin_controls',
      'home_plan_feature_full_customization',
      'plan_compare_call_recording',
      'plan_compare_custom_embed_chat',
      'plan_compare_staff_mgmt',
      'plan_compare_task_mgmt_team',
      'plan_feature_1000_reminders',
      'plan_feature_language_all',
      'plan_feature_infinite_automatizations',
      'plan_feature_support_phone_whatsapp_email'
    ]
  }
]

export default function SignupMultiTenantPage() {
  const [step, setStep] = useState(1) // 1: Plan, 2: Add-ons, 3: Company, 4: Admin
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  // Datos del plan
  const [subscriptionPlan, setSubscriptionPlan] = useState<'basic' | 'premium' | 'enterprise'>('premium')

  // Public billing config (for UI)
  const [planLimits, setPlanLimits] = useState<Record<PlanKey, any> | null>(null)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/config/plans')
        if (!res.ok) return
        const json = await res.json()
        if (mounted) {
          setPlanLimits(json.planLimits || null)
        }
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  const planKey: PlanKey = subscriptionPlan === 'basic' ? 'BASIC' : subscriptionPlan === 'premium' ? 'PREMIUM' : 'ENTERPRISE'
  const parseEuro = (s?: string): number => {
    if (!s) return 0
    const n = s.replace(/[^0-9.,]/g, '').replace(',', '.')
    const v = parseFloat(n)
    return isNaN(v) ? 0 : v
  }
  const getPlanBasePrice = (): number => {
    const p = PLANS.find(p => p.id === subscriptionPlan)?.price || '€0'
    return parseEuro(p)
  }

  // Preselect plan from query param (?plan=user|professional|enterprise)
  useEffect(() => {
    const planParam = searchParams.get('plan')?.toLowerCase()
    if (!planParam) return
    const map: Record<string, 'basic' | 'premium' | 'enterprise'> = {
      user: 'basic',
      individual: 'basic',
      basic: 'basic',
      professional: 'premium',
      premium: 'premium',
      enterprise: 'enterprise',
    }
    const mapped = map[planParam]
    if (mapped) setSubscriptionPlan(mapped)
  }, [searchParams])

  // Datos de la empresa
  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')

  // Datos del usuario super admin
  const [fullName, setFullName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handlePlanSelect(planId: 'basic' | 'premium' | 'enterprise') {
    setSubscriptionPlan(planId)
    setStep(2) // Ahora va a Add-ons
  }

  function handleNextToCompany() {
    // Desde Add-ons (paso 2) a Información de empresa (paso 3)
    if (!userEmail) setUserEmail(companyEmail);
    setStep(3)
  }

  function handleNextToAdmin() {
    if (companyName && companyEmail) {
      setStep(4) // Desde empresa (paso 3) a Admin (paso 4)
    }
  }

  type AddonsSelection = {
    EXTRA_USERS: number
    EXTRA_STORAGE: number
    CALL_BOT: boolean
    CALL_TRANSFER: boolean
    EXTRA_REMINDERS: number
    EXTRA_AUTOMATIONS: number
    MULTILANGUAGE: boolean
    MULTILANGUAGE_PACK: boolean
    SELECTED_LANGUAGES: string[]
    CALL_RECORDING: boolean
    CUSTOM_AI_CHAT: boolean
    STAFF_MANAGEMENT: boolean
    TASK_MANAGEMENT: boolean
    REAL_TIME_STATS: boolean
    ADVANCED_ANALYTICS: boolean
  }

  const [selectedAddons, setSelectedAddons] = useState<AddonsSelection>({
    EXTRA_USERS: 0,
    EXTRA_STORAGE: 0,
    CALL_BOT: false,
    CALL_TRANSFER: false,
    EXTRA_REMINDERS: 0,
    EXTRA_AUTOMATIONS: 0,
    MULTILANGUAGE: false,
    MULTILANGUAGE_PACK: false,
    SELECTED_LANGUAGES: [],
    CALL_RECORDING: false,
    CUSTOM_AI_CHAT: false,
    STAFF_MANAGEMENT: false,
    TASK_MANAGEMENT: false,
    REAL_TIME_STATS: false,
    ADVANCED_ANALYTICS: false,
  })

  // App integrations picker -> maps to INTEGRATIONS quantity
  useEffect(() => {
    setSelectedAddons(prev => ({ ...prev }))
  }, [])

  function incAddon<K extends keyof AddonsSelection>(key: K, delta = 1) {
    setSelectedAddons((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'number' ? Math.max(0, (prev[key] as number) + delta) : prev[key],
    }))
  }

  function toggleAddon<K extends keyof AddonsSelection>(key: K) {
    setSelectedAddons((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }))
  }

  // Función para determinar si un add-on está incluido en el plan
  function isIncludedInPlan(addon: string): boolean {
    switch (addon) {
      case 'CALL_BOT':
        return planKey !== 'BASIC' // Incluido en Profesional y Empresarial
      case 'CALL_TRANSFER':
        return planKey !== 'BASIC' // Incluido en Profesional y Empresarial
      case 'MULTILANGUAGE':
        return planKey === 'ENTERPRISE' // Solo incluido en Empresarial
      case 'CALL_RECORDING':
        return planKey === 'ENTERPRISE' // Solo incluido en Empresarial
      case 'CUSTOM_AI_CHAT':
        return planKey === 'ENTERPRISE' // Solo incluido en Empresarial
      case 'STAFF_MANAGEMENT':
        return planKey === 'ENTERPRISE' // Solo incluido en Empresarial
      case 'TASK_MANAGEMENT':
        return planKey === 'ENTERPRISE' // Solo incluido en Empresarial
      case 'REAL_TIME_STATS':
        return planKey === 'ENTERPRISE' // Solo incluido en Empresarial
      case 'ADVANCED_ANALYTICS':
        return planKey === 'ENTERPRISE' // Solo incluido en Empresarial
      case 'EXTRA_AUTOMATIONS':
        return planKey === 'ENTERPRISE' // Solo incluido en Empresarial (automations ilimitadas)
      default:
        return false
    }
  }

  // Función para calcular el precio de un add-on específico
  function calculateAddonPrice(addon: string): number {
    switch (addon) {
      case 'EXTRA_USERS':
        const userPrice = planKey === 'BASIC' ? 7.99 : planKey === 'PREMIUM' ? 6.99 : 5.99
        return userPrice * selectedAddons.EXTRA_USERS
      case 'EXTRA_STORAGE':
        const storagePrice = planKey === 'BASIC' ? 5 : planKey === 'PREMIUM' ? 4 : 3
        return storagePrice * selectedAddons.EXTRA_STORAGE
      case 'CALL_BOT':
        return (planKey === 'BASIC' && selectedAddons.CALL_BOT) ? 10 : 0
      case 'EXTRA_REMINDERS':
        const reminderPrice = planKey === 'BASIC' ? 0.05 : planKey === 'PREMIUM' ? 0.03 : 0.015
        return reminderPrice * selectedAddons.EXTRA_REMINDERS
      case 'MULTILANGUAGE':
        if (planKey === 'ENTERPRISE') return 0
        if (selectedAddons.MULTILANGUAGE_PACK) {
          return planKey === 'BASIC' ? 15 : 10
        } else {
          // Precio por idioma individual: 3€ para BASIC, 2€ para PREMIUM
          const pricePerLang = planKey === 'BASIC' ? 3 : 2
          return pricePerLang * selectedAddons.SELECTED_LANGUAGES.length
        }
      case 'CALL_RECORDING':
        if (planKey === 'ENTERPRISE') return 0
        return (planKey === 'BASIC' ? 15 : 10) * (selectedAddons.CALL_RECORDING ? 1 : 0)
      case 'CUSTOM_AI_CHAT':
        if (planKey === 'ENTERPRISE') return 0
        return (planKey === 'BASIC' ? 10 : 5) * (selectedAddons.CUSTOM_AI_CHAT ? 1 : 0)
      case 'STAFF_MANAGEMENT':
        return (planKey === 'ENTERPRISE' ? 0 : 20) * (selectedAddons.STAFF_MANAGEMENT ? 1 : 0)
      case 'TASK_MANAGEMENT':
        if (planKey === 'BASIC') return 0
        return (planKey === 'ENTERPRISE' ? 0 : 20) * (selectedAddons.TASK_MANAGEMENT ? 1 : 0)
      case 'REAL_TIME_STATS':
        if (planKey === 'BASIC') return 0
        return (planKey === 'ENTERPRISE' ? 0 : 25) * (selectedAddons.REAL_TIME_STATS ? 1 : 0)
      case 'ADVANCED_ANALYTICS':
        if (planKey === 'BASIC') return 0
        return (planKey === 'ENTERPRISE' ? 0 : 25) * (selectedAddons.ADVANCED_ANALYTICS ? 1 : 0)
      case 'EXTRA_AUTOMATIONS':
        if (planKey === 'ENTERPRISE') return 0 // Ilimitadas en Enterprise
        const automationPrice = planKey === 'BASIC' ? 5 : 4 // 5€ para Individual, 4€ para Profesional
        return automationPrice * (selectedAddons.EXTRA_AUTOMATIONS / 5000) // Por cada 5000 automatizaciones
      default:
        return 0
    }
  }
  function getAddonPrice(addon: string): string {
    switch (addon) {
      case 'EXTRA_USERS':
        return planKey === 'BASIC' ? '+7.99€/pack (5 usuarios)' : 
               planKey === 'PREMIUM' ? '+6.99€/pack (5 usuarios)' : 
               '+5.99€/pack (5 usuarios)'
      case 'EXTRA_STORAGE':
        return planKey === 'BASIC' ? '+5€/GB' : 
               planKey === 'PREMIUM' ? '+4€/GB' : 
               '+3€/GB'
      case 'CALL_BOT':
        return planKey === 'BASIC' ? '+10€' : 'Incluido'
      case 'CALL_TRANSFER':
        return planKey === 'BASIC' ? 'No disponible' : 'Incluido'
      case 'EXTRA_REMINDERS':
        return planKey === 'BASIC' ? '+0.05€/mensaje' : 
               planKey === 'PREMIUM' ? '+0.03€/mensaje' : 
               '+0.015€/mensaje'
      case 'MULTILANGUAGE':
        if (planKey === 'ENTERPRISE') return 'Incluido'
        return planKey === 'BASIC' ? 'Pack: +15€ | Por idioma: +3€' : 
               'Pack: +10€ | Por idioma: +2€'
      case 'CALL_RECORDING':
        return planKey === 'BASIC' ? '+15€' : 
               planKey === 'PREMIUM' ? '+10€' : 
               'Incluido'
      case 'CUSTOM_AI_CHAT':
        return planKey === 'BASIC' ? '+10€' : 
               planKey === 'PREMIUM' ? '+5€' : 
               'Incluido'
      case 'STAFF_MANAGEMENT':
        return planKey === 'ENTERPRISE' ? 'Incluido' : '+20€'
      case 'TASK_MANAGEMENT':
        return planKey === 'BASIC' ? 'No disponible' : 
               planKey === 'PREMIUM' ? '+20€' : 
               'Incluido'
      case 'REAL_TIME_STATS':
        return planKey === 'BASIC' ? 'No disponible' : 
               planKey === 'PREMIUM' ? '+25€' : 
               'Incluido'
      case 'ADVANCED_ANALYTICS':
        return planKey === 'BASIC' ? 'No disponible' : 
               planKey === 'PREMIUM' ? '+25€' : 
               'Incluido'
      case 'EXTRA_AUTOMATIONS':
        return planKey === 'BASIC' ? '+5€ (5.000 automations)' : 
               planKey === 'PREMIUM' ? '+4€ (5.000 automations)' : 
               'Ilimitadas'
      default:
        return ''
    }
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validaciones
      if (password !== confirmPassword) {
        setError(t('auth_error_passwords_mismatch'))
        return
      }

      if (password.length < 6) {
        setError(t('auth_error_password_length'))
        return
      }

      // Llamar a nuestra API para crear la empresa y usuario
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Datos de empresa
          companyName,
          companyEmail,
          companyPhone: companyPhone || null,
          companyWebsite: companyWebsite || null,
          subscriptionPlan,
  selectedAddons: selectedAddons,
          // Datos de usuario
          fullName,
          userEmail,
          password
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la cuenta')
      }

      setSuccess(t('auth_success_message'))
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push(`/auth/login-mt?email=${encodeURIComponent(userEmail)}`)
      }, 2000)

    } catch (err: any) {
      setError('Error inesperado: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        {/* Indicador de progreso */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: stepNumber * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step >= stepNumber
                      ? 'bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {step > stepNumber ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    stepNumber
                  )}
                </motion.div>
                {stepNumber < 4 && (
                  <div
                    className={`w-16 h-1 ml-4 transition-all duration-300 ${
                      step > stepNumber ? 'bg-gradient-to-r from-primary to-accent' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-4"
          >
            <div className="text-sm text-muted-foreground">
              {step === 1 && "Seleccionar Plan"}
              {step === 2 && "Personalizar Add-ons"}
              {step === 3 && "Información de Empresa"}
              {step === 4 && "Crear Administrador"}
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Paso 1: Selección de Plan */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border border-primary/20 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/15 to-accent/20 rounded-full flex items-center justify-center shadow-md mb-4"
                  >
                    <Crown className="h-8 w-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-2xl text-foreground">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {t('auth_plan_selection_title')}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Selecciona el plan que mejor se adapte a tu empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {PLANS.map((plan, index) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          subscriptionPlan === plan.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50 bg-card'
                        }`}
                        onClick={() => setSubscriptionPlan(plan.id as 'basic' | 'premium' | 'enterprise')}
                      >
                        {subscriptionPlan === plan.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2"
                          >
                            <CheckCircle2 className="w-6 h-6 text-primary bg-background rounded-full" />
                          </motion.div>
                        )}
                        <div className="text-center">
                          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary/20 via-primary/15 to-accent/20 rounded-full flex items-center justify-center shadow-md mb-4">
                            <plan.icon className="w-6 h-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {t(plan.name)}
                          </h3>
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                            {plan.price}
                          </p>
                          <div className="mb-4">
                            <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 text-[0.85em] font-semibold ring-1 ring-inset ring-amber-500/20">
                              + Add-Ons Available
                            </span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-2">
                            {plan.features.map((feature, featureIndex) => (
                              <motion.li
                                key={featureIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                                className="flex items-center text-left"
                              >
                                <CheckCircle2 className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                                <span className="text-foreground">{t(feature)}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 flex justify-center"
                  >
                    <Button
                      onClick={() => handlePlanSelect(subscriptionPlan)}
                      className="px-8 bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Continuar con este plan
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Paso 3: Información de la Empresa */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border border-primary/20 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/15 to-accent/20 rounded-full flex items-center justify-center shadow-md mb-4"
                  >
                    <Building2 className="h-8 w-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-2xl text-foreground">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {t('auth_company_step_title')}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('auth_company_step_subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName" className="text-foreground">
                        {t('auth_company_name_label')} *
                      </Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="mt-1 bg-background border-border focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail" className="text-foreground">
                        {t('auth_company_email_label')} *
                      </Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        required
                        className="mt-1 bg-background border-border focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone" className="text-foreground">
                        {t('auth_company_phone_label')}
                      </Label>
                      <Input
                        id="companyPhone"
                        type="tel"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="mt-1 bg-background border-border focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyWebsite" className="text-foreground">
                        {t('auth_company_website_label')}
                      </Label>
                      <Input
                        id="companyWebsite"
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://www.example.com"
                        className="mt-1 bg-background border-border focus:border-primary"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="border-border hover:bg-muted"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('auth_back')}
                    </Button>
                    <Button
                      onClick={handleNextToAdmin}
                      disabled={!companyName || !companyEmail}
                      className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {t('auth_continue')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Paso 2: Add-ons */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border border-primary/20 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/15 to-accent/20 rounded-full flex items-center justify-center shadow-md mb-4"
                  >
                    <Crown className="h-8 w-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-2xl text-foreground">
                    Personaliza tus{" "}
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 text-[0.9em] font-semibold ring-1 ring-inset ring-amber-500/20">
                      Add-Ons
                    </span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('auth_addons_step_subtitle') || 'Puedes ampliar usuarios, almacenamiento, API calls e integraciones.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Plan Upgrade Section */}
                  <div className="mb-8 p-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl border border-primary/20">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        ¿Quieres más funcionalidades incluidas?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Cambia a un plan superior y ahorra en add-ons
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {PLANS.map((plan) => (
                        <motion.div
                          key={plan.id}
                          whileHover={{ scale: 1.02 }}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                            subscriptionPlan === plan.id 
                              ? "border-primary bg-primary/10 shadow-md" 
                              : "border-border hover:border-primary/50 hover:shadow-sm"
                          )}
                          onClick={() => setSubscriptionPlan(plan.id)}
                        >
                          <div className="text-center">
                            <plan.icon className={cn(
                              "h-8 w-8 mx-auto mb-2",
                              subscriptionPlan === plan.id ? "text-primary" : "text-muted-foreground"
                            )} />
                            <h4 className="font-semibold text-foreground">{t(plan.name) || plan.name}</h4>
                            <p className="text-lg font-bold text-primary mt-1">{plan.price}</p>
                            {subscriptionPlan === plan.id && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground">
                                  Plan actual
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Extra Users */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-6 border rounded-xl bg-gradient-to-br from-card to-card/90 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            Añade usuarios
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Packs de 5 usuarios adicionales</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => incAddon('EXTRA_USERS', -1)}
                          >
                            -
                          </Button>
                          <div className="w-12 text-center font-semibold">{selectedAddons.EXTRA_USERS}</div>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => incAddon('EXTRA_USERS', 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        💰 {getAddonPrice('EXTRA_USERS')}
                      </div>
                      {planLimits?.[planKey]?.max_users != null && (
                        <div className="text-xs text-primary mt-2 font-medium">
                          ✅ Incluidos en tu plan: {planLimits[planKey].max_users} usuarios
                        </div>
                      )}
                    </motion.div>

                    {/* Extra Storage */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-6 border rounded-xl bg-gradient-to-br from-card to-card/90 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span className="text-primary">💾</span>
                            Almacenamiento extra
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Base: {planKey === 'BASIC' ? '2GB' : planKey === 'PREMIUM' ? '5GB' : '10GB'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => incAddon('EXTRA_STORAGE', -1)}
                          >
                            -
                          </Button>
                          <div className="w-12 text-center font-semibold">{selectedAddons.EXTRA_STORAGE}</div>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => incAddon('EXTRA_STORAGE', 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        💰 {getAddonPrice('EXTRA_STORAGE')}
                      </div>
                    </motion.div>

                    {/* Extra Reminders */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-6 border rounded-xl bg-gradient-to-br from-card to-card/90 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <Bell className="h-4 w-4 text-primary" />
                            Recordatorios extra
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {planKey === 'BASIC' ? 'Base: 50 mensajes' : 
                             planKey === 'PREMIUM' ? 'Base: 200 mensajes' : 
                             'Base: 1000 mensajes'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => incAddon('EXTRA_REMINDERS', -100)}
                          >
                            -
                          </Button>
                          <div className="w-16 text-center font-semibold">{selectedAddons.EXTRA_REMINDERS}</div>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => incAddon('EXTRA_REMINDERS', 100)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        💰 {getAddonPrice('EXTRA_REMINDERS')}
                      </div>
                    </motion.div>

                    {/* Extra Automations */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className="p-6 border rounded-xl bg-gradient-to-br from-card to-card/90 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <span className="text-primary">⚡</span>
                            Automatizaciones extra
                            {isIncludedInPlan('EXTRA_AUTOMATIONS') && (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 ml-2">
                                Incluido
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {planKey === 'BASIC' ? 'Base: 500 automatizaciones' : 
                             planKey === 'PREMIUM' ? 'Base: 2000 automatizaciones' : 
                             'Base: ∞ ilimitadas'}
                          </div>
                        </div>
                        {!isIncludedInPlan('EXTRA_AUTOMATIONS') && (
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => incAddon('EXTRA_AUTOMATIONS', -5000)}
                            >
                              -
                            </Button>
                            <div className="w-16 text-center font-semibold">{selectedAddons.EXTRA_AUTOMATIONS}</div>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              onClick={() => incAddon('EXTRA_AUTOMATIONS', 5000)}
                            >
                              +
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        💰 {getAddonPrice('EXTRA_AUTOMATIONS')}
                      </div>
                    </motion.div>
                  </div>

                  {/* Premium Add-ons Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Crown className="h-5 w-5 text-accent" />
                      Funcionalidades{" "}
                      <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                        Premium
                      </span>
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      
                      {/* Bot de Llamadas */}
                      <div 
                        onClick={() => !isIncludedInPlan('CALL_BOT') && planKey === 'BASIC' ? toggleAddon('CALL_BOT') : null}
                        className={cn(
                          "p-4 border rounded-lg transition-all duration-200",
                          isIncludedInPlan('CALL_BOT') 
                            ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/10" 
                            : planKey === 'BASIC' 
                              ? "border-accent/30 hover:border-accent/50 hover:shadow-md cursor-pointer" 
                              : "border-border",
                          !isIncludedInPlan('CALL_BOT') && planKey === 'BASIC' && selectedAddons.CALL_BOT 
                            ? "border-primary bg-primary/10" 
                            : ""
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <Phone className="h-4 w-4 text-primary" />
                              Bot de llamadas
                              {!isIncludedInPlan('CALL_BOT') && planKey === 'BASIC' && selectedAddons.CALL_BOT && (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Contesta como un humano y les concierta citas telefónicas</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isIncludedInPlan('CALL_BOT') ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                Incluido
                              </span>
                            ) : planKey === 'BASIC' ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-white font-medium">
                                {getAddonPrice('CALL_BOT')}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {!isIncludedInPlan('CALL_BOT') && planKey === 'BASIC' && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ⚡ Disponible gratis en planes Professional y Enterprise
                          </p>
                        )}
                      </div>

                      {/* Transferencia de llamadas */}
                      <div className={cn(
                        "p-4 border rounded-lg transition-all duration-200",
                        isIncludedInPlan('CALL_TRANSFER') 
                          ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/10" 
                          : planKey === 'BASIC'
                            ? "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20"
                            : "border-border"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <Zap className="h-4 w-4 text-primary" />
                              Transferencia de llamadas a humanos
                            </div>
                            <div className="text-sm text-muted-foreground">Derivar llamadas complejas a operadores humanos</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isIncludedInPlan('CALL_TRANSFER') ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                Incluido
                              </span>
                            ) : planKey === 'BASIC' ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                No disponible
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {planKey === 'BASIC' && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ⚡ Disponible en planes Professional y Enterprise
                          </p>
                        )}
                      </div>

                      {/* Multilingüismo */}
                      <div className={cn(
                        "p-4 border rounded-lg transition-all duration-200 col-span-full",
                        isIncludedInPlan('MULTILANGUAGE') 
                          ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/10" 
                          : "border-accent/30 hover:border-accent/50 hover:shadow-md"
                      )}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <Languages className="h-4 w-4 text-primary" />
                              Multilingüismo
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {isIncludedInPlan('MULTILANGUAGE') 
                                ? 'Todos los idiomas incluidos: ES/EN/FR/DE/PT/IT/AR' 
                                : `Pack completo: ${planKey === 'BASIC' ? '15€' : '10€'} | Por idioma: ${planKey === 'BASIC' ? '3€' : '2€'}`
                              }
                            </div>
                          </div>
                          {isIncludedInPlan('MULTILANGUAGE') && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              Incluido
                            </span>
                          )}
                        </div>
                        
                        {!isIncludedInPlan('MULTILANGUAGE') && (
                          <div className="space-y-4">
                            {/* Pack completo toggle */}
                            <div 
                              onClick={() => {
                                setSelectedAddons(prev => ({
                                  ...prev, 
                                  MULTILANGUAGE_PACK: !prev.MULTILANGUAGE_PACK,
                                  SELECTED_LANGUAGES: prev.MULTILANGUAGE_PACK ? [] : prev.SELECTED_LANGUAGES
                                }))
                              }}
                              className={cn(
                                "flex items-center justify-between p-3 border border-dashed rounded-lg cursor-pointer transition-all duration-200 hover:border-primary/50",
                                selectedAddons.MULTILANGUAGE_PACK ? "border-primary bg-primary/10" : "hover:bg-primary/5"
                              )}
                            >
                              <div>
                                <div className="font-medium text-sm">Pack completo</div>
                                <div className="text-xs text-muted-foreground">Todos los idiomas disponibles</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{planKey === 'BASIC' ? '15€' : '10€'}</span>
                                <div className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                  selectedAddons.MULTILANGUAGE_PACK 
                                    ? "border-amber-600 bg-amber-600" 
                                    : "border-gray-300 hover:border-amber-600"
                                )}>
                                  {selectedAddons.MULTILANGUAGE_PACK && (
                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Idiomas individuales */}
                            <div>
                              <div className="text-sm font-medium mb-2">O elige idiomas específicos:</div>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { code: 'en', name: 'English' },
                                  { code: 'fr', name: 'Français' },
                                  { code: 'de', name: 'Deutsch' },
                                  { code: 'pt', name: 'Português' },
                                  { code: 'it', name: 'Italiano' },
                                  { code: 'ar', name: 'العربية' }
                                ].map(lang => (
                                  <button
                                    key={lang.code}
                                    type="button"
                                    disabled={selectedAddons.MULTILANGUAGE_PACK}
                                    onClick={() => {
                                      setSelectedAddons(prev => ({
                                        ...prev,
                                        SELECTED_LANGUAGES: prev.SELECTED_LANGUAGES.includes(lang.code)
                                          ? prev.SELECTED_LANGUAGES.filter(l => l !== lang.code)
                                          : [...prev.SELECTED_LANGUAGES, lang.code]
                                      }))
                                    }}
                                    className={cn(
                                      "p-2 text-xs border rounded transition-all",
                                      selectedAddons.MULTILANGUAGE_PACK 
                                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : selectedAddons.SELECTED_LANGUAGES.includes(lang.code)
                                          ? "border-primary bg-primary/10 text-primary"
                                          : "border-border hover:border-primary/50"
                                    )}
                                  >
                                    {lang.name}
                                  </button>
                                ))}
                              </div>
                              {selectedAddons.SELECTED_LANGUAGES.length > 0 && !selectedAddons.MULTILANGUAGE_PACK && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Coste: {selectedAddons.SELECTED_LANGUAGES.length} idiomas × {planKey === 'BASIC' ? '3€' : '2€'} = {selectedAddons.SELECTED_LANGUAGES.length * (planKey === 'BASIC' ? 3 : 2)}€
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Grabación de Llamadas */}
                      <div 
                        onClick={() => !isIncludedInPlan('CALL_RECORDING') ? toggleAddon('CALL_RECORDING') : null}
                        className={cn(
                          "p-4 border rounded-lg transition-all duration-200",
                          isIncludedInPlan('CALL_RECORDING') 
                            ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/10" 
                            : "border-accent/30 hover:border-accent/50 hover:shadow-md cursor-pointer",
                          !isIncludedInPlan('CALL_RECORDING') && selectedAddons.CALL_RECORDING 
                            ? "border-primary bg-primary/10" 
                            : ""
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <Mic className="h-4 w-4 text-primary" />
                              Grabación llamadas
                              {!isIncludedInPlan('CALL_RECORDING') && selectedAddons.CALL_RECORDING && (
                                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Guarda y analiza todas las conversaciones</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isIncludedInPlan('CALL_RECORDING') ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                Incluido
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-white font-medium">
                                {getAddonPrice('CALL_RECORDING')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* IA Chat Personalizada */}
                      <div 
                        onClick={() => !isIncludedInPlan('CUSTOM_AI_CHAT') ? toggleAddon('CUSTOM_AI_CHAT') : null}
                        className={cn(
                          "p-4 border rounded-lg transition-all duration-200",
                          isIncludedInPlan('CUSTOM_AI_CHAT') 
                            ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/10" 
                            : "border-accent/30 hover:border-accent/50 hover:shadow-md cursor-pointer",
                          !isIncludedInPlan('CUSTOM_AI_CHAT') && selectedAddons.CUSTOM_AI_CHAT 
                            ? "border-primary bg-primary/10" 
                            : ""
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <Bot className="h-4 w-4 text-primary" />
                              IA chat integrable personalizada
                              {!isIncludedInPlan('CUSTOM_AI_CHAT') && selectedAddons.CUSTOM_AI_CHAT && (
                                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Widget embebible para tu sitio web</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isIncludedInPlan('CUSTOM_AI_CHAT') ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                Incluido
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-white font-medium">
                                {getAddonPrice('CUSTOM_AI_CHAT')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Gestión de Personal */}
                      <div 
                        onClick={() => !isIncludedInPlan('STAFF_MANAGEMENT') ? toggleAddon('STAFF_MANAGEMENT') : null}
                        className={cn(
                          "p-4 border rounded-lg transition-all duration-200",
                          isIncludedInPlan('STAFF_MANAGEMENT') 
                            ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/10" 
                            : "border-accent/30 hover:border-accent/50 hover:shadow-md cursor-pointer",
                          !isIncludedInPlan('STAFF_MANAGEMENT') && selectedAddons.STAFF_MANAGEMENT 
                            ? "border-primary bg-primary/10" 
                            : ""
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              Gestión de personal
                              {!isIncludedInPlan('STAFF_MANAGEMENT') && selectedAddons.STAFF_MANAGEMENT && (
                                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Registro de horarios, vacaciones y ausencias</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isIncludedInPlan('STAFF_MANAGEMENT') ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                Incluido
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-white font-medium">
                                {getAddonPrice('STAFF_MANAGEMENT')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Gestión de Tareas */}
                      <div 
                        onClick={() => !isIncludedInPlan('TASK_MANAGEMENT') && planKey !== 'BASIC' ? toggleAddon('TASK_MANAGEMENT') : null}
                        className={cn(
                          "p-4 border rounded-lg transition-all duration-200",
                          isIncludedInPlan('TASK_MANAGEMENT') 
                            ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/10" 
                            : planKey === 'BASIC'
                              ? "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20"
                              : "border-accent/30 hover:border-accent/50 hover:shadow-md cursor-pointer",
                          !isIncludedInPlan('TASK_MANAGEMENT') && planKey !== 'BASIC' && selectedAddons.TASK_MANAGEMENT 
                            ? "border-primary bg-primary/10" 
                            : ""
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              Gestión de tareas
                              {!isIncludedInPlan('TASK_MANAGEMENT') && planKey !== 'BASIC' && selectedAddons.TASK_MANAGEMENT && (
                                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Distribuye las tareas entre el equipo</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isIncludedInPlan('TASK_MANAGEMENT') ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                Incluido
                              </span>
                            ) : planKey === 'BASIC' ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                No disponible
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-white font-medium">
                                {getAddonPrice('TASK_MANAGEMENT')}
                              </span>
                            )}
                          </div>
                        </div>
                        {planKey === 'BASIC' && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ⚡ Disponible en planes Professional y Enterprise
                          </p>
                        )}
                      </div>

                      {/* Estadísticas de Personal y Monitoreo */}
                      <div 
                        onClick={() => !isIncludedInPlan('REAL_TIME_STATS') && planKey !== 'BASIC' ? toggleAddon('REAL_TIME_STATS') : null}
                        className={cn(
                          "p-4 border rounded-lg transition-all duration-200",
                          isIncludedInPlan('REAL_TIME_STATS') 
                            ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/10" 
                            : planKey === 'BASIC'
                              ? "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20"
                              : "border-accent/30 hover:border-accent/50 hover:shadow-md cursor-pointer",
                          !isIncludedInPlan('REAL_TIME_STATS') && planKey !== 'BASIC' && selectedAddons.REAL_TIME_STATS 
                            ? "border-primary bg-primary/10" 
                            : ""
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-primary" />
                              Estadísticas de personal y monitoreo en tiempo real
                              {!isIncludedInPlan('REAL_TIME_STATS') && planKey !== 'BASIC' && selectedAddons.REAL_TIME_STATS && (
                                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Gestiona el rendimiento del equipo</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isIncludedInPlan('REAL_TIME_STATS') ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                Incluido
                              </span>
                            ) : planKey === 'BASIC' ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                No disponible
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-white font-medium">
                                {getAddonPrice('REAL_TIME_STATS')}
                              </span>
                            )}
                          </div>
                        </div>
                        {planKey === 'BASIC' && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ⚡ Disponible en planes Professional y Enterprise
                          </p>
                        )}
                      </div>

                      {/* Estadísticas Análisis Avanzado */}
                      <div 
                        onClick={() => !isIncludedInPlan('ADVANCED_ANALYTICS') && planKey !== 'BASIC' ? toggleAddon('ADVANCED_ANALYTICS') : null}
                        className={cn(
                          "p-4 border rounded-lg transition-all duration-200",
                          isIncludedInPlan('ADVANCED_ANALYTICS') 
                            ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/10" 
                            : planKey === 'BASIC'
                              ? "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20"
                              : "border-accent/30 hover:border-accent/50 hover:shadow-md cursor-pointer",
                          !isIncludedInPlan('ADVANCED_ANALYTICS') && planKey !== 'BASIC' && selectedAddons.ADVANCED_ANALYTICS 
                            ? "border-primary bg-primary/10" 
                            : ""
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              Estadísticas análisis avanzado llamadas
                              {!isIncludedInPlan('ADVANCED_ANALYTICS') && planKey !== 'BASIC' && selectedAddons.ADVANCED_ANALYTICS && (
                                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Analiza mejor tu perfil de clientes, palabras clave, etc.</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isIncludedInPlan('ADVANCED_ANALYTICS') ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                Incluido
                              </span>
                            ) : planKey === 'BASIC' ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                No disponible
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-white font-medium">
                                {getAddonPrice('ADVANCED_ANALYTICS')}
                              </span>
                            )}
                          </div>
                        </div>
                        {planKey === 'BASIC' && (
                          <p className="text-xs text-muted-foreground mt-2">
                            ⚡ Disponible en planes Professional y Enterprise
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upgrade CTA */}
                  {planKey === 'BASIC' && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 rounded-xl border border-accent/20">
                      <div className="text-center">
                        <Crown className="h-8 w-8 mx-auto mb-3 text-accent" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          ¡Ahorra más con un plan superior!
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Muchas funcionalidades premium están incluidas gratis en Professional y Enterprise
                        </p>
                        <div className="flex justify-center gap-3">
                          <Button 
                            onClick={() => setSubscriptionPlan('premium')}
                            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                          >
                            Cambiar a Professional
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setSubscriptionPlan('enterprise')}
                            className="border-accent/30 text-accent hover:bg-accent/10"
                          >
                            Ver Enterprise
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumen dinámico */}
                  <div className="mt-8 p-4 border rounded-lg bg-muted/30">
                    <div className="font-semibold mb-2">Resumen</div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Incluido en tu plan</div>
                        <ul className="text-sm list-disc ml-5 space-y-1">
                          <li>Usuarios incluidos: {planLimits?.[planKey]?.max_users ?? '—'}</li>
                          <li>Almacenamiento base: {planKey === 'BASIC' ? '2GB' : planKey === 'PREMIUM' ? '5GB' : '10GB'}</li>
                          <li>Recordatorios base: {planKey === 'BASIC' ? '50' : planKey === 'PREMIUM' ? '200' : '1000'} mensajes</li>
                          {isIncludedInPlan('CALL_BOT') && <li>Bot de llamadas incluido</li>}
                          {isIncludedInPlan('CALL_TRANSFER') && <li>Transferencia de llamadas incluida</li>}
                          {isIncludedInPlan('MULTILANGUAGE') && <li>Multilingüismo incluido</li>}
                          {isIncludedInPlan('CALL_RECORDING') && <li>Grabación de llamadas incluida</li>}
                          {isIncludedInPlan('CUSTOM_AI_CHAT') && <li>IA chat personalizada incluida</li>}
                          {isIncludedInPlan('STAFF_MANAGEMENT') && <li>Gestión de personal incluida</li>}
                          {isIncludedInPlan('TASK_MANAGEMENT') && <li>Gestión de tareas incluida</li>}
                          {isIncludedInPlan('REAL_TIME_STATS') && <li>Estadísticas en tiempo real incluidas</li>}
                          {isIncludedInPlan('ADVANCED_ANALYTICS') && <li>Análisis avanzado incluido</li>}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Añades ahora</div>
                        <ul className="text-sm list-disc ml-5 space-y-1">
                          {selectedAddons.EXTRA_USERS > 0 && <li>Usuarios extra: {selectedAddons.EXTRA_USERS * 5}</li>}
                          {selectedAddons.EXTRA_STORAGE > 0 && <li>Almacenamiento extra: {selectedAddons.EXTRA_STORAGE} GB</li>}
                          {selectedAddons.EXTRA_AUTOMATIONS > 0 && <li>Automatizaciones extra: {selectedAddons.EXTRA_AUTOMATIONS} automatizaciones</li>}
                          {selectedAddons.EXTRA_REMINDERS > 0 && <li>Recordatorios extra: {selectedAddons.EXTRA_REMINDERS} mensajes</li>}
                          {!isIncludedInPlan('CALL_BOT') && selectedAddons.CALL_BOT && <li>Bot de llamadas</li>}
                          {!isIncludedInPlan('MULTILANGUAGE') && (selectedAddons.MULTILANGUAGE_PACK || selectedAddons.SELECTED_LANGUAGES.length > 0) && (
                            <li>
                              Multilingüismo: {selectedAddons.MULTILANGUAGE_PACK 
                                ? 'Pack completo' 
                                : `${selectedAddons.SELECTED_LANGUAGES.join(', ').toUpperCase()}`
                              }
                            </li>
                          )}
                          {!isIncludedInPlan('CALL_RECORDING') && selectedAddons.CALL_RECORDING && <li>Grabación de llamadas</li>}
                          {!isIncludedInPlan('CUSTOM_AI_CHAT') && selectedAddons.CUSTOM_AI_CHAT && <li>IA chat personalizada</li>}
                          {!isIncludedInPlan('STAFF_MANAGEMENT') && selectedAddons.STAFF_MANAGEMENT && <li>Gestión de personal</li>}
                          {!isIncludedInPlan('TASK_MANAGEMENT') && selectedAddons.TASK_MANAGEMENT && <li>Gestión de tareas</li>}
                          {!isIncludedInPlan('REAL_TIME_STATS') && selectedAddons.REAL_TIME_STATS && <li>Estadísticas en tiempo real</li>}
                          {!isIncludedInPlan('ADVANCED_ANALYTICS') && selectedAddons.ADVANCED_ANALYTICS && <li>Análisis avanzado</li>}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 border-t pt-3">
                      <div className="text-sm font-semibold mb-1">Coste mensual estimado</div>
                      {(() => {
                        const base = getPlanBasePrice()
                        const pUsers = calculateAddonPrice('EXTRA_USERS')
                        const pStorage = calculateAddonPrice('EXTRA_STORAGE')
                        const pAutomations = calculateAddonPrice('EXTRA_AUTOMATIONS')
                        const pCallBot = calculateAddonPrice('CALL_BOT')
                        const pReminders = calculateAddonPrice('EXTRA_REMINDERS')
                        const pMultilang = calculateAddonPrice('MULTILANGUAGE')
                        const pCallRec = calculateAddonPrice('CALL_RECORDING')
                        const pAiChat = calculateAddonPrice('CUSTOM_AI_CHAT')
                        const pStaff = calculateAddonPrice('STAFF_MANAGEMENT')
                        const pTasks = calculateAddonPrice('TASK_MANAGEMENT')
                        const pStats = calculateAddonPrice('REAL_TIME_STATS')
                        const pAnalytics = calculateAddonPrice('ADVANCED_ANALYTICS')
                        const total = base + pUsers + pStorage + pAutomations + pCallBot + pReminders + pMultilang + pCallRec + pAiChat + pStaff + pTasks + pStats + pAnalytics
                        const fmt = (n: number) => `€${n.toFixed(2)}`
                        return (
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between"><span>Plan</span><span>{fmt(base)}</span></div>
                            {pUsers > 0 && <div className="flex justify-between"><span>Usuarios extra</span><span>{fmt(pUsers)}</span></div>}
                            {pStorage > 0 && <div className="flex justify-between"><span>Almacenamiento extra</span><span>{fmt(pStorage)}</span></div>}
                            {pAutomations > 0 && <div className="flex justify-between"><span>Automatizaciones extra</span><span>{fmt(pAutomations)}</span></div>}
                            {pCallBot > 0 && <div className="flex justify-between"><span>Bot de llamadas</span><span>{fmt(pCallBot)}</span></div>}
                            {pReminders > 0 && <div className="flex justify-between"><span>Recordatorios extra</span><span>{fmt(pReminders)}</span></div>}
                            {pMultilang > 0 && <div className="flex justify-between"><span>Multilingüismo</span><span>{fmt(pMultilang)}</span></div>}
                            {pCallRec > 0 && <div className="flex justify-between"><span>Grabación llamadas</span><span>{fmt(pCallRec)}</span></div>}
                            {pAiChat > 0 && <div className="flex justify-between"><span>IA chat personalizada</span><span>{fmt(pAiChat)}</span></div>}
                            {pStaff > 0 && <div className="flex justify-between"><span>Gestión de personal</span><span>{fmt(pStaff)}</span></div>}
                            {pTasks > 0 && <div className="flex justify-between"><span>Gestión de tareas</span><span>{fmt(pTasks)}</span></div>}
                            {pStats > 0 && <div className="flex justify-between"><span>Estadísticas tiempo real</span><span>{fmt(pStats)}</span></div>}
                            {pAnalytics > 0 && <div className="flex justify-between"><span>Análisis avanzado</span><span>{fmt(pAnalytics)}</span></div>}
                            <div className="flex justify-between font-bold pt-1 border-t"><span>Total</span><span>{fmt(total)}</span></div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="border-border hover:bg-muted"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('auth_back')}
                    </Button>
                    <Button
                      onClick={handleNextToCompany}
                      className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      {t('auth_continue')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Paso 3: Super Admin */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border border-primary/20 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/15 to-accent/20 rounded-full flex items-center justify-center shadow-md mb-4"
                  >
                    <Users className="h-8 w-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-2xl text-foreground">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {t('auth_admin_step_title')}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('auth_admin_step_subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFinalSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fullName" className="text-foreground">
                          {t('auth_full_name_label')} *
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="mt-1 bg-background border-border focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userEmail" className="text-foreground">
                          {t('auth_email_label')} *
                        </Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          required
                          className="mt-1 bg-background border-border focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-foreground">
                          {t('auth_password_label')} *
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="mt-1 bg-background border-border focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-foreground">
                          {t('auth_confirm_password_label')} *
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="mt-1 bg-background border-border focus:border-primary"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                          <AlertDescription className="text-green-800 dark:text-green-200">
                            {success}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(3)}
                        className="border-border hover:bg-muted"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('auth_back_button')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading || !fullName || !userEmail || !password || !confirmPassword}
                        className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {loading ? t('auth_loading_signup') : t('auth_signup_button')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {t('auth_already_have_account')}{' '}
            <Link
              href="/auth/login-mt"
              className="text-accent hover:text-accent/80 hover:underline font-medium transition-colors duration-300"
            >
              {t('auth_login_link')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}


