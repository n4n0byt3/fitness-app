'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalendarDays, Clock, Check, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatDate, formatTime, DAYS_OF_WEEK, SESSION_TYPES } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/Badge'
import EmptyState from '@/components/shared/EmptyState'
import type { Availability, Booking } from '@/lib/types'
import Modal from '@/components/shared/Modal'

interface Props {
  clientId: string
  ptId: string
  availability: Availability[]
  upcomingBookings: Booking[]
}

function getNext7Days() {
  const days = []
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

export default function ClientBookingView({ clientId, ptId, availability, upcomingBookings }: Props) {
  const router = useRouter()
  const [bookings, setBookings] = useState(upcomingBookings)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0])
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const days = getNext7Days()

  function getAvailabilityForDate(date: Date): Availability | undefined {
    return availability.find(a => a.day_of_week === date.getDay())
  }

  function generateTimeSlots(avail: Availability): string[] {
    const slots: string[] = []
    const [startH, startM] = avail.start_time.split(':').map(Number)
    const [endH, endM] = avail.end_time.split(':').map(Number)
    let current = startH * 60 + startM
    const end = endH * 60 + endM
    while (current + 60 <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, '0')
      const m = (current % 60).toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
      current += 60
    }
    return slots
  }

  function isSlotBooked(date: string, time: string) {
    return bookings.some(b => b.date === date && b.time.slice(0, 5) === time && b.status !== 'cancelled')
  }

  async function handleBook() {
    if (!selectedSlot || !ptId) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('bookings').insert({
      client_id: clientId, pt_id: ptId,
      date: selectedSlot.date, time: selectedSlot.time,
      session_type: sessionType, status: 'pending',
    })
    if (error) { toast.error(error.message); setLoading(false); return }

    // Send confirmation email
    await fetch('/api/notifications/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId, date: formatDate(selectedSlot.date, 'long'),
        time: formatTime(selectedSlot.time), sessionType,
      }),
    })

    toast.success('Booking request sent! Your PT will confirm shortly.')
    setShowConfirm(false)
    setSelectedSlot(null)
    router.refresh()
    setLoading(false)
  }

  async function handleCancel(bookingId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
    if (error) { toast.error(error.message); return }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b))
    toast.success('Booking cancelled')
  }

  if (!ptId) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No trainer assigned"
        description="You haven't been assigned a personal trainer yet. Contact your gym."
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Availability Calendar */}
      <div className="rounded-xl border border-[#333333] bg-[#222222] p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white">Available Slots</h2>
        {availability.length === 0 ? (
          <p className="text-sm text-[#555555]">Your PT hasn&apos;t set their availability yet.</p>
        ) : (
          <div className="space-y-4">
            {days.map((day) => {
              const avail = getAvailabilityForDate(day)
              if (!avail) return null
              const dateStr = day.toISOString().split('T')[0]
              const slots = generateTimeSlots(avail)

              return (
                <div key={dateStr}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                    {day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((time) => {
                      const booked = isSlotBooked(dateStr, time)
                      const isSelected = selectedSlot?.date === dateStr && selectedSlot?.time === time
                      return (
                        <button
                          key={time}
                          disabled={booked}
                          onClick={() => { setSelectedSlot({ date: dateStr, time }); setShowConfirm(true) }}
                          className={cn(
                            'rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all',
                            booked
                              ? 'cursor-not-allowed bg-[#333333] text-[#444444] line-through'
                              : isSelected
                              ? 'bg-[#c8c8c8] text-[#1a1a1a]'
                              : 'bg-[#1a1a1a] text-[#c8c8c8] hover:bg-[#c8c8c8]/10 border border-[#333333]'
                          )}
                        >
                          {formatTime(time + ':00')}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upcoming Bookings */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">Upcoming Bookings</h2>
        {bookings.filter(b => b.status !== 'cancelled').length === 0 ? (
          <EmptyState icon={CalendarDays} title="No upcoming bookings" description="Select a slot above to book your next session." />
        ) : (
          <div className="space-y-2">
            {bookings.filter(b => b.status !== 'cancelled').map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 rounded-xl border border-[#333333] bg-[#222222] px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">{formatDate(booking.date, 'long')}</p>
                  <p className="text-xs text-[#888888]">{formatTime(booking.time)} · {booking.session_type}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <StatusBadge status={booking.status} />
                  {booking.status === 'confirmed' || booking.status === 'pending' ? (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="text-xs text-[#555555] hover:text-red-400 transition-colors uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Booking Modal */}
      {showConfirm && selectedSlot && (
        <Modal open onClose={() => setShowConfirm(false)} title="Confirm Booking">
          <div className="space-y-5">
            <div className="rounded-xl bg-[#1a1a1a] p-5">
              <p className="text-[10px] uppercase tracking-widest text-[#888888] mb-3">Session Details</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CalendarDays size={14} className="text-[#c8c8c8]" />
                  <span className="text-sm text-white">{formatDate(selectedSlot.date, 'long')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-[#c8c8c8]" />
                  <span className="text-sm text-white">{formatTime(selectedSlot.time + ':00')}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Session Type</label>
              <select value={sessionType} onChange={(e) => setSessionType(e.target.value)}
                className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none">
                {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <p className="text-xs text-[#888888]">Your booking will be sent to your PT for confirmation.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-[#333333] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#555555] hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={handleBook} disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#c8c8c8] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all">
                {loading && <Loader2 size={14} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
