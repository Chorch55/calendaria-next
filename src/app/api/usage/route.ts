import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getUsageSummary } from '@/lib/middleware/limits'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    
    if (!token?.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const summary = await getUsageSummary(token.companyId as string)

    if (!summary) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    return NextResponse.json(summary)

  } catch (error: any) {
    console.error('Error getting usage summary:', error)
    return NextResponse.json(
      { error: error.message || 'Error getting usage summary' },
      { status: 500 }
    )
  }
}
