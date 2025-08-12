'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface UsageSummary {
  subscription: {
    plan: string
    status: string
    current_period_end: string
  }
  limits: {
    users: number
    storage: number
    api_calls: number
    projects?: number
    integrations?: number
  }
  usage: {
    users: number
    storage: number
    api_calls: number
    projects: number
    integrations: number
  }
  percentages: {
    users: number
    storage: number
    api_calls: number
  }
  thisMonthUsage: any[]
}

interface Invitation {
  id: string
  email: string
  role: string
  department?: string
  job_title?: string
  status: string
  expires_at: string
  created_at: string
  inviter: {
    id: string
    name?: string
    email: string
  }
}

export function useSubscription() {
  const { data: session } = useSession()

  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await fetch('/api/subscription')
      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }
      return response.json()
    },
    enabled: !!session?.user,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const {
    data: usageSummary,
    isLoading: isLoadingUsage,
    error: usageError
  } = useQuery<UsageSummary>({
    queryKey: ['usage-summary'],
    queryFn: async () => {
      const response = await fetch('/api/usage')
      if (!response.ok) {
        throw new Error('Failed to fetch usage summary')
      }
      return response.json()
    },
    enabled: !!session?.user,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  return {
    subscription,
    usageSummary,
    isLoading: isLoadingSubscription || isLoadingUsage,
    loadingSubscription: isLoadingSubscription,
    loadingUsage: isLoadingUsage,
    error: subscriptionError || usageError,
  }
}

export function useInvitations() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const {
    data: invitations,
    isLoading,
    error
  } = useQuery<Invitation[]>({
    queryKey: ['invitations'],
    queryFn: async () => {
      const response = await fetch('/api/invitations?limit=50')
      if (!response.ok) {
        throw new Error('Failed to fetch invitations')
      }
      const data = await response.json()
      return data.invitations || []
    },
    enabled: !!session?.user && ['SUPER_ADMIN', 'ADMIN'].includes(session.user.role as string),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const sendInvitationMutation = useMutation({
    mutationFn: async (data: {
      email: string
      role: string
      department?: string
      jobTitle?: string
    }) => {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['usage-summary'] })
    },
  })

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch(`/api/invitations/${invitationId}/resend`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to resend invitation')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })

  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch(`/api/invitations/${invitationId}/revoke`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to revoke invitation')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })

  return {
    invitations,
    isLoading,
    error,
    sendInvitation: sendInvitationMutation.mutate,
    sendInvitationAsync: sendInvitationMutation.mutateAsync,
    isSeandingInvitation: sendInvitationMutation.isPending,
    resendInvitation: resendInvitationMutation.mutate,
    revokeInvitation: revokeInvitationMutation.mutate,
    isResending: resendInvitationMutation.isPending,
    isRevoking: revokeInvitationMutation.isPending,
  }
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      plan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
      billingCycle: 'MONTHLY' | 'YEARLY'
      paymentMethodId?: string
    }) => {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create subscription')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['usage-summary'] })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { cancelAtPeriodEnd?: boolean }) => {
      const { cancelAtPeriodEnd = true } = data
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancelAtPeriodEnd }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['usage-summary'] })
    },
  })
}
