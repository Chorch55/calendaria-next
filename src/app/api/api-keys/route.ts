import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCompany } from '@/lib/auth-helpers'
import { hasFeature } from '@/lib/middleware/limits'
import { z } from 'zod'

const schema = z.object({ name: z.string().min(1) })

export async function GET(request: NextRequest) {
  try {
    const companyId = await requireCompany(request)
    const keys = await prisma.apiKey.findMany({ where: { company_id: companyId, is_active: true }, select: { id: true, name: true, key_prefix: true, created_at: true } })
    return NextResponse.json(keys)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await requireCompany(request)
    const body = await request.json()
    const { name } = schema.parse(body)
    // Feature gate: requiere 'api_access' (plan enterprise o add-on INTEGRATIONS)
    const allowed = await hasFeature(companyId, 'api_access')
    if (!allowed) {
      return NextResponse.json({ error: 'Feature not available for your plan' }, { status: 403 })
    }

    // Generate an API key (store hash only)
    const raw = crypto.randomUUID().replace(/-/g, '')
    const key_prefix = raw.slice(0, 6)
    const key_hash = await import('crypto').then(c => c.createHash('sha256').update(raw).digest('hex'))

    const created = await prisma.apiKey.create({
      data: { company_id: companyId, name, key_hash, key_prefix }
    })

    return NextResponse.json({ id: created.id, name: created.name, apiKey: `${key_prefix}.${raw}` })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message || 'Error' }, { status: error.message === 'Unauthorized' ? 401 : 500 })
  }
}
