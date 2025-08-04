'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { useTranslation } from '@/hooks/use-translation'
import { Building2, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'

// Cliente Supabase
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
)

export default function LoginMultiTenantPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { t } = useTranslation()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Buscar usuario en nuestra tabla
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('email', email)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single()

      if (userError || !userData) {
        setError(t('auth_error_user_not_found'))
        return
      }

      // Por ahora, validación simple de password (en producción usarías bcrypt)
      if (password !== 'demo123') {
        setError(t('auth_error_wrong_password'))
        return
      }

      // Actualizar último login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id)

      // Establecer contexto de empresa
      await supabase.rpc('set_current_company', { 
        company_id: userData.company_id 
      })

      // Guardar sesión en localStorage
      localStorage.setItem('calendaria_user', JSON.stringify({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        company_id: userData.company_id,
        company: userData.company
      }))

      // Redirigir al dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('Error en login:', error)
      setError(t('auth_error_login_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border border-primary/20 bg-gradient-to-br from-card via-card to-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/15 to-accent/20 rounded-full flex items-center justify-center shadow-md"
            >
              <Building2 className="h-8 w-8 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t('auth_login_title')}
                </span>
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {t('auth_login_subtitle')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  {t('auth_email_label')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth_email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/80 hover:to-accent/90 border-0 shadow-md hover:shadow-lg transition-all duration-300" 
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? t('auth_loading_login') : t('auth_login_button')}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">{t('auth_no_account')} </span>
                <Link href="/auth/signup-mt" className="text-accent hover:text-accent/80 hover:underline font-medium transition-colors duration-300">
                  {t('auth_signup_link')}
                </Link>
              </div>
            </form>

            {/* Información de demo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50"
            >
              <h4 className="font-semibold text-sm mb-2 text-foreground">
                {t('auth_demo_accounts_title')}
              </h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div>
                  <strong>{t('auth_demo_super_admin')}:</strong> superadmin@basiccompany.com
                </div>
                <div>
                  <strong>{t('auth_demo_admin')}:</strong> admin@basiccompany.com
                </div>
                <div>
                  <strong>{t('auth_demo_user')}:</strong> user@basiccompany.com
                </div>
                <div>
                  <strong>{t('auth_demo_password')}:</strong> demo123
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
