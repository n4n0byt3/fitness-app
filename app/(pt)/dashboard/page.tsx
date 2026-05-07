import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Users, Dumbbell, PoundSterling, AlertCircle, Clock, ChevronRight } from 'lucide-react'
import StatCard from '@/components/pt/StatCard'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/Badge'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [
    { count: totalClients },
    { count: sessionsThisWeek },
    { data: paidInvoices },
    { data: outstandingInvoices },
    { data: todayBookings },
    { data: recentSessions },
    { data: recentActivity },
    { data: profile },
  ] = await Promise.all([
    supabase.from('client_profiles').select('*', { count: 'exact', head: true }).eq('pt_id', user.id),
    supabase.from('sessions').select('*', { count: 'exact', head: true })
      .eq('pt_id', user.id)
      .gte('date', weekStart.toISOString().split('T')[0]),
    supabase.from('invoices').select('amount')
      .eq('pt_id', user.id).eq('status', 'paid').gte('created_at', monthStart),
    supabase.from('invoices').select('id, amount, client_id, profiles!invoices_client_id_fkey(full_name)')
      .eq('pt_id', user.id).in('status', ['outstanding', 'overdue']),
    supabase.from('bookings')
      .select('*, profiles!bookings_client_id_fkey(full_name)')
      .eq('pt_id', user.id).eq('date', today)
      .neq('status', 'cancelled').order('time'),
    supabase.from('sessions')
      .select('*, profiles!sessions_client_id_fkey(full_name)')
      .eq('pt_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('invoices')
      .select('id, amount, status, created_at, profiles!invoices_client_id_fkey(full_name)')
      .eq('pt_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
  ])

  const revenueThisMonth = (paidInvoices || []).reduce((sum, inv) => sum + Number(inv.amount), 0)
  const outstandingTotal = (outstandingInvoices || []).reduce((sum, inv) => sum + Number(inv.amount), 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#888888]">
            {greeting()}
          </p>
          <h1 className="mt-1 text-2xl font-bold uppercase tracking-wider text-white">
            {profile?.full_name || 'Trainer'}
          </h1>
          <p className="mt-0.5 text-sm text-[#555555]">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Clients" value={totalClients || 0} icon={Users} />
        <StatCard label="Sessions This Week" value={sessionsThisWeek || 0} icon={Dumbbell} />
        <StatCard label="Revenue This Month" value={formatCurrency(revenueThisMonth)} icon={PoundSterling} highlight />
        <StatCard label="Outstanding" value={formatCurrency(outstandingTotal)} icon={AlertCircle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div className="rounded-xl border border-[#333333] bg-[#222222]">
          <div className="flex items-center justify-between border-b border-[#333333] px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Today&apos;s Schedule
            </h2>
            <Link href="/bookings" className="text-[10px] uppercase tracking-wider text-[#888888] hover:text-[#c8c8c8] transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#333333]">
            {!todayBookings?.length ? (
              <div className="flex items-center gap-3 px-5 py-8 text-center">
                <Clock size={16} className="mx-auto text-[#555555]" />
                <p className="text-sm text-[#555555]">No sessions scheduled today</p>
              </div>
            ) : (
              todayBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-14 text-center">
                    <p className="text-sm font-semibold text-[#c8c8c8]">{formatTime(booking.time)}</p>
                  </div>
                  <div className="h-8 w-px bg-[#333333]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{booking.profiles?.full_name}</p>
                    <p className="text-xs text-[#888888]">{booking.session_type}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-[#333333] bg-[#222222]">
          <div className="flex items-center justify-between border-b border-[#333333] px-5 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-[#333333]">
            {!recentSessions?.length ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-[#555555]">No recent activity</p>
              </div>
            ) : (
              recentSessions.map((session: any) => (
                <div key={session.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a]">
                    <Dumbbell size={14} className="text-[#c8c8c8]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {session.profiles?.full_name}
                    </p>
                    <p className="text-xs text-[#888888]">
                      {session.type} · {formatDate(session.date, 'relative')}
                    </p>
                  </div>
                  <Link
                    href={`/clients/${session.client_id}`}
                    className="shrink-0 text-[#555555] hover:text-[#c8c8c8] transition-colors"
                  >
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Outstanding Invoices */}
      {outstandingInvoices && outstandingInvoices.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-400" />
              <p className="text-sm font-semibold text-amber-400">
                {outstandingInvoices.length} outstanding invoice{outstandingInvoices.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/payments"
              className="text-[11px] uppercase tracking-wider text-amber-400/70 hover:text-amber-400 transition-colors"
            >
              Manage →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
