'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const useAuth = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const logout = async () => {
    await signOut({ 
      callbackUrl: '/auth/login-mt',
      redirect: true
    })
  }

  // Mientras no estemos en el cliente, devolvemos valores por defecto
  if (!isClient) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      logout
    }
  }

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    logout
  }
}
