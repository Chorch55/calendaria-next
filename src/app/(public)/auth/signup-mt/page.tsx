'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTranslation } from '@/hooks/use-translation'
import { Building2, Users, Crown, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [step, setStep] = useState(1) // 1: Plan, 2: Company, 3: Admin
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { t } = useTranslation()

  // Datos del plan
  const [subscriptionPlan, setSubscriptionPlan] = useState<'basic' | 'premium' | 'enterprise'>('premium')

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

  function handleNextToAdmin() {
    if (companyName && companyEmail) {
      setStep(3)
      // Pre-llenar el email del usuario con el de la empresa si está vacío
      if (!userEmail) {
        setUserEmail(companyEmail)
      }
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
            {[1, 2, 3].map((stepNumber) => (
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
                {stepNumber < 3 && (
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
              {step === 3 && "Crear Administrador"}
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

          {/* Paso 3: Super Admin */}
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
                        onClick={() => setStep(2)}
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


