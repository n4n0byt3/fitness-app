import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS, doesn't touch the PT's browser session
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    // Verify the requester is an authenticated PT
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: ptProfile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (ptProfile?.role !== 'pt') {
      return NextResponse.json({ error: 'Only PTs can add clients' }, { status: 403 })
    }

    const body = await request.json()
    const { email, full_name, phone, goal, start_date, notes } = body
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const admin = getServiceClient()

    // Check if a profile already exists for this email
    const { data: existingProfile } = await admin
      .from('profiles').select('id, full_name, email').eq('email', email).single()

    let clientUserId: string
    let isNewUser = false

    if (existingProfile) {
      // User already registered — just link them
      clientUserId = existingProfile.id
    } else {
      // Not registered — create their account using a secure random password
      // They can reset it via "Forgot password" when they first log in
      const tempPassword = crypto.randomUUID()
      const { data: newAuth, error: createError } = await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // auto-confirm so they can sign in straight away
        user_metadata: { full_name: full_name || email.split('@')[0], role: 'client' },
      })
      if (createError) throw createError
      clientUserId = newAuth.user.id
      isNewUser = true

      // Ensure profile row exists (trigger may not have fired)
      await admin.from('profiles').upsert({
        id: clientUserId,
        role: 'client',
        full_name: full_name || email.split('@')[0],
        email,
      }, { onConflict: 'id' })
    }

    // Update profile with any extra details provided
    if (full_name || phone) {
      await admin.from('profiles').update({
        ...(full_name && { full_name }),
        ...(phone && { phone }),
      }).eq('id', clientUserId)
    }

    // Check they're not already linked to this PT
    const { data: existing } = await admin
      .from('client_profiles')
      .select('id')
      .eq('user_id', clientUserId)
      .eq('pt_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This client is already linked to your account' }, { status: 409 })
    }

    // Create the PT–client link
    const { error: cpError } = await admin.from('client_profiles').insert({
      user_id: clientUserId,
      pt_id: user.id,
      goal: goal || null,
      start_date: start_date || null,
      notes: notes || null,
    })
    if (cpError) throw cpError

    return NextResponse.json({ ok: true, isNewUser, clientUserId })
  } catch (err: any) {
    console.error('Add client error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Search for an existing user by email (so PT can see if they're already registered)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = request.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ found: false })

  const admin = getServiceClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', email.toLowerCase().trim())
    .single()

  return NextResponse.json(profile ? { found: true, profile } : { found: false })
}
