import { NextRequest, NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services/subscription'
import { z } from 'zod'
import { requireCompany } from '@/lib/auth-helpers'

const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
  const companyId = await requireCompany(request)

    const body = await request.json()
    const { cancelAtPeriodEnd } = cancelSubscriptionSchema.parse(body)

  const result = await SubscriptionService.cancelSubscription(companyId, cancelAtPeriodEnd)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Error canceling subscription' },
      { status: 500 }
    )
  }
}
