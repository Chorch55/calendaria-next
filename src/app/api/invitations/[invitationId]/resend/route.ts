import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { InvitationService } from '@/lib/services/invitation'

export async function POST(request: NextRequest, { params }: { params: { invitationId: string } }) {
  try {
    const token = await getToken({ req: request })
    if (!token?.companyId || !token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = token.role as string
    if (!['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const result = await InvitationService.resendInvitation(params.invitationId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error resending invitation:', error)
    return NextResponse.json({ error: error.message || 'Error resending invitation' }, { status: 500 })
  }
}
