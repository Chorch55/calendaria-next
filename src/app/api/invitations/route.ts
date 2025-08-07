import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { InvitationService } from '@/lib/services/invitation'
import { z } from 'zod'

const sendInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'USER']),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
})

// Send invitation
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.companyId || !token?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to invite others
    const userRole = token.role as string
    if (!['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to send invitations' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = sendInvitationSchema.parse(body)

    const invitation = await InvitationService.sendInvitation({
      companyId: token.companyId as string,
      invitedBy: token.sub,
      ...data
    })

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
    const token = await getToken({ req: request })
    
    if (!token?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const invitations = await InvitationService.getCompanyInvitations(
      token.companyId as string
    )

    return NextResponse.json(invitations)

  } catch (error: any) {
    console.error('Error getting invitations:', error)
    return NextResponse.json(
      { error: error.message || 'Error getting invitations' },
      { status: 500 }
    )
  }
}
