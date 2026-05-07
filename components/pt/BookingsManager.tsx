'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Check, X, CalendarDays, Clock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatDate, formatTime, DAYS_OF_WEEK, SHORT_DAYS, SESSION_TYPES } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/Badge'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import type { Booking, Availability, Profile } from '@/lib/types'

interface Props {
  ptId: string
  initialBookings: any[]
  initialAvailability: Availability[]
  clients: Profile[]
}

export default function BookingsManager({ ptId, initialBookings, initialAvailability, clients }: Props) {
  const router = useRouter()
  const [bookings, setBookings] = useState(initialBookings)
  const [availability, setAvailability] = useState(initialAvailability)
  const [activeView, setActiveView] = useState<'upcoming' | 'availability'>('upcoming')
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [savingAvail, setSavingAvail] = useState(false)

  // Availability edit state
  const [availEdit, setAvailEdit] = useState<Record<number, { start: string; end: string; enabled: boolean }>>(
    Object.fromEntries(DAYS_OF_WEEK.map((_, i) => {
      const existing = initialAvailability.find(a => a.day_of_week === i)
      return [i, { start: existing?.start_time || '09:00', end: existing?.end_time || '17:00', enabled: !!existing }]
    }))
  )

  async function updateBookingStatus(id: string, status: 'confirmed' | 'cancelled') {
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (error) { toast.error(error.message); return }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    toast.success(`Booking ${status}`)
  }

  async function saveAvailability() {
    setSavingAvail(true)
    const supabase = createClient()
    const { error: delError } = await supabase.from('availability').delete().eq('pt_id', ptId)
    if (delError) { toast.error(delError.message); setSavingAvail(false); return }
    const rows = Object.entries(availEdit)
      .filter(([, v]) => v.enabled)
      .map(([day, v]) => ({ pt_id: ptId, day_of_week: parseInt(day), start_time: v.start, end_time: v.end }))
    if (rows.length > 0) {
      const { error } = await supabase.from('availability').insert(rows)
      if (error) { toast.error(error.message); setSavingAvail(false); return }
    }
    setAvailability(rows.map(r => ({ ...r, id: '', created_at: '' })))
    toast.success('Availability saved')
    setSavingAvail(false)
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-1 rounded-xl border border-[#333333] bg-[#222222] p-1 w-fit">
        {(['upcoming', 'availability'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={cn(
              'rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
              activeView === v ? 'bg-[#c8c8c8]/10 text-white' : 'text-[#555555] hover:text-[#888888]'
            )}
          >
            {v === 'upcoming' ? 'Upcoming Bookings' : 'My Availability'}
          </button>
        ))}
      </div>

      {/* Upcoming Bookings */}
      {activeView === 'upcoming' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewBooking(true)}
              className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white transition-all"
            >
              <Plus size={14} /> New Booking
            </button>
          </div>
          {bookings.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming bookings" description="Confirm client bookings or create them manually." />
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 rounded-xl border border-[#333333] bg-[#222222] px-5 py-4">
                  <div className="w-20 shrink-0">
                    <p className="text-xs font-semibold text-[#c8c8c8]">{formatDate(booking.date)}</p>
                    <p className="text-xs text-[#888888]">{formatTime(booking.time)}</p>
                  </div>
                  <div className="h-10 w-px bg-[#333333]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{booking.profiles?.full_name}</p>
                    <p className="text-xs text-[#888888]">{booking.session_type}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Confirm"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Availability */}
      {activeView === 'availability' && (
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-6 space-y-4">
          <p className="text-sm text-[#888888]">Set the days and hours you&apos;re available for sessions.</p>
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day, i) => (
              <div key={day} className="flex items-center gap-4 rounded-lg bg-[#1a1a1a] px-4 py-3">
                <label className="flex items-center gap-3 w-32 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availEdit[i].enabled}
                    onChange={(e) => setAvailEdit(prev => ({ ...prev, [i]: { ...prev[i], enabled: e.target.checked } }))}
                    className="h-4 w-4 rounded border-[#333333] bg-[#222222] accent-[#c8c8c8]"
                  />
                  <span className={cn('text-sm font-medium', availEdit[i].enabled ? 'text-white' : 'text-[#555555]')}>{day}</span>
                </label>
                {availEdit[i].enabled && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={availEdit[i].start}
                      onChange={(e) => setAvailEdit(prev => ({ ...prev, [i]: { ...prev[i], start: e.target.value } }))}
                      className="rounded-lg border border-[#333333] bg-[#222222] px-3 py-1.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none"
                    />
                    <span className="text-[#555555]">to</span>
                    <input
                      type="time"
                      value={availEdit[i].end}
                      onChange={(e) => setAvailEdit(prev => ({ ...prev, [i]: { ...prev[i], end: e.target.value } }))}
                      className="rounded-lg border border-[#333333] bg-[#222222] px-3 py-1.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={saveAvailability}
              disabled={savingAvail}
              className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all"
            >
              {savingAvail && <Loader2 size={14} className="animate-spin" />}
              Save Availability
            </button>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {showNewBooking && (
        <NewBookingModal
          ptId={ptId}
          clients={clients}
          onClose={() => setShowNewBooking(false)}
          onSaved={() => { setShowNewBooking(false); router.refresh() }}
        />
      )}
    </div>
  )
}

function NewBookingModal({ ptId, clients, onClose, onSaved }: {
  ptId: string; clients: Profile[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    client_id: clients[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    session_type: SESSION_TYPES[0],
    status: 'confirmed' as const,
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('bookings').insert({ ...form, pt_id: ptId })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Booking created')
    onSaved()
  }

  return (
    <Modal open onClose={onClose} title="Create Booking">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Client</label>
          <select value={form.client_id} onChange={(e) => setForm(p => ({ ...p, client_id: e.target.value }))}
            className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none">
            {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} required
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Time</label>
            <input type="time" value={form.time} onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))} required
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Session Type</label>
          <select value={form.session_type} onChange={(e) => setForm(p => ({ ...p, session_type: e.target.value }))}
            className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none">
            {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#333333] pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#333333] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#555555] hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Create Booking
          </button>
        </div>
      </form>
    </Modal>
  )
}
