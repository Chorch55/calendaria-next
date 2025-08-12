
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
import { Building2, Users, Crown, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlanKey } from '@/config/billing'

// Planes disponibles
const PLANS = [
  {
    id: 'basic',
    name: 'home_plan_individual_name',
    icon: Users,
    price: '€19/mo',
    features: [
      'home_plan_feature_individual_user',
      'home_plan_feature_email_whatsapp', 
      'home_plan_feature_calendar_management',
      'home_plan_feature_task_management',
      'home_plan_feature_contact_management',
      'home_plan_feature_ai_basic'
    ]
  },
  {
    id: 'premium',
    name: 'home_plan_professional_name',
    icon: Crown,
    price: '€99/mo',
    features: [
      'home_plan_feature_professional_users',
      'home_plan_feature_shared_inbox',
      'home_plan_feature_team_collaboration',
      'home_plan_feature_ai_advanced',
      'home_plan_feature_ai_logs',
      'home_plan_feature_priority_support'
    ]
  },
  {
    id: 'enterprise',
    name: 'home_plan_enterprise_name',
    icon: Building2,
    price: '€299/mo',
    features: [
      'home_plan_feature_enterprise_users',
      'home_plan_feature_admin_controls',
      'home_plan_feature_full_customization',
      'home_plan_feature_billing_management',
      'home_plan_feature_custom_workflows',
      'home_plan_feature_dedicated_support'
    ]
  }
]

