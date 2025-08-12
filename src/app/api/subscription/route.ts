import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { SubscriptionService } from '@/lib/services/subscription'
import { toSafeJSON } from '@/lib/utils'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  plan: z.enum(['BASIC', 'PREMIUM', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  paymentMethodId: z.string().optional(),
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
    const data = createSubscriptionSchema.parse(body)

    const result = await SubscriptionService.createSubscription({
      companyId: token.companyId as string,
      email: token.email!,
      ...data
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error creating subscription:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Error creating subscription' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

  const subscription = await SubscriptionService.getSubscriptionWithUsage(
      token.companyId as string
    )

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

  const res = NextResponse.json(toSafeJSON(subscription))
  res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=60')
  return res

  } catch (error: any) {
    console.error('Error getting subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Error getting subscription' },
      { status: 500 }
    )
  }
}
