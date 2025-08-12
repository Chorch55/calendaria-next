'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useSubscription, useCreateSubscription } from '@/hooks/use-subscription'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Users, Database, Zap, Settings } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SubscriptionsPage() {
  const { data: session } = useSession()
  const { subscription, usageSummary: usage, isLoading, loadingUsage } = useSubscription()

  // Avoid full-page block; show header immediately and skeletons later

  if (!subscription) {
  return <CreateSubscriptionView />
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
                Plan {subscription?.plan || '—'}
                <Badge className={planColors[subscription.plan as keyof typeof planColors]}>
                  {subscription?.status || '—'}
                </Badge>
              </CardTitle>
              <CardDescription>
                {subscription ? `${formatCurrency(subscription.unit_amount)} / ${subscription.billing_cycle === 'MONTHLY' ? 'mes' : 'año'}` : <Skeleton className="h-4 w-24" />}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Próximo pago</p>
              <p className="font-semibold">
                {subscription ? new Date(subscription.current_period_end).toLocaleDateString('es-ES') : <span className="inline-block"><Skeleton className="h-4 w-20" /></span>}
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
                  {loadingUsage || !subscription ? (
                    <Skeleton className="h-4 w-24" />
                  ) : subscription.max_users === 999999 ? 'Ilimitados' : `${usage?.usage.users || 0}/${subscription.max_users}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Almacenamiento</p>
                <p className="font-semibold">
                  {loadingUsage || !subscription ? (
                    <Skeleton className="h-4 w-32" />
                  ) : subscription.max_storage === BigInt('999999999999999') 
                    ? 'Ilimitado' 
                    : `${Math.round(Number(usage?.usage.storage || 0) / 1024 / 1024 / 1024)}GB / ${Math.round(Number(subscription.max_storage) / 1024 / 1024 / 1024)}GB`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">API Calls</p>
                <p className="font-semibold">
                  {loadingUsage || !subscription ? (
                    <Skeleton className="h-4 w-24" />
                  ) : subscription.max_api_calls === 999999 
                    ? 'Ilimitadas' 
                    : `${usage?.usage.api_calls || 0}/${subscription.max_api_calls}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Integraciones</p>
                <p className="font-semibold">
                  {loadingUsage || !subscription ? (
                    <Skeleton className="h-4 w-16" />
                  ) : subscription.max_integrations === 999999 ? 'Ilimitadas' : `${usage?.usage.integrations || 0}/${subscription.max_integrations}`}
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
      {subscription && subscription.max_users !== 999999 && (
            <div>
              <div className="flex justify-between text-sm mb-2">
        <span>Usuarios {loadingUsage ? '' : `(${usage?.usage.users || 0}/${subscription.max_users})`}</span>
        <span>{loadingUsage ? <Skeleton className="h-3 w-10" /> : getUsagePercentage(usage?.usage.users || 0, subscription.max_users).toFixed(0) + '%'}</span>
              </div>
              <Progress 
        value={loadingUsage ? 0 : getUsagePercentage(usage?.usage.users || 0, subscription.max_users)} 
                className="h-2"
              />
            </div>
          )}
          
      {subscription && subscription.max_storage !== BigInt('999999999999999') && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Almacenamiento</span>
        <span>{loadingUsage ? <Skeleton className="h-3 w-10" /> : getUsagePercentage(Number(usage?.usage.storage || 0), Number(subscription.max_storage)).toFixed(0) + '%'}</span>
              </div>
              <Progress 
        value={loadingUsage ? 0 : getUsagePercentage(Number(usage?.usage.storage || 0), Number(subscription.max_storage))} 
                className="h-2"
              />
            </div>
          )}
          
      {subscription && subscription.max_api_calls !== 999999 && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Llamadas API ({usage?.usage.api_calls || 0}/{subscription.max_api_calls})</span>
        <span>{loadingUsage ? <Skeleton className="h-3 w-10" /> : getUsagePercentage(usage?.usage.api_calls || 0, subscription.max_api_calls).toFixed(0) + '%'}</span>
              </div>
              <Progress 
        value={loadingUsage ? 0 : getUsagePercentage(usage?.usage.api_calls || 0, subscription.max_api_calls)} 
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

function CreateSubscriptionView() {
  const createSub = useCreateSubscription()
  const [billingCycle, setBillingCycle] = React.useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [plan, setPlan] = React.useState<'BASIC' | 'PREMIUM' | 'ENTERPRISE'>('BASIC')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suscripción</h1>
        <p className="text-gray-600">Elige un plan para comenzar</p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-sm ${billingCycle === 'MONTHLY' ? 'font-semibold' : ''}`}>Mensual</span>
        <button onClick={() => setBillingCycle(prev => prev === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${billingCycle === 'YEARLY' ? 'bg-primary' : 'bg-muted'}`}>
          <span className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${billingCycle === 'YEARLY' ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
        <span className={`text-sm ${billingCycle === 'YEARLY' ? 'font-semibold' : ''}`}>Anual</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(['BASIC','PREMIUM','ENTERPRISE'] as const).map(p => (
          <Card key={p} className={`border-2 ${plan === p ? 'border-primary' : 'border-border'}`}>
            <CardHeader>
              <CardTitle>Plan {p}</CardTitle>
              <CardDescription>Selecciona este plan</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setPlan(p)} variant={plan === p ? 'default' : 'outline'}>Elegir</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Button onClick={() => createSub.mutate({ plan, billingCycle })} disabled={createSub.isPending}>
          {createSub.isPending ? 'Creando…' : 'Crear suscripción'}
        </Button>
      </div>
    </div>
  )
}
