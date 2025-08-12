'use client'

import { useEffect, useState } from 'react'
import { useSubscription } from '@/hooks/use-subscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard, Download, DollarSign, Users, CalendarClock, AlertCircle, Plus, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

type Invoice = { id: string; number: string; date: string | null; amount: number; currency: string; status: string; description?: string; hosted_invoice_url?: string | null; invoice_pdf?: string | null }

export default function BillingPage() {
  const { subscription, isLoading } = useSubscription()
  const [busy, setBusy] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[] | null>(null)
  const openPortal = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      if (data.url) window.location.href = data.url
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }
  const changePlan = async (plan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE', billingCycle: 'MONTHLY' | 'YEARLY') => {
    setBusy(true)
    try {
      const res = await fetch('/api/billing/change-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, billingCycle }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      location.reload()
    } catch (e) { console.error(e) } finally { setBusy(false) }
  }
  const cancelSubscription = async () => {
    if (!confirm('¿Cancelar la suscripción al final del periodo?')) return
    setBusy(true)
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cancelAtPeriodEnd: true }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      location.reload()
    } catch (e) { console.error(e) } finally { setBusy(false) }
  }
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/billing/invoices')
        const data = await res.json()
        if (res.ok) setInvoices(data.invoices || [])
      } catch {}
    })()
  }, [])
  const addAddon = async (addon: 'EXTRA_USERS' | 'EXTRA_STORAGE' | 'API_CALLS' | 'INTEGRATIONS' | 'CUSTOM_BRANDING') => {
    setBusy(true)
    try {
      const res = await fetch('/api/billing/addon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ addon, quantity: 1 }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      location.reload()
    } catch (e) { console.error(e) } finally { setBusy(false) }
  }

  const currentAddons: Array<{ addon_type: string; quantity: number }> = (subscription as any)?.addons || []

  // Don't block page; show progressive content

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
  const storageBytes = Number((subscription as any).max_storage)
  const storageUnlimited = (subscription as any).max_storage === BigInt(-1) || (Number.isFinite(storageBytes) ? storageBytes <= 0 : false)

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
                Plan Actual: {subscription?.plan || '—'}
              </CardTitle>
              <CardDescription>
                {subscription ? `${formatCurrency(subscription.unit_amount, subscription.currency)} / ${isYearly ? 'año' : 'mes'}` : <Skeleton className="h-4 w-28" />}
              </CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {subscription?.status || '—'}
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
                {subscription ? nextBillingDate.toLocaleDateString('es-ES') : <Skeleton className="h-4 w-24" />}
              </p>
              <p className="text-sm text-gray-500">
                {subscription ? formatCurrency(subscription.unit_amount, subscription.currency) : <Skeleton className="h-4 w-16" />}
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
                {storageUnlimited ? 'Almacenamiento Ilimitado' : `${Math.round(storageBytes / 1024 / 1024 / 1024)}GB Almacenamiento`}
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
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => changePlan('BASIC', isYearly ? 'YEARLY' : 'MONTHLY')} disabled={busy}>Cambiar a BASIC</Button>
            <Button variant="outline" onClick={() => changePlan('PREMIUM', isYearly ? 'YEARLY' : 'MONTHLY')} disabled={busy}>Cambiar a PREMIUM</Button>
            <Button variant="outline" onClick={() => changePlan('ENTERPRISE', isYearly ? 'YEARLY' : 'MONTHLY')} disabled={busy}>Cambiar a ENTERPRISE</Button>
          </div>
          <div className="mt-2 flex gap-2">
            <Button onClick={openPortal} disabled={busy}>Abrir portal</Button>
            <Button variant="secondary" onClick={() => addAddon('INTEGRATIONS')} disabled={busy}>Añadir Integraciones</Button>
            <Button variant="secondary" onClick={() => addAddon('CUSTOM_BRANDING')} disabled={busy}>Añadir Branding</Button>
            <Button variant="destructive" onClick={cancelSubscription} disabled={busy}>
              <X className="h-4 w-4 mr-1" /> Cancelar suscripción
            </Button>
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

      {/* Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle>Add-ons activos</CardTitle>
          <CardDescription>
            Añade capacidad o funcionalidades adicionales a tu suscripción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['EXTRA_USERS', 'EXTRA_STORAGE', 'API_CALLS', 'INTEGRATIONS', 'CUSTOM_BRANDING'].map((key) => {
              const existing = currentAddons.find(a => a.addon_type === key)
              return (
                <div key={key} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-gray-500">Cantidad: {existing ? existing.quantity : 0}</span>
                  </div>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => addAddon(key as any)}>
                    <Plus className="h-4 w-4 mr-1" /> Añadir +1
                  </Button>
                </div>
              )
            })}
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
          {!invoices ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : (
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
              {(invoices || []).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">#{(invoice.number || invoice.id).toUpperCase()}</TableCell>
                  <TableCell>{invoice.date ? new Date(invoice.date).toLocaleDateString('es-ES') : '-'}</TableCell>
                  <TableCell>{invoice.description || '-'}</TableCell>
                  <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status?.toUpperCase() === 'PAID' ? 'Pagada' : invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invoice.hosted_invoice_url ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={invoice.hosted_invoice_url} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4 mr-2" /> Ver/Descargar
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => { window.location.href = '/dashboard/subscriptions' }}>
          Gestionar Suscripción
        </Button>
        <Button variant="outline" onClick={openPortal}>
          Actualizar Método de Pago
        </Button>
        <Button variant="outline" onClick={openPortal}>
          Descargar Todas las Facturas
        </Button>
      </div>
    </div>
  )
}
