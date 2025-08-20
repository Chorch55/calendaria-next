'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity,
  Calendar,
  CheckCircle2,
  Bot,
  AlertTriangle,
  Mail,
  PhoneCall,
  DollarSign,
  Users
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'appointment' | 'payment' | 'ai' | 'task' | 'alert' | 'email' | 'call' | 'client'
  title: string
  subtitle: string
  time: string
  icon: React.ReactNode
  status: 'positive' | 'negative' | 'neutral' | 'warning'
  actionable?: boolean
}

export function BusinessActivityFeed() {
  // Simulación de actividad en tiempo real - en producción vendría de API con websockets
  const recentActivity: ActivityItem[] = [
    { 
      id: '1',
      type: "appointment",
      title: "New appointment booked",
      subtitle: "Maria García - Legal Consultation",
      time: "2 min ago",
      icon: <Calendar className="h-4 w-4 text-blue-500" />,
      status: "positive"
    },
    {
      id: '2',
      type: "payment", 
      title: "Payment received",
      subtitle: "€150 - Service consultation #INV-2024-001",
      time: "15 min ago",
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
      status: "positive"
    },
    {
      id: '3',
      type: "ai",
      title: "AI handled client inquiry", 
      subtitle: "Automated response sent to pricing inquiry",
      time: "32 min ago",
      icon: <Bot className="h-4 w-4 text-purple-500" />,
      status: "neutral"
    },
    {
      id: '4',
      type: "task",
      title: "Task completed",
      subtitle: "Follow-up call with Roberto Martinez",
      time: "1 hour ago", 
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      status: "positive"
    },
    {
      id: '5',
      type: "alert",
      title: "Attention needed",
      subtitle: "Client complaint requires manual review",
      time: "2 hours ago",
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      status: "warning",
      actionable: true
    },
    {
      id: '6',
      type: "email",
      title: "Priority email received",
      subtitle: "From: Ana López - Subject: Contract renewal",
      time: "3 hours ago",
      icon: <Mail className="h-4 w-4 text-blue-500" />,
      status: "neutral",
      actionable: true
    },
    {
      id: '7',
      type: "client",
      title: "New client registered",
      subtitle: "Carlos Mendoza signed up via website",
      time: "4 hours ago",
      icon: <Users className="h-4 w-4 text-green-500" />,
      status: "positive"
    },
    {
      id: '8',
      type: "call",
      title: "Missed call",
      subtitle: "+34 612 345 678 - Called 2 times",
      time: "5 hours ago",
      icon: <PhoneCall className="h-4 w-4 text-red-500" />,
      status: "warning",
      actionable: true
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'positive':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'negative':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      case 'warning':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    }
  }

  const getItemClassName = (status: string, actionable?: boolean) => {
    let baseClass = "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50"
    
    if (actionable) {
      baseClass += " border-l-2 cursor-pointer"
      if (status === 'warning') {
        baseClass += " border-l-orange-400 bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-100/50 dark:hover:bg-orange-950/20"
      } else {
        baseClass += " border-l-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
      }
    }
    
    return baseClass
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Business Activity
          <Badge variant="secondary" className="ml-2">
            Live
          </Badge>
        </CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {recentActivity.map((activity) => (
            <div 
              key={activity.id}
              className={getItemClassName(activity.status, activity.actionable)}
              onClick={activity.actionable ? () => {
                // Handle click for actionable items
                console.log('Action needed for:', activity.title)
              } : undefined}
            >
              <div className="flex items-center gap-2 mt-0.5">
                {getStatusBadge(activity.status)}
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {activity.title}
                      {activity.actionable && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Action needed
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.subtitle}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {activity.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Resumen de actividad del día */}
        <div className="mt-6 pt-4 border-t space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Today&apos;s Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">12</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">3</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">€450</div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
