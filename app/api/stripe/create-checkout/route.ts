import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { amount, description, clientEmail, priceId, invoiceId } = body

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    let session

    if (priceId) {
      // Use a pre-defined Stripe Price
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: clientEmail,
        success_url: `${appUrl}/portal/payments?success=1`,
        cancel_url: `${appUrl}/portal/payments?cancelled=1`,
        metadata: { invoice_id: invoiceId || '' },
      })
    } else {
      // Custom amount invoice
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: { name: description || 'Personal Training' },
              unit_amount: Math.round(parseFloat(amount) * 100),
            },
            quantity: 1,
          },
        ],
        customer_email: clientEmail,
        success_url: `${appUrl}/portal/payments?success=1`,
        cancel_url: `${appUrl}/portal/payments?cancelled=1`,
        metadata: { invoice_id: invoiceId || '' },
      })
    }

    return NextResponse.json({ sessionUrl: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
