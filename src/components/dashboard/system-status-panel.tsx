'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle,
  CheckCircle,
  Info,
  Crown,
  Zap,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export function SystemStatusPanel() {
  // Simulación de alertas y estado del sistema
  const systemAlerts = [
    {
      type: 'warning',
      title: 'Approaching API limit',
      message: 'You have used 85% of your monthly API calls',
      action: 'Upgrade Plan',
      href: '/dashboard/billing'
    },
    {
      type: 'info', 
      title: 'New feature available',
      message: 'AI-powered call analytics is now active for your plan',
      action: 'Learn More',
      href: '/dashboard/analytics'
    }
  ]

  const planBenefits = [
    'Advanced call analytics',
    'Team management tools', 
    'Priority customer support',
    'Custom integrations',
    'Advanced reporting'
  ]

  return (
    <div className="space-y-4">
      {/* Alertas del sistema */}
      {systemAlerts.map((alert, index) => (
        <Alert key={index} className={
          alert.type === 'warning' ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/20' :
          alert.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
          'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
        }>
          {alert.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          ) : alert.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <Info className="h-4 w-4 text-blue-600" />
          )}
          <AlertDescription className="flex items-center justify-between">
            <div>
              <div className="font-medium">{alert.title}</div>
              <div className="text-sm text-muted-foreground">{alert.message}</div>
            </div>
            <Link href={alert.href}>
              <Button variant="outline" size="sm">
                {alert.action}
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      ))}

      {/* Estado del plan actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600" />
            Premium Plan
            <Badge variant="secondary">Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Billing period</span>
            <span className="text-sm font-medium">Aug 1 - Aug 31, 2024</span>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Included features:</h4>
            <ul className="space-y-1">
              {planBenefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {benefit}
                </li>
              ))}
            </ul>
            {planBenefits.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{planBenefits.length - 3} more features
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Link href="/dashboard/billing">
              <Button variant="outline" size="sm" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                Upgrade
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="ghost" size="sm" className="flex-1">
                Manage
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones inteligentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Users className="h-4 w-4 mt-0.5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Invite team members</p>
              <p className="text-xs text-muted-foreground">Add colleagues to collaborate better</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Shield className="h-4 w-4 mt-0.5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Enable 2FA</p>
              <p className="text-xs text-muted-foreground">Secure your account with two-factor auth</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
