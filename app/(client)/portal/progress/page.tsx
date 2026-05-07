import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientProgressView from '@/components/client/ClientProgressView'

export const metadata: Metadata = { title: 'My Progress' }

export default async function ClientProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: progressEntries }, { data: progressPhotos }, { data: sessions }] = await Promise.all([
    supabase.from('progress_entries').select('*').eq('client_id', user.id).order('date'),
    supabase.from('progress_photos').select('*').eq('client_id', user.id).order('date', { ascending: false }),
    supabase.from('sessions').select('*, exercises(*)').eq('client_id', user.id).order('date'),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">My Progress</h1>
        <p className="mt-0.5 text-sm text-[#888888]">Track your fitness journey</p>
      </div>
      <ClientProgressView
        clientId={user.id}
        progressEntries={progressEntries || []}
        progressPhotos={progressPhotos || []}
        sessions={sessions || []}
      />
    </div>
  )
}
