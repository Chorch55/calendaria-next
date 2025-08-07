'use client'

import { useSession } from 'next-auth/react'
import { useSubscription } from '@/hooks/use-subscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Users, Database, Zap, Settings } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SubscriptionsPage() {
  const { data: session } = useSession()
  const { subscription, usageSummary: usage, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Suscripción</h1>
          <p className="text-gray-600">Gestiona tu plan y facturación</p>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes una suscripción activa. Contacta a tu administrador.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const planColors = {
    BASIC: 'bg-blue-100 text-blue-800',
    PREMIUM: 'bg-purple-100 text-purple-800',
    ENTERPRISE: 'bg-gold-100 text-gold-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: subscription.currency
    }).format(amount / 100)
  }

  const getUsagePercentage = (current: number, max: number) => {
    if (max === 999999) return 0 // Unlimited
    return Math.min((current / max) * 100, 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suscripción</h1>
        <p className="text-gray-600">Gestiona tu plan y facturación</p>
      </div>

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Plan {subscription.plan}
                <Badge className={planColors[subscription.plan as keyof typeof planColors]}>
                  {subscription.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {formatCurrency(subscription.unit_amount)} / {subscription.billing_cycle === 'MONTHLY' ? 'mes' : 'año'}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Próximo pago</p>
              <p className="font-semibold">
                {new Date(subscription.current_period_end).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Usuarios</p>
                <p className="font-semibold">
                  {subscription.max_users === 999999 ? 'Ilimitados' : `${usage?.usage.users || 0}/${subscription.max_users}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Almacenamiento</p>
                <p className="font-semibold">
                  {subscription.max_storage === BigInt('999999999999999') 
                    ? 'Ilimitado' 
                    : `${Math.round(Number(usage?.usage.storage || 0) / 1024 / 1024 / 1024)}GB / ${Math.round(Number(subscription.max_storage) / 1024 / 1024 / 1024)}GB`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">API Calls</p>
                <p className="font-semibold">
                  {subscription.max_api_calls === 999999 
                    ? 'Ilimitadas' 
                    : `${usage?.usage.api_calls || 0}/${subscription.max_api_calls}`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Integraciones</p>
                <p className="font-semibold">
                  {subscription.max_integrations === 999999 ? 'Ilimitadas' : `0/${subscription.max_integrations}`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Uso del Mes Actual</CardTitle>
          <CardDescription>
            Monitorea el uso de recursos de tu plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription.max_users !== 999999 && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Usuarios ({usage?.usage.users || 0}/{subscription.max_users})</span>
                <span>{getUsagePercentage(usage?.usage.users || 0, subscription.max_users).toFixed(0)}%</span>
              </div>
              <Progress 
                value={getUsagePercentage(usage?.usage.users || 0, subscription.max_users)} 
                className="h-2"
              />
            </div>
          )}
          
          {subscription.max_storage !== BigInt('999999999999999') && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Almacenamiento</span>
                <span>{getUsagePercentage(Number(usage?.usage.storage || 0), Number(subscription.max_storage)).toFixed(0)}%</span>
              </div>
              <Progress 
                value={getUsagePercentage(Number(usage?.usage.storage || 0), Number(subscription.max_storage))} 
                className="h-2"
              />
            </div>
          )}
          
          {subscription.max_api_calls !== 999999 && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Llamadas API ({usage?.usage.api_calls || 0}/{subscription.max_api_calls})</span>
                <span>{getUsagePercentage(usage?.usage.api_calls || 0, subscription.max_api_calls).toFixed(0)}%</span>
              </div>
              <Progress 
                value={getUsagePercentage(usage?.usage.api_calls || 0, subscription.max_api_calls)} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades del Plan</CardTitle>
          <CardDescription>
            Las siguientes funcionalidades están incluidas en tu plan {subscription.plan}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {subscription.features.map((feature: string) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm capitalize">
                  {feature.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline">
          Cambiar Plan
        </Button>
        <Button variant="outline">
          Ver Historial de Facturación
        </Button>
        <Button variant="outline">
          Descargar Facturas
        </Button>
      </div>
    </div>
  )
}
