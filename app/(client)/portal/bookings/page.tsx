import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientBookingView from '@/components/client/ClientBookingView'

export const metadata: Metadata = { title: 'Book a Session' }

export default async function ClientBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientProfile } = await supabase
    .from('client_profiles')
    .select('pt_id')
    .eq('user_id', user.id)
    .single()

  const [{ data: availability }, { data: upcomingBookings }] = await Promise.all([
    clientProfile?.pt_id
      ? supabase.from('availability').select('*').eq('pt_id', clientProfile.pt_id).order('day_of_week')
      : Promise.resolve({ data: [] }),
    supabase.from('bookings').select('*').eq('client_id', user.id)
      .gte('date', new Date().toISOString().split('T')[0]).order('date').order('time'),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">Book a Session</h1>
        <p className="mt-0.5 text-sm text-[#888888]">Choose from your PT&apos;s available slots</p>
      </div>
      <ClientBookingView
        clientId={user.id}
        ptId={clientProfile?.pt_id || ''}
        availability={availability || []}
        upcomingBookings={upcomingBookings || []}
      />
    </div>
  )
}
