'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Users, HardDrive, Zap, FolderOpen, Plug } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'

const resourceIcons = {
  users: Users,
  storage: HardDrive,
  api_calls: Zap,
  projects: FolderOpen,
  integrations: Plug,
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatNumber = (num: number) => {
  if (num >= 999999) return 'Unlimited'
  return num.toLocaleString()
}

export function UsageOverview() {
  const { usageSummary, isLoading, error } = useSubscription()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading usage data...</div>
        </CardContent>
      </Card>
    )
  }

  if (error || !usageSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading usage data</div>
        </CardContent>
      </Card>
    )
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-purple-600'
  }

  const resources = [
    {
      key: 'users',
      label: 'Team Members',
      current: usageSummary.usage.users,
      limit: usageSummary.limits.users,
      percentage: usageSummary.percentages.users,
      formatter: formatNumber,
    },
    {
      key: 'storage',
      label: 'Storage',
      current: usageSummary.usage.storage,
      limit: usageSummary.limits.storage,
      percentage: usageSummary.percentages.storage,
      formatter: formatBytes,
    },
    {
      key: 'api_calls',
      label: 'API Calls',
      current: usageSummary.usage.api_calls,
      limit: usageSummary.limits.api_calls,
      percentage: usageSummary.percentages.api_calls,
      formatter: formatNumber,
    },
    {
      key: 'projects',
      label: 'Projects',
      current: usageSummary.usage.projects,
      limit: usageSummary.limits.projects || 999999,
      percentage: usageSummary.limits.projects ? 
        (usageSummary.usage.projects / usageSummary.limits.projects) * 100 : 0,
      formatter: formatNumber,
    },
    {
      key: 'integrations',
      label: 'Integrations',
      current: usageSummary.usage.integrations,
      limit: usageSummary.limits.integrations || 999999,
      percentage: usageSummary.limits.integrations ? 
        (usageSummary.usage.integrations / usageSummary.limits.integrations) * 100 : 0,
      formatter: formatNumber,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usage & Limits</CardTitle>
          <Badge variant={usageSummary.subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {usageSummary.subscription.plan} Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {resources.map((resource) => {
          const Icon = resourceIcons[resource.key as keyof typeof resourceIcons]
          const percentage = Math.round(resource.percentage)
          const isOverLimit = resource.current > resource.limit
          
          return (
            <div key={resource.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{resource.label}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {resource.formatter(resource.current)} / {resource.formatter(resource.limit)}
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${isOverLimit ? 'bg-red-100' : ''}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage}% used</span>
                  {isOverLimit && (
                    <span className="text-red-500 font-medium">Over limit</span>
                  )}
                  {percentage >= 75 && percentage < 100 && !isOverLimit && (
                    <span className="text-yellow-600 font-medium">Approaching limit</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            Current billing period ends on{' '}
            {new Date(usageSummary.subscription.current_period_end).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
