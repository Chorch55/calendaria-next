import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_ADDONS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Expect STRIPE_WEBHOOK_SECRET in env

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Get raw body
  const body = await request.text()

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const stripe_subscription_id = sub.id as string
        const status = String(sub.status || '').toUpperCase()
        const current_period_start = new Date((sub.current_period_start || 0) * 1000)
        const current_period_end = new Date((sub.current_period_end || 0) * 1000)
        const cancel_at_period_end = Boolean(sub.cancel_at_period_end)
        const canceled_at = sub.canceled_at ? new Date(sub.canceled_at * 1000) : null
        const ended_at = sub.ended_at ? new Date(sub.ended_at * 1000) : null

        // Find subscription by stripe_subscription_id
        const existing = await prisma.subscription.findFirst({
          where: { stripe_subscription_id }
        })

        if (existing) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              status: status as any,
              current_period_start,
              current_period_end,
              cancel_at_period_end,
              canceled_at,
              ended_at,
            }
          })

          // Sync addons from subscription items (if addon prices are attached)
          try {
            const items = sub.items?.data || []
            const addonPayload: { addon_type: any; name: string; unit_amount: number; quantity: number; stripe_price_id: string | null }[] = []
            for (const it of items) {
              const priceId = it.price?.id
              const qty = it.quantity || 1
              if (!priceId) continue
              let addon_type: any = null
              if (priceId === STRIPE_ADDONS.EXTRA_USERS) addon_type = 'EXTRA_USERS'
              if (priceId === STRIPE_ADDONS.EXTRA_STORAGE) addon_type = 'EXTRA_STORAGE'
              if (priceId === STRIPE_ADDONS.API_CALLS) addon_type = 'API_CALLS'
              if (priceId === STRIPE_ADDONS.INTEGRATIONS) addon_type = 'INTEGRATIONS'
              if (priceId === STRIPE_ADDONS.CUSTOM_BRANDING) addon_type = 'CUSTOM_BRANDING'
              if (addon_type) {
                addonPayload.push({
                  addon_type,
                  name: addon_type.toLowerCase(),
                  unit_amount: it.price?.unit_amount ?? 0,
                  quantity: qty,
                  stripe_price_id: priceId,
                })
              }
            }
            if (addonPayload.length) {
              // Simple strategy: delete existing addons and re-create
              await prisma.subscriptionAddon.deleteMany({ where: { subscription_id: existing.id } })
              for (const ap of addonPayload) {
                await prisma.subscriptionAddon.create({
                  data: {
                    subscription_id: existing.id,
                    addon_type: ap.addon_type,
                    name: ap.name,
                    description: null,
                    unit_amount: ap.unit_amount,
                    quantity: ap.quantity,
                    stripe_price_id: ap.stripe_price_id,
                  }
                })
              }
            }
          } catch (e) {
            console.error('Error syncing addons from subscription items:', e)
          }
        }
        break
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const inv = event.data.object
        const stripe_invoice_id = inv.id as string
        const subscriptionId = inv.subscription as string | null

        if (subscriptionId) {
          const subscription = await prisma.subscription.findFirst({
            where: { stripe_subscription_id: subscriptionId }
          })
          if (subscription) {
            await prisma.invoice.upsert({
              where: { stripe_invoice_id },
              update: {
                status: (inv.status || 'open').toUpperCase() as any,
                amount_due: inv.amount_due ?? 0,
                amount_paid: inv.amount_paid ?? 0,
                currency: (inv.currency || 'USD').toUpperCase(),
                invoice_date: new Date((inv.created || Date.now()/1000) * 1000),
                due_date: new Date((inv.due_date || inv.created || Date.now()/1000) * 1000),
                paid_at: inv.status === 'paid' ? new Date() : null,
                line_items: {},
                billing_details: {},
              },
              create: {
                subscription_id: subscription.id,
                stripe_invoice_id,
                invoice_number: inv.number || stripe_invoice_id,
                amount_due: inv.amount_due ?? 0,
                amount_paid: inv.amount_paid ?? 0,
                currency: (inv.currency || 'USD').toUpperCase(),
                status: (inv.status || 'open').toUpperCase() as any,
                invoice_date: new Date((inv.created || Date.now()/1000) * 1000),
                due_date: new Date((inv.due_date || inv.created || Date.now()/1000) * 1000),
                paid_at: inv.status === 'paid' ? new Date() : null,
                line_items: {},
                billing_details: {},
              }
            })
          }
        }
        break
      }
      default:
        // No-op; helpful to keep logs during development
        break
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error)
    return NextResponse.json({ error: 'Webhook handling error' }, { status: 500 })
  }
}
