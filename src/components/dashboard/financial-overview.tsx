'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface FinancialMetric {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  percentage?: number
  target?: string
}

export function FinancialOverview() {
  const financialMetrics: FinancialMetric[] = [
    {
      title: "This Month Revenue",
      value: "€3,247",
      change: "+12.5%",
      trend: "up",
      percentage: 65,
      target: "€5,000"
    },
    {
      title: "Average Invoice",
      value: "€128",
      change: "+8.2%", 
      trend: "up"
    },
    {
      title: "Payment Time",
      value: "4.2 days",
      change: "-1.3 days",
      trend: "up"
    },
    {
      title: "Conversion Rate",
      value: "68%",
      change: "+5.1%",
      trend: "up"
    }
  ]

  const upcomingPayments = [
    { client: "Maria García", amount: "€150", due: "Today", status: "due" },
    { client: "Roberto Martinez", amount: "€200", due: "Tomorrow", status: "pending" },
    { client: "Ana López", amount: "€95", due: "Aug 25", status: "scheduled" }
  ]

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    )
  }

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'due':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
      case 'scheduled':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Métricas financieras principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {financialMetrics.map((metric) => (
              <div key={metric.title} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-xs ${getTrendColor(metric.trend)}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold">{metric.value}</p>
                  {metric.target && (
                    <p className="text-xs text-muted-foreground">/ {metric.target}</p>
                  )}
                </div>
                {metric.percentage && (
                  <Progress value={metric.percentage} className="h-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos pagos pendientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Payments
          </CardTitle>
          <Link href="/dashboard/billing">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div className="flex-1">
                  <p className="text-sm font-medium">{payment.client}</p>
                  <p className="text-xs text-muted-foreground">Due: {payment.due}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{payment.amount}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Expected</span>
              <span className="font-semibold">€445</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objetivos financieros del mes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Targets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Revenue Goal</span>
              <span>€3,247 / €5,000</span>
            </div>
            <Progress value={65} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">€1,753 remaining</p>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>New Clients</span>
              <span>8 / 12</span>
            </div>
            <Progress value={67} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">4 clients remaining</p>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Billable Hours</span>
              <span>124 / 160</span>
            </div>
            <Progress value={78} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">36 hours remaining</p>
          </div>

          <Link href="/dashboard/analytics">
            <Button variant="outline" size="sm" className="w-full mt-4">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
