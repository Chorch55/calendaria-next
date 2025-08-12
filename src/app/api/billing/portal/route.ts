import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireCompany } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const companyId = await requireCompany(request)
    const company = await prisma.company.findUnique({ where: { id: companyId }, include: { subscription: true } })
    if (!company?.subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 })
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: company.subscription.stripe_customer_id,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
    })
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error creating portal session' }, { status: 500 })
  }
}
