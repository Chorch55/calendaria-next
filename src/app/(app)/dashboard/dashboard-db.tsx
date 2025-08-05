'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Company, User } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CompanyWithStats extends Company {
  user_count: number
  active_users: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [companies, setCompanies] = useState<CompanyWithStats[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<string>('')

  useEffect(() => {
    if (session) {
      loadDashboardData()
    }
  }, [session])

  async function loadDashboardData() {
    try {
      setLoading(true)

      // Cargar empresas con estadísticas
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: true })

      if (companiesError) throw companiesError

      // Para cada empresa, obtener estadísticas de usuarios
      const companiesWithStats = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: userStats } = await supabase
            .from('users')
            .select('id, is_active')
            .eq('company_id', company.id)
            .is('deleted_at', null)

          return {
            ...company,
            user_count: userStats?.length || 0,
            active_users: userStats?.filter(u => u.is_active).length || 0
          }
        })
      )

      setCompanies(companiesWithStats)

      // Cargar usuarios de la primera empresa por defecto
      if (companiesWithStats.length > 0) {
        await loadCompanyUsers(companiesWithStats[0].id)
        setSelectedCompany(companiesWithStats[0].id)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCompanyUsers(companyId: string) {
    try {
      // Configurar contexto de empresa
      await supabase.rpc('set_current_company', { company_id: companyId })

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading company users:', error)
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'super_admin': return 'destructive'
      case 'admin': return 'default'
      case 'user': return 'secondary'
      case 'readonly': return 'outline'
      default: return 'secondary'
    }
  }

  function getPlanColor(plan: string) {
    switch (plan) {
      case 'basic': return 'secondary'
      case 'premium': return 'default'
      case 'enterprise': return 'destructive'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Multi-tenant</h1>
        <p className="text-muted-foreground">
          Vista general de todas las empresas y usuarios en Calendaria
        </p>
      </div>

      {/* Resumen de empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <Card 
            key={company.id} 
            className={`cursor-pointer transition-all ${
              selectedCompany === company.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              setSelectedCompany(company.id)
              loadCompanyUsers(company.id)
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{company.name}</CardTitle>
                <Badge variant={getPlanColor(company.subscription_plan)}>
                  {company.subscription_plan}
                </Badge>
              </div>
              <CardDescription>{company.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span>Total usuarios:</span>
                <span className="font-semibold">{company.user_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Usuarios activos:</span>
                <span className="font-semibold text-green-600">{company.active_users}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Límite usuarios:</span>
                <span className="font-semibold">{company.max_users}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estado:</span>
                <Badge variant={company.subscription_status === 'active' ? 'default' : 'destructive'}>
                  {company.subscription_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de usuarios de la empresa seleccionada */}
      {selectedCompany && (
        <Card>
          <CardHeader>
            <CardTitle>
              Usuarios de {companies.find(c => c.id === selectedCompany)?.name}
            </CardTitle>
            <CardDescription>
              Lista completa de usuarios de la empresa seleccionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.length === 0 ? (
                <p className="text-muted-foreground">No hay usuarios en esta empresa</p>
              ) : (
                users.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Creado: {new Date(user.created_at).toLocaleDateString()}
                        {user.last_login && ` • Último login: ${new Date(user.last_login).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.is_active ? 'default' : 'destructive'}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {user.email_verified && (
                        <Badge variant="outline">
                          ✓ Verificado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón para recargar datos */}
      <div className="flex justify-center">
        <Button onClick={loadDashboardData} disabled={loading}>
          {loading ? 'Cargando...' : 'Recargar Datos'}
        </Button>
      </div>

      {/* Información de desarrollo */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Información de desarrollo</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div><strong>Base de datos:</strong> PostgreSQL 15.1 (Local)</div>
          <div><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'}</div>
          <div><strong>Empresas registradas:</strong> {companies.length}</div>
          <div><strong>Total usuarios:</strong> {companies.reduce((acc, c) => acc + c.user_count, 0)}</div>
          <div><strong>RLS:</strong> Activado con contexto por empresa</div>
        </CardContent>
      </Card>
    </div>
  )
}
