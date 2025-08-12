import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe, STRIPE_ADDONS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireCompany } from '@/lib/auth-helpers'

const schema = z.object({ addon: z.enum(['EXTRA_USERS', 'EXTRA_STORAGE', 'API_CALLS', 'INTEGRATIONS', 'CUSTOM_BRANDING']), quantity: z.number().int().positive().default(1) })

export async function POST(request: NextRequest) {
  try {
    const companyId = await requireCompany(request)
    const body = await request.json()
    const { addon, quantity } = schema.parse(body)

    const company = await prisma.company.findUnique({ where: { id: companyId }, include: { subscription: true } })
    const sub = company?.subscription
    if (!sub?.stripe_subscription_id || !sub.stripe_customer_id) return NextResponse.json({ error: 'No active subscription' }, { status: 400 })

    const addonPriceId = STRIPE_ADDONS[addon]
    if (!addonPriceId) return NextResponse.json({ error: 'Addon price not found' }, { status: 400 })

    // Add or update addon item on subscription
    const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
    const existingItem = subscription.items.data.find(i => i.price?.id === addonPriceId)

    if (existingItem) {
      await stripe.subscriptionItems.update(existingItem.id, { quantity: (existingItem.quantity || 0) + quantity, proration_behavior: 'create_prorations' })
    } else {
      await stripe.subscriptionItems.create({ subscription: sub.stripe_subscription_id, price: addonPriceId, quantity, proration_behavior: 'create_prorations' as any })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error.name === 'ZodError') return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    return NextResponse.json({ error: error.message || 'Error updating addon' }, { status: 500 })
  }
}
