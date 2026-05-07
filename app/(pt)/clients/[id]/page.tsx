import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientProfileTabs from '@/components/pt/ClientProfileTabs'
import Avatar from '@/components/shared/Avatar'
import { formatDate, getDaysSince } from '@/lib/utils'
import { CalendarDays, Target, Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'Client Profile' }

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: profile },
    { data: clientProfile },
    { data: sessions },
    { data: progressEntries },
    { data: progressPhotos },
    { data: invoices },
    { data: bookings },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase.from('client_profiles').select('*').eq('user_id', params.id).eq('pt_id', user.id).single(),
    supabase.from('sessions').select('*, exercises(*)').eq('client_id', params.id).eq('pt_id', user.id).order('date', { ascending: false }),
    supabase.from('progress_entries').select('*').eq('client_id', params.id).order('date'),
    supabase.from('progress_photos').select('*').eq('client_id', params.id).order('date', { ascending: false }),
    supabase.from('invoices').select('*').eq('client_id', params.id).eq('pt_id', user.id).order('created_at', { ascending: false }),
    supabase.from('bookings').select('*').eq('client_id', params.id).eq('pt_id', user.id).order('date', { ascending: false }).limit(10),
  ])

  if (!profile || !clientProfile) notFound()

  const daysSince = clientProfile.start_date ? getDaysSince(clientProfile.start_date) : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Client Header */}
      <div className="rounded-xl border border-[#333333] bg-[#222222] p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={profile.full_name} src={clientProfile.photo_url} size="xl" />

          <div className="flex-1">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
              {profile.full_name}
            </h1>
            <p className="mt-0.5 text-sm text-[#888888]">{profile.email}</p>
            {profile.phone && <p className="text-sm text-[#888888]">{profile.phone}</p>}

            {/* Stats row */}
            <div className="mt-4 flex flex-wrap gap-6">
              {clientProfile.start_date && (
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-[#c8c8c8]" />
                  <span className="text-xs text-[#888888]">
                    Started {formatDate(clientProfile.start_date, 'long')}
                  </span>
                </div>
              )}
              {daysSince !== null && (
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#c8c8c8]" />
                  <span className="text-xs text-[#888888]">{daysSince} days training</span>
                </div>
              )}
              {clientProfile.goal && (
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-[#c8c8c8]" />
                  <span className="text-xs text-[#888888]">{clientProfile.goal}</span>
                </div>
              )}
              {sessions && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#c8c8c8]">{sessions.length}</span>
                  <span className="text-xs text-[#888888]">total sessions</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ClientProfileTabs
        clientId={params.id}
        ptId={user.id}
        profile={profile}
        clientProfile={clientProfile}
        sessions={sessions || []}
        progressEntries={progressEntries || []}
        progressPhotos={progressPhotos || []}
        invoices={invoices || []}
        bookings={bookings || []}
      />
    </div>
  )
}
