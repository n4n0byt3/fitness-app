'use client'

import Link from 'next/link'
import { CalendarDays, TrendingUp, MoreVertical } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import { formatDate, getDaysSince } from '@/lib/utils'
import type { ClientWithProfile } from '@/lib/types'

interface ClientCardProps {
  client: ClientWithProfile
}

export default function ClientCard({ client }: ClientCardProps) {
  const daysSince = client.client_profile?.start_date
    ? getDaysSince(client.client_profile.start_date)
    : null

  return (
    <Link
      href={`/clients/${client.id}`}
      className="group relative flex flex-col gap-4 rounded-xl border border-[#333333] bg-[#222222] p-5 transition-all hover:border-[#c8c8c8]/30 hover:bg-[#2a2a2a]"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar
          name={client.full_name}
          src={client.client_profile?.photo_url}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold uppercase tracking-wide text-white group-hover:text-[#c8c8c8]">
            {client.full_name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-[#888888]">{client.email}</p>
          {client.client_profile?.goal && (
            <p className="mt-1.5 line-clamp-1 text-xs text-[#666666]">
              Goal: {client.client_profile.goal}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 border-t border-[#333333] pt-4">
        <div className="flex items-center gap-1.5 text-[#888888]">
          <CalendarDays size={12} />
          <span className="text-[11px]">
            {client.last_session_date
              ? formatDate(client.last_session_date, 'relative')
              : 'No sessions'}
          </span>
        </div>
        {daysSince !== null && (
          <div className="flex items-center gap-1.5 text-[#888888]">
            <TrendingUp size={12} />
            <span className="text-[11px]">{daysSince}d training</span>
          </div>
        )}
        {client.session_count !== undefined && (
          <div className="ml-auto text-[11px] font-semibold text-[#c8c8c8]">
            {client.session_count} sessions
          </div>
        )}
      </div>
    </Link>
  )
}
