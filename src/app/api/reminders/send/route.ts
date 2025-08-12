import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireCompany } from '@/lib/auth-helpers'
import { SubscriptionService } from '@/lib/services/subscription'

// Contract: send reminders with quota enforcement. This endpoint stubs the actual delivery.
// POST /api/reminders/send
// Body: {
//   channel: 'email' | 'sms' | 'whatsapp',
//   message: string,
//   recipients?: string[], // If provided, amount = recipients.length
//   count?: number         // Otherwise, fallback to a numeric count
// }

const schema = z.object({
  channel: z.enum(['email', 'sms', 'whatsapp']),
  message: z.string().min(1),
  recipients: z.array(z.string().min(1)).optional(),
  count: z.number().int().positive().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const companyId = await requireCompany(request)
    const body = await request.json()
    const data = schema.parse(body)

    const amount = Array.isArray(data.recipients) && data.recipients.length > 0
      ? data.recipients.length
      : (data.count || 1)

    // Enforce quota before sending
    const { remaining } = await SubscriptionService.ensureCanSendReminder(companyId, amount)

    // TODO: Implement actual delivery per channel
    // e.g., sendEmail(), sendSMS(), sendWhatsApp()
    // For now, simulate success

    // Track usage (1 per reminder)
    await SubscriptionService.trackReminderSent(companyId, amount)

    return NextResponse.json({
      ok: true,
      sent: amount,
      remaining_after: Math.max(0, remaining - amount),
    })
  } catch (error: any) {
    const msg = error?.message || 'Error sending reminders'
    const status = msg.includes('límite') || msg.toLowerCase().includes('limit') ? 429 : 400
    return NextResponse.json({ ok: false, error: msg }, { status })
  }
}
