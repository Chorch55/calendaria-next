'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock,
  Calendar,
  Users,
  MapPin,
  Video,
  Phone,
  ChevronRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface TodayEvent {
  id: string
  title: string
  client: string
  time: string
  duration: string
  type: 'meeting' | 'call' | 'video' | 'appointment'
  status: 'upcoming' | 'current' | 'completed'
  location?: string
  priority: 'high' | 'medium' | 'low'
}

export function TodaySchedule() {
  // Simulación de eventos del día
  const todayEvents: TodayEvent[] = [
    {
      id: '1',
      title: "Legal Consultation",
      client: "Maria García",
      time: "10:00 AM",
      duration: "1h",
      type: "appointment",
      status: "upcoming",
      location: "Office Room A",
      priority: "high"
    },
    {
      id: '2',
      title: "Strategy Meeting",
      client: "Development Team",
      time: "2:00 PM", 
      duration: "2h",
      type: "video",
      status: "upcoming",
      priority: "medium"
    },
    {
      id: '3',
      title: "Follow-up Call",
      client: "Roberto Martinez",
      time: "4:30 PM",
      duration: "30min",
      type: "call",
      status: "upcoming",
      priority: "medium"
    },
    {
      id: '4',
      title: "Contract Review",
      client: "Ana López",
      time: "9:00 AM",
      duration: "45min",
      type: "meeting",
      status: "completed",
      location: "Conference Room",
      priority: "high"
    }
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'call':
        return <Phone className="h-4 w-4" />
      case 'appointment':
      case 'meeting':
        return <Users className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'upcoming':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>
      default:
        return null
    }
  }

  const upcomingEvents = todayEvents.filter(event => event.status === 'upcoming')
  const completedEvents = todayEvents.filter(event => event.status === 'completed')

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Today&apos;s Schedule
        </CardTitle>
        <Link href="/dashboard/calendar">
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Próximos eventos */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Upcoming</h4>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    {getPriorityBadge(event.priority)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{event.time}</span>
                    <span>•</span>
                    <span>{event.duration}</span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getEventIcon(event.type)}
                    <span className="ml-1">{event.client}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eventos completados */}
        {completedEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Completed</h4>
            <div className="space-y-2">
              {completedEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate opacity-75">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                      <span>•</span>
                      <span>{event.client}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón para añadir evento */}
        <div className="pt-3 border-t">
          <Link href="/dashboard/calendar">
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Appointment
            </Button>
          </Link>
        </div>

        {/* Resumen del día */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">{upcomingEvents.length}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">{completedEvents.length}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">3h 15m</div>
              <div className="text-xs text-muted-foreground">Time left</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
