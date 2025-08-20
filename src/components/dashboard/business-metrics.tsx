'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  DollarSign,
  Users,
  Calendar,
  Target,
  Clock,
  Mail,
  MessageSquare,
  PhoneCall,
  Bot
} from 'lucide-react'
import Link from 'next/link'

interface MetricData {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: string
  bgColor: string
}

interface CommunicationStat {
  title: string
  value: string
  icon: React.ReactNode
  href: string
  priority: 'high' | 'medium' | 'low'
}

export function BusinessMetrics() {
  // Simular datos reales - en producción vendrían de la API
  const kpiMetrics: MetricData[] = [
    { 
      title: "Monthly Revenue", 
      value: "€3,247", 
      change: "+12.5%", 
      trend: "up",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    { 
      title: "Active Clients", 
      value: "84", 
      change: "+6 this week", 
      trend: "up",
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    { 
      title: "Appointments", 
      value: "156", 
      change: "This month", 
      trend: "neutral",
      icon: <Calendar className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    { 
      title: "Conversion Rate", 
      value: "94%", 
      change: "+2.1%", 
      trend: "up",
      icon: <Target className="h-5 w-5" />,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20"
    }
  ]

  const communicationStats: CommunicationStat[] = [
    { title: "Unread Emails", value: "12", icon: <Mail className="h-5 w-5" />, href: "/dashboard/inbox", priority: "high" },
    { title: "WhatsApp", value: "8", icon: <MessageSquare className="h-5 w-5" />, href: "/dashboard/inbox?tab=whatsapp", priority: "medium" },
    { title: "Missed Calls", value: "3", icon: <PhoneCall className="h-5 w-5" />, href: "/dashboard/phone-calls", priority: "high" },
    { title: "AI Actions", value: "24", icon: <Bot className="h-5 w-5" />, href: "/dashboard/assistant", priority: "low" }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* KPIs principales del negocio */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric) => (
          <Card key={metric.title} className="relative overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="flex items-center text-sm">
                  {getTrendIcon(metric.trend)}
                  <span className={`ml-1 ${getTrendColor(metric.trend)}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Centro de comunicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {communicationStats.map((stat) => (
              <Link key={stat.title} href={stat.href} className="group">
                <div className="text-center p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all hover:shadow-sm">
                  <div className={`inline-flex p-2 rounded-lg mb-2 ${
                    stat.priority === "high" ? "bg-red-50 dark:bg-red-950/20" :
                    stat.priority === "medium" ? "bg-yellow-50 dark:bg-yellow-950/20" :
                    "bg-gray-50 dark:bg-gray-950/20"
                  }`}>
                    {stat.icon}
                  </div>
                  <div className="text-xl font-semibold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    {stat.title}
                  </div>
                  {stat.priority === "high" && parseInt(stat.value) > 0 && (
                    <Badge variant="destructive" className="mt-1 text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
