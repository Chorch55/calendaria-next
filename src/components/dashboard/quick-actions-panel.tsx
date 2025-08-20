'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  Users,
  Briefcase,
  BarChart3,
  MessageSquare,
  Phone,
  FileText,
  Settings,
  Zap,
  PlusCircle
} from 'lucide-react'
import Link from 'next/link'

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  category: 'primary' | 'secondary'
}

export function QuickActionsPanel() {
  const quickActions: QuickAction[] = [
    { 
      title: "New Appointment", 
      description: "Schedule client meeting",
      icon: <Calendar className="h-4 w-4" />, 
      href: "/dashboard/calendar", 
      color: "bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 dark:text-blue-400",
      category: "primary"
    },
    { 
      title: "Add Client", 
      description: "Create new contact",
      icon: <Users className="h-4 w-4" />, 
      href: "/dashboard/contacts", 
      color: "bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400",
      category: "primary"
    },
    { 
      title: "Send Invoice", 
      description: "Generate billing",
      icon: <Briefcase className="h-4 w-4" />, 
      href: "/dashboard/billing", 
      color: "bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 dark:text-purple-400",
      category: "primary"
    },
    { 
      title: "View Analytics", 
      description: "Business insights",
      icon: <BarChart3 className="h-4 w-4" />, 
      href: "/dashboard/analytics", 
      color: "bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 dark:text-orange-400",
      category: "primary"
    },
    { 
      title: "Compose Message", 
      description: "Send email/WhatsApp",
      icon: <MessageSquare className="h-4 w-4" />, 
      href: "/dashboard/inbox", 
      color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 dark:text-indigo-400",
      category: "secondary"
    },
    { 
      title: "Make Call", 
      description: "Start phone call",
      icon: <Phone className="h-4 w-4" />, 
      href: "/dashboard/phone-calls", 
      color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:text-emerald-400",
      category: "secondary"
    },
    { 
      title: "Create Report", 
      description: "Generate document",
      icon: <FileText className="h-4 w-4" />, 
      href: "/dashboard/analytics", 
      color: "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400",
      category: "secondary"
    },
    { 
      title: "Settings", 
      description: "Configure system",
      icon: <Settings className="h-4 w-4" />, 
      href: "/dashboard/settings", 
      color: "bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-950/20 dark:hover:bg-gray-950/40 dark:text-gray-400",
      category: "secondary"
    }
  ]

  const primaryActions = quickActions.filter(action => action.category === 'primary')
  const secondaryActions = quickActions.filter(action => action.category === 'secondary')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Acciones principales */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Most Used</h4>
          <div className="grid grid-cols-2 gap-3">
            {primaryActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Button 
                  variant="ghost" 
                  className={`w-full h-auto p-4 flex flex-col items-center gap-2 text-center ${action.color}`}
                >
                  {action.icon}
                  <div>
                    <div className="text-xs font-medium">{action.title}</div>
                    <div className="text-xs opacity-70">{action.description}</div>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Acciones secundarias */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">More Actions</h4>
          <div className="grid grid-cols-4 gap-2">
            {secondaryActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`w-full h-auto p-3 flex flex-col items-center gap-1 ${action.color}`}
                  title={action.description}
                >
                  {action.icon}
                  <span className="text-xs">{action.title}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Botón de acceso completo */}
        <div className="pt-3 border-t">
          <Link href="/dashboard/workflows">
            <Button variant="outline" size="sm" className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