export default function SignupMultiTenantPage() {
  const [step, setStep] = useState(1) // 1: Plan, 2: Company, 3: Add-ons, 4: Admin
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  // Datos del plan
  const [subscriptionPlan, setSubscriptionPlan] = useState<'basic' | 'premium' | 'enterprise'>('premium')

  // Public billing config (for UI)
  const [addonDisplay, setAddonDisplay] = useState<Record<string, { unit: string; monthly?: string; monthlyByPlan?: Record<PlanKey, string> }> | null>(null)
  const [planLimits, setPlanLimits] = useState<Record<PlanKey, any> | null>(null)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/config/plans')
        if (!res.ok) return
        const json = await res.json()
        if (mounted) {
          setAddonDisplay(json.addonDisplay || null)
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
  const getAddonUnitPrice = (key: string): number => {
    const cfg = addonDisplay?.[key]
    if (!cfg) return 0
    const raw = cfg.monthlyByPlan?.[planKey] || cfg.monthly
    return parseEuro(raw)
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
    setStep(2)
  }

  function handleNextToAddons() {
    if (companyName && companyEmail) {
      setStep(3)
    }
  }

  type AddonsSelection = {
    EXTRA_USERS: number
    EXTRA_STORAGE: number
    API_CALLS: number
    INTEGRATIONS: number
    CUSTOM_BRANDING: boolean
  }

  const [selectedAddons, setSelectedAddons] = useState<AddonsSelection>({
    EXTRA_USERS: 0,
    EXTRA_STORAGE: 0,
    API_CALLS: 0,
    INTEGRATIONS: 0,
    CUSTOM_BRANDING: false,
  })

  // App integrations picker -> maps to INTEGRATIONS quantity
  const APPS = [
    { key: 'gmail', label: 'Gmail' },
    { key: 'outlook', label: 'Outlook' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'sms', label: 'SMS' },
    { key: 'n8n', label: 'n8n' },
  ]
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const toggleApp = (k: string) => setSelectedApps(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  useEffect(() => {
    setSelectedAddons(prev => ({ ...prev, INTEGRATIONS: selectedApps.length }))
  }, [selectedApps])

  function incAddon<K extends keyof AddonsSelection>(key: K, delta = 1) {
    setSelectedAddons((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'number' ? Math.max(0, (prev[key] as number) + delta) : prev[key],
    }))
  }

  function toggleBranding() {
    setSelectedAddons((p) => ({ ...p, CUSTOM_BRANDING: !p.CUSTOM_BRANDING }))
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
      const addonsToSend = { ...selectedAddons, INTEGRATIONS: selectedApps.length }
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
  selectedAddons: addonsToSend,
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
              {step === 2 && "Información de Empresa"}
              {step === 3 && "Personalizar Add-ons"}
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
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                            {plan.price}
                          </p>
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

          {/* Paso 2: Información de la Empresa */}
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
                      onClick={() => setStep(1)}
                      className="border-border hover:bg-muted"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('auth_back')}
                    </Button>
                    <Button
                      onClick={handleNextToAddons}
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

          {/* Paso 3: Add-ons */}
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
                    <Crown className="h-8 w-8 text-primary" />
                  </motion.div>
                  <CardTitle className="text-2xl text-foreground">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {t('auth_addons_step_title') || 'Personaliza tus add-ons'}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('auth_addons_step_subtitle') || 'Puedes ampliar usuarios, almacenamiento, API calls e integraciones. Branding personalizado opcional.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Extra Users */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">Usuarios extra</div>
                          <div className="text-sm text-muted-foreground">Añade más asientos para tu equipo</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => incAddon('EXTRA_USERS', -1)}>-</Button>
                          <div className="w-10 text-center">{selectedAddons.EXTRA_USERS}</div>
                          <Button variant="outline" onClick={() => incAddon('EXTRA_USERS', 1)}>+</Button>
                        </div>
                      </div>
                      {addonDisplay?.EXTRA_USERS && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {(addonDisplay.EXTRA_USERS.monthlyByPlan?.[planKey] || addonDisplay.EXTRA_USERS.monthly)}/pack (5 usuarios)
                        </div>
                      )}
                      {planLimits?.[planKey]?.max_users != null && (
                        <div className="mt-1 text-xs text-muted-foreground">Incluidos en tu plan: {planLimits[planKey].max_users}</div>
                      )}
                    </div>
                    {/* Extra Storage */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">Almacenamiento extra (GB)</div>
                          <div className="text-sm text-muted-foreground">Espacio adicional para archivos</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => incAddon('EXTRA_STORAGE', -1)}>-</Button>
                          <div className="w-10 text-center">{selectedAddons.EXTRA_STORAGE}</div>
                          <Button variant="outline" onClick={() => incAddon('EXTRA_STORAGE', 1)}>+</Button>
                        </div>
                      </div>
                      {addonDisplay?.EXTRA_STORAGE && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {(addonDisplay.EXTRA_STORAGE.monthlyByPlan?.[planKey] || addonDisplay.EXTRA_STORAGE.monthly)}/{addonDisplay.EXTRA_STORAGE.unit}
                        </div>
                      )}
                    </div>
                    {/* API Calls */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">Llamadas API extra (x1000)</div>
                          <div className="text-sm text-muted-foreground">Más capacidad de uso mensual</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => incAddon('API_CALLS', -1)}>-</Button>
                          <div className="w-10 text-center">{selectedAddons.API_CALLS}</div>
                          <Button variant="outline" onClick={() => incAddon('API_CALLS', 1)}>+</Button>
                        </div>
                      </div>
                      {addonDisplay?.API_CALLS && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {(addonDisplay.API_CALLS.monthlyByPlan?.[planKey] || addonDisplay.API_CALLS.monthly)}/{addonDisplay.API_CALLS.unit}
                        </div>
                      )}
                    </div>
                    {/* Integraciones (apps) */}
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium text-foreground mb-2">Aplicaciones</div>
                      <div className="text-sm text-muted-foreground mb-3">Selecciona las apps que quieres conectar</div>
                      <div className="flex flex-wrap gap-2">
                        {APPS.map(app => (
                          <button
                            key={app.key}
                            type="button"
                            onClick={() => toggleApp(app.key)}
                            className={`px-3 py-1 rounded-full text-sm border ${selectedApps.includes(app.key) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border'}`}
                          >
                            {app.label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">Seleccionadas: {selectedApps.length}</div>
                      {addonDisplay?.INTEGRATIONS && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {(addonDisplay.INTEGRATIONS.monthlyByPlan?.[planKey] || addonDisplay.INTEGRATIONS.monthly)}/{addonDisplay.INTEGRATIONS.unit}
                        </div>
                      )}
                    </div>
                    {/* Custom Branding */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">Branding personalizado</div>
                          <div className="text-sm text-muted-foreground">Colores y logos de tu marca</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {planKey === 'BASIC' ? (
                            <>
                              <button type="button" onClick={toggleBranding} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedAddons.CUSTOM_BRANDING ? 'bg-primary' : 'bg-muted'}`}>
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${selectedAddons.CUSTOM_BRANDING ? 'translate-x-5' : 'translate-x-1'}`} />
                              </button>
                              <span className="text-sm text-foreground">{selectedAddons.CUSTOM_BRANDING ? 'Activo' : 'Inactivo'}</span>
                            </>
                          ) : (
                            <span className="text-xs text-green-600">Incluido en tu plan</span>
                          )}
                        </div>
                      </div>
                      {planKey === 'BASIC' && addonDisplay?.CUSTOM_BRANDING && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          {addonDisplay.CUSTOM_BRANDING.monthlyByPlan?.[planKey] || addonDisplay.CUSTOM_BRANDING.monthly}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen dinámico */}
                  <div className="mt-8 p-4 border rounded-lg bg-muted/30">
                    <div className="font-semibold mb-2">Resumen</div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Incluido en tu plan</div>
                        <ul className="text-sm list-disc ml-5 space-y-1">
                          <li>Usuarios incluidos: {planLimits?.[planKey]?.max_users ?? '—'}</li>
                          <li>Branding: {planKey === 'BASIC' ? (selectedAddons.CUSTOM_BRANDING ? 'Activado' : 'No incluido') : 'Incluido'}</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Añades ahora</div>
                        <ul className="text-sm list-disc ml-5 space-y-1">
                          <li>Usuarios extra: {selectedAddons.EXTRA_USERS * 5}</li>
                          <li>Almacenamiento extra: {selectedAddons.EXTRA_STORAGE} GB</li>
                          <li>API extra: {selectedAddons.API_CALLS * 1000} llamadas</li>
                          <li>Apps conectadas: {selectedApps.length}{selectedApps.length ? ` (${selectedApps.join(', ')})` : ''}</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 border-t pt-3">
                      <div className="text-sm font-semibold mb-1">Coste mensual estimado</div>
                      {(() => {
                        const base = getPlanBasePrice()
                        const pUsers = getAddonUnitPrice('EXTRA_USERS') * selectedAddons.EXTRA_USERS
                        const pStorage = getAddonUnitPrice('EXTRA_STORAGE') * selectedAddons.EXTRA_STORAGE
                        const pApi = getAddonUnitPrice('API_CALLS') * selectedAddons.API_CALLS
                        const pApps = getAddonUnitPrice('INTEGRATIONS') * selectedApps.length
                        const pBrand = planKey === 'BASIC' && selectedAddons.CUSTOM_BRANDING ? getAddonUnitPrice('CUSTOM_BRANDING') : 0
                        const total = base + pUsers + pStorage + pApi + pApps + pBrand
                        const fmt = (n: number) => `€${n.toFixed(2)}`
                        return (
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between"><span>Plan</span><span>{fmt(base)}</span></div>
                            {pUsers > 0 && <div className="flex justify-between"><span>Usuarios extra</span><span>{fmt(pUsers)}</span></div>}
                            {pStorage > 0 && <div className="flex justify-between"><span>Almacenamiento extra</span><span>{fmt(pStorage)}</span></div>}
                            {pApi > 0 && <div className="flex justify-between"><span>API extra</span><span>{fmt(pApi)}</span></div>}
                            {pApps > 0 && <div className="flex justify-between"><span>Apps</span><span>{fmt(pApps)}</span></div>}
                            {pBrand > 0 && <div className="flex justify-between"><span>Branding</span><span>{fmt(pBrand)}</span></div>}
                            <div className="flex justify-between font-bold pt-1 border-t"><span>Total</span><span>{fmt(total)}</span></div>
                          </div>
                        )
                      })()}
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
                      onClick={() => { if (!userEmail) setUserEmail(companyEmail); setStep(4) }}
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


