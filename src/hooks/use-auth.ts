'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const logout = async () => {
    await signOut({ 
      callbackUrl: '/auth/login-mt',
      redirect: true
    })
  }

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    logout
  }
}
