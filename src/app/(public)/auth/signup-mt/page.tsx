'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { useTranslation } from '@/hooks/use-translation'
import { Building2, Users, Crown, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Cliente Supabase
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

const plans = [
  {
    id: 'basic',
    name: 'auth_plan_basic',
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
    name: 'auth_plan_premium',
    icon: Crown,
    price: '€99/mo',
    popular: true,
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
    name: 'auth_plan_enterprise',
    icon: Building2,
    price: 'Custom',
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

      // Verificar que no existe una empresa con el mismo email
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('email', companyEmail)
        .single()

      if (existingCompany) {
        setError(t('auth_error_company_exists'))
        return
      }

      // Verificar que no existe un usuario con el mismo email
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (existingUser) {
        setError(t('auth_error_user_exists'))
        return
      }

      // Crear la empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          email: companyEmail,
          phone: companyPhone || null,
          website: companyWebsite || null,
          subscription_plan: subscriptionPlan,
          is_active: true
        })
        .select()
        .single()

      if (companyError || !company) {
        setError('Error al crear la empresa: ' + (companyError?.message || 'Unknown error'))
        return
      }

      // Crear el usuario super admin
      // En lugar de usar Supabase Auth, insertar directamente en nuestra tabla
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          company_id: company.id,
          email: userEmail,
          full_name: fullName,
          role: 'super_admin',
          is_active: true,
          // En producción, hashear la contraseña
          password_hash: password // TEMPORAL: En producción usar bcrypt
        })
        .select()
        .single()

      if (userError) {
        setError('Error al crear el usuario: ' + userError.message)
        return
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

  const slideVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <Building2 className="h-8 w-8 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {t('auth_signup_title')}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {t('auth_signup_subtitle')}
              </CardDescription>
            </div>
            
            {/* Progress indicator */}
            <div className="flex justify-center space-x-4 mt-6">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= stepNum
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > stepNum ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    stepNum
                  )}
                </div>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Plan Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">
                      {t('auth_plan_selection_title')}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                      const Icon = plan.icon
                      return (
                        <motion.div
                          key={plan.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative cursor-pointer`}
                          onClick={() => handlePlanSelect(plan.id as any)}
                        >
                          <Card className={`transition-all duration-200 ${
                            subscriptionPlan === plan.id
                              ? 'ring-2 ring-primary bg-primary/5'
                              : 'hover:shadow-md border-border'
                          }`}>
                            {plan.popular && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                                  {t('home_plan_most_popular')}
                                </span>
                              </div>
                            )}
                            <CardHeader className="text-center">
                              <Icon className="w-8 h-8 mx-auto text-primary mb-2" />
                              <CardTitle className="text-lg">
                                {t(plan.name as any)}
                              </CardTitle>
                              <div className="text-2xl font-bold text-foreground">
                                {plan.price}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-center">
                                    <CheckCircle2 className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                                    {t(feature)}
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Company Information */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">
                      {t('auth_company_step_title')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('auth_company_step_subtitle')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-foreground">
                        {t('auth_company_name_label')}
                      </Label>
                      <Input
                        id="companyName"
                        placeholder={t('auth_company_name_placeholder')}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="bg-background border-border focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyEmail" className="text-foreground">
                        {t('auth_company_email_label')}
                      </Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        placeholder={t('auth_email_placeholder')}
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        required
                        className="bg-background border-border focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyPhone" className="text-foreground">
                        {t('auth_company_phone_label')}
                      </Label>
                      <Input
                        id="companyPhone"
                        type="tel"
                        placeholder={t('auth_company_phone_placeholder')}
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="bg-background border-border focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite" className="text-foreground">
                        {t('auth_company_website_label')}
                      </Label>
                      <Input
                        id="companyWebsite"
                        type="url"
                        placeholder={t('auth_company_website_placeholder')}
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="bg-background border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex items-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('auth_back_button')}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextToAdmin}
                      disabled={!companyName || !companyEmail}
                      className="flex items-center"
                    >
                      {t('auth_next_button')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Admin Account */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">
                      {t('auth_admin_step_title')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('auth_admin_step_subtitle')}
                    </p>
                  </div>

                  <form onSubmit={handleFinalSubmit} className="space-y-4">
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
                        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>{success}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-foreground">
                          {t('auth_full_name_label')}
                        </Label>
                        <Input
                          id="fullName"
                          placeholder={t('auth_full_name_placeholder')}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="bg-background border-border focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userEmail" className="text-foreground">
                          {t('auth_email_label')}
                        </Label>
                        <Input
                          id="userEmail"
                          type="email"
                          placeholder={t('auth_email_placeholder')}
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          required
                          className="bg-background border-border focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">
                          {t('auth_password_label')}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={t('auth_password_placeholder')}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-background border-border focus:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground">
                          {t('auth_confirm_password_label')}
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder={t('auth_password_placeholder')}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="bg-background border-border focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex items-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('auth_back_button')}
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex items-center"
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        )}
                        {loading ? t('auth_loading_signup') : t('auth_signup_button')}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login link */}
            <div className="text-center text-sm border-t border-border pt-4">
              <span className="text-muted-foreground">{t('auth_already_have_account')} </span>
              <Link href="/auth/login-mt" className="text-primary hover:underline font-medium">
                {t('auth_login_link')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
