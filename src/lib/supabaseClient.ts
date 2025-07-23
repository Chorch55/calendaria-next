// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // Mantener la sesión en localStorage
      persistSession: true,
      // Refrescar tokens automáticamente
      autoRefreshToken: true,
      // Detectar y procesar magic links / OAuth callbacks en la URL
      detectSessionInUrl: true,
    },
  }
)
