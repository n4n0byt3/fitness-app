import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UserPlus, Users } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import ClientCard from '@/components/pt/ClientCard'
import AddClientButton from '@/components/pt/AddClientButton'
import type { ClientWithProfile } from '@/lib/types'

export const metadata: Metadata = { title: 'Clients' }

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: clientProfiles } = await supabase
    .from('client_profiles')
    .select(`
      *,
      profile:profiles!client_profiles_user_id_fkey(*)
    `)
    .eq('pt_id', user.id)
    .order('created_at', { ascending: false })

  const clientIds = (clientProfiles || []).map((cp: any) => cp.user_id)

  let sessionData: any[] = []
  if (clientIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select('client_id, date')
      .eq('pt_id', user.id)
      .in('client_id', clientIds)
      .order('date', { ascending: false })
    sessionData = data || []
  }

  const clients: ClientWithProfile[] = (clientProfiles || []).map((cp: any) => {
    const clientSessions = sessionData.filter((s) => s.client_id === cp.user_id)
    return {
      ...cp.profile,
      client_profile: cp,
      last_session_date: clientSessions[0]?.date || null,
      session_count: clientSessions.length,
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">Clients</h1>
          <p className="mt-0.5 text-sm text-[#888888]">
            {clients.length} active client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddClientButton ptId={user.id} />
      </div>

      {/* Grid */}
      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to get started tracking their progress and sessions."
          action={<AddClientButton ptId={user.id} variant="subtle" />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  )
}
