import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInvoiceNotification } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { to, clientName, amount, description, dueDate, paymentUrl } = await request.json()

    await sendInvoiceNotification({ to, clientName, amount, description, dueDate, paymentUrl })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
