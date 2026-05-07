import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// DELETE THIS FILE after confirming emails work
export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get('to')
  if (!to) return NextResponse.json({ error: 'Pass ?to=your@email.com' }, { status: 400 })

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    return NextResponse.json({ error: 'GMAIL_USER or GMAIL_APP_PASSWORD not set' }, { status: 500 })
  }

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
    await transporter.sendMail({
      from: `L'Estrange Fitness <${user}>`,
      to,
      subject: 'Test email — L\'Estrange Fitness',
      html: '<p>If you got this, Gmail sending is working correctly.</p>',
    })
    return NextResponse.json({ ok: true, from: user })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}
