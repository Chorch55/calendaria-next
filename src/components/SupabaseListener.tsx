// components/SupabaseListener.tsx
'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SupabaseListener() {
  useEffect(() => {
    // Esto detecta y guarda automáticamente el magic link / OAuth callback
    // (usa la opción detectSessionInUrl en tu cliente de Supabase)
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth event:', _event, session)
    })
  }, [])

  return null
}
