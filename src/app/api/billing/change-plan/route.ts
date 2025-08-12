import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireCompany } from '@/lib/auth-helpers'

const schema = z.object({ plan: z.enum(['BASIC', 'PREMIUM', 'ENTERPRISE']), billingCycle: z.enum(['MONTHLY', 'YEARLY']) })

export async function POST(request: NextRequest) {
  try {
    const companyId = await requireCompany(request)
    const body = await request.json()
    const { plan, billingCycle } = schema.parse(body)

    const company = await prisma.company.findUnique({ where: { id: companyId }, include: { subscription: true } })
    const sub = company?.subscription
    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    const priceId = STRIPE_PLANS[plan][billingCycle.toLowerCase() as 'monthly' | 'yearly']
    if (!priceId) return NextResponse.json({ error: 'Price not found' }, { status: 400 })

    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      proration_behavior: 'create_prorations',
      items: [{ id: (await stripe.subscriptions.retrieve(sub.stripe_subscription_id)).items.data[0].id, price: priceId }],
    })

    await prisma.subscription.update({ where: { id: sub.id }, data: { plan, stripe_price_id: priceId } })

    return NextResponse.json({ ok: true, subscription: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error changing plan' }, { status: 500 })
  }
}
