'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Dumbbell } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ClientSessionList({ sessions }: { sessions: any[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  // Group by month
  const grouped: Record<string, any[]> = {}
  for (const session of sessions) {
    const month = new Date(session.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(session)
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([month, monthSessions]) => (
        <div key={month}>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#888888]">{month}</h2>
          <div className="space-y-2">
            {monthSessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-[#333333] bg-[#222222] overflow-hidden">
                <button
                  className="flex w-full items-center justify-between px-5 py-4 hover:bg-[#2a2a2a] transition-colors"
                  onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a2a2a]">
                      <Dumbbell size={14} className="text-[#c8c8c8]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{session.type}</p>
                      <p className="text-xs text-[#888888]">{formatDate(session.date)} · {session.duration} min</p>
                    </div>
                  </div>
                  {expanded === session.id
                    ? <ChevronUp size={16} className="text-[#888888]" />
                    : <ChevronDown size={16} className="text-[#888888]" />}
                </button>
                {expanded === session.id && (
                  <div className="border-t border-[#333333] px-5 py-4 space-y-3">
                    {session.notes && (
                      <p className="text-sm italic text-[#c8c8c8]">PT Note: &quot;{session.notes}&quot;</p>
                    )}
                    {session.exercises?.length > 0 ? (
                      <div>
                        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#888888]">Exercises</p>
                        <div className="space-y-1.5">
                          {session.exercises.map((ex: any) => (
                            <div key={ex.id} className="flex items-center justify-between rounded-lg bg-[#1a1a1a] px-4 py-2.5">
                              <span className="text-sm font-medium text-white">{ex.name}</span>
                              <span className="text-xs text-[#888888]">
                                {ex.sets} × {ex.reps}
                                {ex.weight ? ` @ ${ex.weight}kg` : ''}
                                {ex.rest_time ? ` · ${ex.rest_time}s rest` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#555555]">No exercises logged for this session.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
