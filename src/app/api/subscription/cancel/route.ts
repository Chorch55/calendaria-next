import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { SubscriptionService } from '@/lib/services/subscription'
import { z } from 'zod'

const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cancelAtPeriodEnd } = cancelSubscriptionSchema.parse(body)

    const result = await SubscriptionService.cancelSubscription(
      token.companyId as string,
      cancelAtPeriodEnd
    )

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Error canceling subscription' },
      { status: 500 }
    )
  }
}
