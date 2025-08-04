// Hook para manejo de autenticación multi-tenant
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { Database, User, Company } from '@/types/database'

// Cliente Supabase configurado para local
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AuthUser extends User {
  company: Company
}

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, companyData: {
    companyName: string
    fullName: string
  }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  isRole: (role: string) => boolean
  switchCompanyContext: (companyId: string) => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar usuario al inicializar
  useEffect(() => {
    checkUser()
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserWithCompany(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Verificar si hay usuario logueado
  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserWithCompany(session.user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar usuario con datos de empresa
  async function loadUserWithCompany(userId: string) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('id', userId)
        .single()

      if (userError) throw userError

      if (userData && userData.company) {
        // Configurar contexto de empresa para RLS
        await supabase.rpc('set_current_company', { 
          company_id: userData.company_id 
        })

        setUser(userData as AuthUser)
      }
    } catch (error) {
      console.error('Error loading user:', error)
      setUser(null)
    }
  }

  // Iniciar sesión
  async function signIn(email: string, password: string) {
    try {
      setLoading(true)
      
      // Primero verificar si el usuario existe en nuestra tabla
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (!existingUser) {
        return { error: 'Usuario no encontrado' }
      }

      // Usar auth de Supabase (esto requerirá configuración adicional)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Error signing in:', error)
      return { error: 'Error al iniciar sesión' }
    } finally {
      setLoading(false)
    }
  }

  // Registrar nuevo usuario y empresa
  async function signUp(
    email: string, 
    password: string, 
    companyData: { companyName: string; fullName: string }
  ) {
    try {
      setLoading(true)

      // Primero crear la empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyData.companyName,
          email: email, // Email de la empresa será el del primer usuario
          subscription_plan: 'basic'
        })
        .select()
        .single()

      if (companyError) {
        return { error: companyError.message }
      }

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) {
        return { error: authError.message }
      }

      if (authData.user) {
        // Crear usuario en nuestra tabla
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            company_id: company.id,
            email,
            full_name: companyData.fullName,
            role: 'super_admin', // Primer usuario es super admin
            email_verified: true
          })

        if (userError) {
          return { error: userError.message }
        }
      }

      return {}
    } catch (error) {
      console.error('Error signing up:', error)
      return { error: 'Error al registrarse' }
    } finally {
      setLoading(false)
    }
  }

  // Cerrar sesión
  async function signOut() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  // Verificar si el usuario tiene un permiso
  function hasPermission(permission: string): boolean {
    if (!user) return false
    
    // Super admin tiene todos los permisos
    if (user.role === 'super_admin') return true
    
    // TODO: Verificar permisos específicos del usuario
    // Esto requerirá cargar los permisos del usuario
    return false
  }

  // Verificar rol del usuario
  function isRole(role: string): boolean {
    return user?.role === role
  }

  // Cambiar contexto de empresa (para super admin que gestiona múltiples empresas)
  async function switchCompanyContext(companyId: string) {
    try {
      await supabase.rpc('set_current_company', { company_id: companyId })
      // Recargar datos del usuario con nueva empresa
      if (user) {
        await loadUserWithCompany(user.id)
      }
    } catch (error) {
      console.error('Error switching company context:', error)
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission,
    isRole,
    switchCompanyContext
  }
}

// Hook para obtener usuarios de la empresa actual
export function useCompanyUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.company_id) {
      loadCompanyUsers()
    }
  }, [user?.company_id])

  async function loadCompanyUsers() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', user?.company_id!)
        .order('created_at', { ascending: true })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading company users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo usuario en la empresa
  async function createUser(userData: {
    email: string
    fullName: string
    role: string
  }) {
    try {
      if (!user?.company_id) throw new Error('No company context')

      const { data, error } = await supabase
        .from('users')
        .insert({
          company_id: user.company_id,
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role as any,
          email_verified: false
        })
        .select()
        .single()

      if (error) throw error
      
      // Recargar lista
      await loadCompanyUsers()
      return { data, error: null }
    } catch (error) {
      console.error('Error creating user:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Actualizar usuario
  async function updateUser(userId: string, updates: Partial<User>) {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) throw error
      
      // Recargar lista
      await loadCompanyUsers()
      return { error: null }
    } catch (error) {
      console.error('Error updating user:', error)
      return { error: (error as Error).message }
    }
  }

  // Eliminar usuario (soft delete)
  async function deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
      
      // Recargar lista
      await loadCompanyUsers()
      return { error: null }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { error: (error as Error).message }
    }
  }

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    reload: loadCompanyUsers
  }
}
