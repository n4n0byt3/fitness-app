import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBookingConfirmation } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { clientId, date, time, sessionType } = await request.json()

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', clientId)
      .single()

    if (!profile) return NextResponse.json({ ok: true })

    await sendBookingConfirmation({
      to: profile.email,
      clientName: profile.full_name,
      date,
      time,
      sessionType,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
