import { NextRequest, NextResponse } from 'next/server'
import { InvitationService } from '@/lib/services/invitation'
import { z } from 'zod'

const acceptInvitationSchema = z.object({
  token: z.string(),
  name: z.string().min(1),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = acceptInvitationSchema.parse(body)

    const user = await InvitationService.acceptInvitation({
      token: data.token,
      userData: {
        name: data.name,
        password: data.password,
      }
    })

    // Don't return sensitive information
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)

  } catch (error: any) {
    console.error('Error accepting invitation:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Error accepting invitation' },
      { status: 500 }
    )
  }
}
