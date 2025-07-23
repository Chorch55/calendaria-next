'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({ email })
    alert('Revisa tu email para el enlace de autenticación')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (session) {
    return (
      <div className="p-8">
        <h1 className="text-xl mb-4">¡Hola, {session.user.email}!</h1>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-xl mb-4">Inicia sesión con tu email</h1>
      <input
        type="email"
        placeholder="tucorreo@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleLogin}
      >
        Enviar enlace mágico
      </button>
    </div>
  )
}
