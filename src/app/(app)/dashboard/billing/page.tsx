'use client'

import { useSubscription } from '@/hooks/use-subscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard, Download, DollarSign, Users, CalendarClock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Mock invoices data - would come from your billing system
const mockInvoices = [
  {
    id: 'inv_001',
    date: '2025-01-07',
    amount: 19900,
    currency: 'USD',
    status: 'PAID' as const,
    description: 'Monthly subscription - Basic Plan'
  },
  {
    id: 'inv_002', 
    date: '2024-12-07',
    amount: 19900,
    currency: 'USD', 
    status: 'PAID' as const,
    description: 'Monthly subscription - Basic Plan'
  },
  {
    id: 'inv_003',
    date: '2024-11-07', 
    amount: 19900,
    currency: 'USD',
    status: 'PAID' as const,
    description: 'Monthly subscription - Basic Plan'
  }
]

export default function BillingPage() {
  const { subscription, isLoading } = useSubscription()

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
          <h1 className="text-3xl font-bold">Facturación</h1>
          <p className="text-gray-600">Gestiona tu facturación y pagos</p>
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const nextBillingDate = new Date(subscription.current_period_end)
  const isYearly = subscription.billing_cycle === 'YEARLY'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Facturación</h1>
        <p className="text-gray-600">Gestiona tu facturación y pagos</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plan Actual: {subscription.plan}
              </CardTitle>
              <CardDescription>
                {formatCurrency(subscription.unit_amount, subscription.currency)} / {isYearly ? 'año' : 'mes'}
              </CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-600">Próximo Pago</p>
              </div>
              <p className="font-semibold">
                {nextBillingDate.toLocaleDateString('es-ES')}
              </p>
              <p className="text-sm text-gray-500">
                {formatCurrency(subscription.unit_amount, subscription.currency)}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-600">Límites del Plan</p>
              </div>
              <p className="font-semibold">
                {subscription.max_users === 999999 ? 'Usuarios Ilimitados' : `${subscription.max_users} Usuarios`}
              </p>
              <p className="text-sm text-gray-500">
                {subscription.max_storage === BigInt('999999999999999') 
                  ? 'Almacenamiento Ilimitado' 
                  : `${Math.round(Number(subscription.max_storage) / 1024 / 1024 / 1024)}GB Almacenamiento`
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-600">Ciclo de Facturación</p>
              </div>
              <p className="font-semibold">
                {subscription.billing_cycle === 'MONTHLY' ? 'Mensual' : 'Anual'}
              </p>
              <p className="text-sm text-gray-500">
                Renovación automática
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Incluidas</CardTitle>
          <CardDescription>
            Las siguientes funcionalidades están incluidas en tu plan {subscription.plan}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {subscription.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-600 rounded-full" />
                <span className="text-sm capitalize">
                  {feature.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturas</CardTitle>
          <CardDescription>
            Revisa y descarga tus facturas anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    #{invoice.id.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.date).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status === 'PAID' ? 'Pagada' : invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Download invoice logic
                        console.log('Download invoice:', invoice.id)
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={() => {
            // Navigate to subscription page
            window.location.href = '/dashboard/subscriptions'
          }}
        >
          Gestionar Suscripción
        </Button>
        <Button variant="outline">
          Actualizar Método de Pago
        </Button>
        <Button variant="outline">
          Descargar Todas las Facturas
        </Button>
      </div>
    </div>
  )
}
