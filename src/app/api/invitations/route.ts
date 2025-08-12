import { NextRequest, NextResponse } from 'next/server'
import { InvitationService } from '@/lib/services/invitation'
import { z } from 'zod'
import { requireCompany } from '@/lib/auth-helpers'
import { requireRole } from '@/lib/auth-helpers'

const sendInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
})

// Send invitation
export async function POST(request: NextRequest) {
  try {
  const token = await requireRole(request, ['SUPER_ADMIN', 'ADMIN'])
  const tokenCompanyId = token.companyId as string

    const body = await request.json()
    const data = sendInvitationSchema.parse(body)

  // Nota: requireRole disponible si deseas reforzar rol
  const invitation = await InvitationService.sendInvitation({ companyId: tokenCompanyId, invitedBy: token.sub as string, ...data })

    return NextResponse.json(invitation)

  } catch (error: any) {
    console.error('Error sending invitation:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Error sending invitation' },
      { status: 500 }
    )
  }
}

// Get company invitations
export async function GET(request: NextRequest) {
  try {
  const companyId = await requireCompany(request)
  const url = new URL(request.url)
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit') || '20')))
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))
  const offset = (page - 1) * limit

  const { invitations, total } = await InvitationService.getCompanyInvitations(companyId, { limit, offset })

  const res = NextResponse.json({ invitations, total, page, pageSize: limit })
  res.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=60')
  return res

  } catch (error: any) {
    console.error('Error getting invitations:', error)
    return NextResponse.json(
      { error: error.message || 'Error getting invitations' },
      { status: 500 }
    )
  }
}
