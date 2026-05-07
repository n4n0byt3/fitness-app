import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Dumbbell } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Sessions' }

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, profiles!sessions_client_id_fkey(id, full_name), exercises(*)')
    .eq('pt_id', user.id)
    .order('date', { ascending: false })

  const grouped: Record<string, any[]> = {}
  for (const session of sessions || []) {
    const month = new Date(session.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(session)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">Sessions</h1>
        <p className="mt-0.5 text-sm text-[#888888]">{sessions?.length || 0} total sessions</p>
      </div>

      {!sessions?.length ? (
        <EmptyState
          icon={Dumbbell}
          title="No sessions logged"
          description="Sessions you log on client profiles will appear here."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([month, monthSessions]) => (
            <div key={month}>
              <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#888888]">
                {month}
              </h2>
              <div className="space-y-2">
                {monthSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/clients/${session.profiles?.id}`}
                    className="flex items-center gap-4 rounded-xl border border-[#333333] bg-[#222222] px-5 py-4 transition-all hover:border-[#c8c8c8]/20 hover:bg-[#2a2a2a]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a]">
                      <Dumbbell size={16} className="text-[#c8c8c8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{session.profiles?.full_name}</p>
                      <p className="text-xs text-[#888888]">
                        {session.type} · {session.duration} min
                        {session.exercises?.length > 0 && ` · ${session.exercises.length} exercises`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#c8c8c8]">{formatDate(session.date)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
