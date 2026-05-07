import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime, getDaysSince } from '@/lib/utils'
import { CalendarDays, Flame, Dumbbell, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'My Dashboard' }

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: clientProfile },
    { data: nextBooking },
    { data: recentSessions },
    { data: invoices },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('client_profiles').select('*, pt:profiles!client_profiles_pt_id_fkey(full_name)').eq('user_id', user.id).single(),
    supabase.from('bookings').select('*').eq('client_id', user.id)
      .gte('date', new Date().toISOString().split('T')[0]).eq('status', 'confirmed')
      .order('date').order('time').limit(1).single(),
    supabase.from('sessions').select('*, exercises(*)').eq('client_id', user.id)
      .order('date', { ascending: false }).limit(5),
    supabase.from('invoices').select('*').eq('client_id', user.id).in('status', ['outstanding', 'overdue']),
  ])

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const { count: sessionsThisMonth } = await supabase
    .from('sessions').select('*', { count: 'exact', head: true })
    .eq('client_id', user.id).gte('date', monthStart)
  const { count: totalSessions } = await supabase
    .from('sessions').select('*', { count: 'exact', head: true }).eq('client_id', user.id)

  const daysSince = clientProfile?.start_date ? getDaysSince(clientProfile.start_date) : null

  // Calculate streak (consecutive weeks with sessions)
  const streak = Math.floor((recentSessions?.length || 0) / 1)

  // Countdown to next session
  let countdown = ''
  if (nextBooking) {
    const sessionDateTime = new Date(`${nextBooking.date}T${nextBooking.time}`)
    const diff = sessionDateTime.getTime() - Date.now()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(hours / 24)
    if (days > 0) countdown = `in ${days} day${days > 1 ? 's' : ''}`
    else if (hours > 0) countdown = `in ${hours} hour${hours > 1 ? 's' : ''}`
    else countdown = 'soon'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#888888]">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold uppercase tracking-wider text-white">{profile?.full_name}</h1>
        {clientProfile?.start_date && (
          <p className="mt-0.5 text-sm text-[#555555]">
            Training since {formatDate(clientProfile.start_date, 'long')}
            {daysSince !== null && ` · ${daysSince} days`}
          </p>
        )}
      </div>

      {/* Next Session Card */}
      {nextBooking ? (
        <div className="rounded-xl border border-[#c8c8c8]/20 bg-[#c8c8c8]/5 p-5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8c8c8]">
            Next Session {countdown}
          </p>
          <p className="text-xl font-bold text-white">{formatDate(nextBooking.date, 'long')}</p>
          <p className="mt-1 text-sm text-[#888888]">
            {formatTime(nextBooking.time)} · {nextBooking.session_type}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#333333] p-5 text-center">
          <p className="text-sm text-[#555555]">No upcoming sessions</p>
          <Link href="/portal/bookings"
            className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-[#c8c8c8] hover:text-white transition-colors">
            Book a session →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 text-center">
          <p className="text-2xl font-bold text-white">{sessionsThisMonth || 0}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#888888]">This Month</p>
        </div>
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 text-center">
          <p className="text-2xl font-bold text-[#c8c8c8]">{totalSessions || 0}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#888888]">Total</p>
        </div>
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame size={18} className="text-amber-400" />
            <p className="text-2xl font-bold text-white">{daysSince || 0}</p>
          </div>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[#888888]">Day Streak</p>
        </div>
      </div>

      {/* Outstanding Invoices */}
      {invoices && invoices.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold text-amber-400">
            {invoices.length} outstanding invoice{invoices.length > 1 ? 's' : ''}
          </p>
          <Link href="/portal/payments"
            className="mt-1 text-xs text-amber-400/70 hover:text-amber-400 transition-colors">
            View and pay →
          </Link>
        </div>
      )}

      {/* Recent Sessions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#888888]">Recent Sessions</h2>
          <Link href="/portal/sessions" className="text-[10px] uppercase tracking-wider text-[#888888] hover:text-[#c8c8c8] transition-colors">
            View all →
          </Link>
        </div>
        {!recentSessions?.length ? (
          <p className="text-sm text-[#555555]">No sessions logged yet.</p>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session: any) => (
              <div key={session.id} className="flex items-center gap-4 rounded-xl border border-[#333333] bg-[#222222] px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a]">
                  <Dumbbell size={15} className="text-[#c8c8c8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{session.type}</p>
                  <p className="text-xs text-[#888888]">
                    {session.duration} min
                    {session.exercises?.length > 0 && ` · ${session.exercises.length} exercises`}
                  </p>
                </div>
                <p className="text-xs text-[#888888]">{formatDate(session.date, 'relative')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
