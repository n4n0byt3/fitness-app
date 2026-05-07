import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// DELETE THIS FILE after confirming emails work
export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get('to')
  if (!to) return NextResponse.json({ error: 'Pass ?to=your@email.com' }, { status: 400 })

  const key = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  if (!key) return NextResponse.json({ error: 'RESEND_API_KEY not set' }, { status: 500 })

  const resend = new Resend(key)
  const { data, error } = await resend.emails.send({
    from: `L'Estrange Fitness <${from}>`,
    to,
    subject: 'Test email from L\'Estrange Fitness',
    html: '<p>If you got this, Resend is working correctly.</p>',
  })

  if (error) {
    return NextResponse.json({ ok: false, error, from, keyPrefix: key.slice(0, 8) })
  }

  return NextResponse.json({ ok: true, id: data?.id, from, keyPrefix: key.slice(0, 8) })
}
