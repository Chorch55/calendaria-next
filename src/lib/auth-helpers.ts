import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function requireCompany(request: NextRequest) {
  const token = await getToken({ req: request })
  if (!token?.companyId) {
    throw new Error('Unauthorized')
  }
  return token.companyId as string
}

export async function requireRole(request: NextRequest, allowed: string[]) {
  const token = await getToken({ req: request })
  if (!token?.role || !allowed.includes(token.role as string)) {
    throw new Error('Forbidden')
  }
  return token
}
