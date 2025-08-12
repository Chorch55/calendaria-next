import { NextResponse } from 'next/server'
import { STRIPE_PLANS, STRIPE_ADDONS, PLAN_LIMITS, ADDON_DISPLAY } from '@/config/billing'
import { FEATURE_MATRIX } from '@/config/features'

export async function GET() {
  // Exponer configuración en cliente para UI de billing
  return NextResponse.json({ plans: STRIPE_PLANS, addons: STRIPE_ADDONS, features: FEATURE_MATRIX, planLimits: PLAN_LIMITS, addonDisplay: ADDON_DISPLAY })
}
