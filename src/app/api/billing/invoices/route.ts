import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireCompany } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const companyId = await requireCompany(request)
    const company = await prisma.company.findUnique({ where: { id: companyId }, include: { subscription: true } })
    const customerId = company?.subscription?.stripe_customer_id
    if (!customerId) return NextResponse.json({ invoices: [] })

    const list = await stripe.invoices.list({ customer: customerId, limit: 24 })
    const invoices = list.data.map((inv) => ({
      id: inv.id,
      number: inv.number || inv.id,
      date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
      amount: inv.total || 0,
      currency: inv.currency?.toUpperCase() || 'EUR',
      status: inv.status?.toUpperCase() || 'UNKNOWN',
      description: inv.lines?.data?.[0]?.description || inv.description || '',
      hosted_invoice_url: inv.hosted_invoice_url || null,
      invoice_pdf: (inv.invoice_pdf as string | null) || null,
    }))

  const res = NextResponse.json({ invoices })
  res.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=300')
  return res
  } catch (error: any) {
    console.error('Error listing invoices:', error)
    return NextResponse.json({ error: error.message || 'Error listing invoices' }, { status: 500 })
  }
}
