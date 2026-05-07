import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Dumbbell } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import ClientSessionList from '@/components/client/ClientSessionList'

export const metadata: Metadata = { title: 'My Sessions' }

export default async function ClientSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, exercises(*)')
    .eq('client_id', user.id)
    .order('date', { ascending: false })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">My Sessions</h1>
        <p className="mt-0.5 text-sm text-[#888888]">{sessions?.length || 0} total sessions</p>
      </div>
      {!sessions?.length ? (
        <EmptyState icon={Dumbbell} title="No sessions yet" description="Your training sessions will appear here after your PT logs them." />
      ) : (
        <ClientSessionList sessions={sessions} />
      )}
    </div>
  )
}
