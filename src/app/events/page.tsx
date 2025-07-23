'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

interface Event {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true })

      if (error) {
        console.error('Error cargando eventos:', error.message)
      } else {
        setEvents(data ?? [])
      }
      setLoading(false)
    }

    fetchEvents()
  }, [])

  if (loading) {
    return <p className="p-8">Cargando eventos…</p>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Mis eventos</h1>
        <Link
          href="/events/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Nuevo evento
        </Link>
      </div>

      {events.length === 0 ? (
        <p>No tienes eventos programados.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent>
                <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                <p className="text-sm mb-1">
                  {new Date(event.start_time).toLocaleString()}
                  {event.end_time &&
                    ` — ${new Date(event.end_time).toLocaleString()}`}
                </p>
                {event.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
