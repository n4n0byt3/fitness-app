import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BookingsManager from '@/components/pt/BookingsManager'

export const metadata: Metadata = { title: 'Bookings' }

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: bookings },
    { data: availability },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, profiles!bookings_client_id_fkey(full_name, email)')
      .eq('pt_id', user.id)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date').order('time'),
    supabase.from('availability').select('*').eq('pt_id', user.id).order('day_of_week'),
    supabase
      .from('client_profiles')
      .select('user_id, profiles!client_profiles_user_id_fkey(id, full_name, email)')
      .eq('pt_id', user.id),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">Bookings</h1>
        <p className="mt-0.5 text-sm text-[#888888]">Manage your schedule and availability</p>
      </div>
      <BookingsManager
        ptId={user.id}
        initialBookings={bookings || []}
        initialAvailability={availability || []}
        clients={(clients || []).map((c: any) => c.profiles).filter(Boolean)}
      />
    </div>
  )
}
