import { NextRequest, NextResponse } from 'next/server'
import { InvitationService } from '@/lib/services/invitation'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(10),
  name: z.string().min(1),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, name, password } = schema.parse(body)

    await InvitationService.acceptInvitation({
      token,
      userData: { name, password },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    console.error('Error accepting invitation:', error)
    return NextResponse.json({ error: error.message || 'Error accepting invitation' }, { status: 500 })
  }
}
