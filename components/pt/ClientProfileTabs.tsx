'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn, formatDate, formatCurrency, SESSION_TYPES, METRICS } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/Badge'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import { Dumbbell, TrendingUp, CreditCard, FileText, ChevronDown, ChevronUp, Plus, Loader2, Camera } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { Profile, ClientProfile, Session, ProgressEntry, ProgressPhoto, Invoice, Booking } from '@/lib/types'

interface Props {
  clientId: string
  ptId: string
  profile: Profile
  clientProfile: ClientProfile
  sessions: Session[]
  progressEntries: ProgressEntry[]
  progressPhotos: ProgressPhoto[]
  invoices: Invoice[]
  bookings: Booking[]
}

const TABS = ['Overview', 'Sessions', 'Progress', 'Payments'] as const
type Tab = typeof TABS[number]

export default function ClientProfileTabs({
  clientId, ptId, profile, clientProfile, sessions, progressEntries, progressPhotos, invoices, bookings,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0])
  const router = useRouter()

  const chartData = progressEntries
    .filter((e) => e.metric === selectedMetric)
    .map((e) => ({ date: formatDate(e.date, 'short'), value: Number(e.value) }))

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl border border-[#333333] bg-[#222222] p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider transition-all',
              activeTab === tab
                ? 'bg-[#c8c8c8]/10 text-white'
                : 'text-[#555555] hover:text-[#888888]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'Overview' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#333333] bg-[#222222] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#888888]">Total Sessions</p>
              <p className="mt-1 text-3xl font-bold text-white">{sessions.length}</p>
            </div>
            <div className="rounded-xl border border-[#333333] bg-[#222222] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#888888]">Outstanding</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {formatCurrency(invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + Number(i.amount), 0))}
              </p>
            </div>
            <div className="rounded-xl border border-[#333333] bg-[#222222] p-4">
              <p className="text-[10px] uppercase tracking-widest text-[#888888]">Paid Total</p>
              <p className="mt-1 text-3xl font-bold text-[#c8c8c8]">
                {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0))}
              </p>
            </div>
          </div>

          {clientProfile.notes && (
            <div className="rounded-xl border border-[#333333] bg-[#222222] p-5">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#888888]">Notes</h3>
              <p className="text-sm leading-relaxed text-[#c8c8c8]">{clientProfile.notes}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowSessionModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white transition-all"
            >
              <Plus size={14} /> Log Session
            </button>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-2 rounded-lg border border-[#333333] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#c8c8c8]/30 hover:text-[#c8c8c8] transition-all"
            >
              <FileText size={14} /> Create Invoice
            </button>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'Sessions' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#888888]">{sessions.length} sessions</p>
            <button
              onClick={() => setShowSessionModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white transition-all"
            >
              <Plus size={14} /> Log Session
            </button>
          </div>
          {sessions.length === 0 ? (
            <EmptyState icon={Dumbbell} title="No sessions logged" description="Log your first session to start tracking this client's progress." />
          ) : (
            <div className="space-y-2">
              {sessions.map((session: any) => (
                <div key={session.id} className="rounded-xl border border-[#333333] bg-[#222222] overflow-hidden">
                  <button
                    className="flex w-full items-center justify-between px-5 py-4 hover:bg-[#2a2a2a] transition-colors"
                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-left text-sm font-semibold text-white">{session.type}</p>
                        <p className="text-xs text-[#888888]">{formatDate(session.date)} · {session.duration} min</p>
                      </div>
                    </div>
                    {expandedSession === session.id
                      ? <ChevronUp size={16} className="text-[#888888]" />
                      : <ChevronDown size={16} className="text-[#888888]" />}
                  </button>
                  {expandedSession === session.id && (
                    <div className="border-t border-[#333333] px-5 py-4 space-y-3">
                      {session.notes && (
                        <p className="text-sm text-[#c8c8c8] italic">"{session.notes}"</p>
                      )}
                      {session.exercises?.length > 0 && (
                        <div>
                          <p className="mb-2 text-[10px] uppercase tracking-widest text-[#888888]">Exercises</p>
                          <div className="space-y-1">
                            {session.exercises.map((ex: any) => (
                              <div key={ex.id} className="flex items-center justify-between rounded-lg bg-[#1a1a1a] px-4 py-2.5">
                                <span className="text-sm font-medium text-white">{ex.name}</span>
                                <span className="text-xs text-[#888888]">
                                  {ex.sets}×{ex.reps}{ex.weight ? ` @ ${ex.weight}kg` : ''}
                                  {ex.rest_time ? ` · ${ex.rest_time}s rest` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'Progress' && (
        <div className="space-y-6 animate-fade-in">
          {/* Chart */}
          <div className="rounded-xl border border-[#333333] bg-[#222222] p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Progress Chart</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-3 py-2 text-xs text-white focus:border-[#c8c8c8] focus:outline-none sm:w-56"
              >
                {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {chartData.length < 2 ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-[#555555]">Not enough data to display chart</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis dataKey="date" stroke="#555555" tick={{ fontSize: 10, fill: '#888888' }} />
                  <YAxis stroke="#555555" tick={{ fontSize: 10, fill: '#888888' }} />
                  <Tooltip
                    contentStyle={{ background: '#222222', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff' }}
                    labelStyle={{ color: '#c8c8c8' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#c8c8c8" strokeWidth={2} dot={{ fill: '#c8c8c8', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <AddProgressEntry clientId={clientId} onAdded={() => router.refresh()} />
          {/* Progress Photos */}
          <div className="rounded-xl border border-[#333333] bg-[#222222] p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Progress Photos</h3>
            {progressPhotos.length === 0 ? (
              <EmptyState icon={Camera} title="No photos yet" description="Upload progress photos to track visual changes." />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {progressPhotos.map((photo) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-lg bg-[#1a1a1a]">
                    <img src={photo.url} alt="" className="h-32 w-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-2 py-1.5">
                      <p className="text-[10px] text-white">{formatDate(photo.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'Payments' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#888888]">{invoices.length} invoices</p>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white transition-all"
            >
              <Plus size={14} /> Create Invoice
            </button>
          </div>
          {invoices.length === 0 ? (
            <EmptyState icon={CreditCard} title="No invoices" description="Create an invoice to bill this client." />
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center gap-4 rounded-xl border border-[#333333] bg-[#222222] px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{invoice.description}</p>
                    <p className="text-xs text-[#888888]">Due {formatDate(invoice.due_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{formatCurrency(invoice.amount)}</p>
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Session Log Modal */}
      {showSessionModal && (
        <SessionLogModal
          clientId={clientId}
          ptId={ptId}
          onClose={() => setShowSessionModal(false)}
          onSaved={() => { setShowSessionModal(false); router.refresh() }}
        />
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          clientId={clientId}
          ptId={ptId}
          clientEmail={profile.email}
          clientName={profile.full_name}
          onClose={() => setShowInvoiceModal(false)}
          onSaved={() => { setShowInvoiceModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}

// ── Add Progress Entry ──────────────────────────────────
function AddProgressEntry({ clientId, onAdded }: { clientId: string; onAdded: () => void }) {
  const [form, setForm] = useState({ metric: METRICS[0], value: '', date: new Date().toISOString().split('T')[0] })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('progress_entries').insert({
      client_id: clientId,
      metric: form.metric,
      value: parseFloat(form.value),
      date: form.date,
    })
    if (error) { toast.error(error.message) }
    else { toast.success('Progress entry added'); onAdded() }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#333333] bg-[#222222] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Add Progress Entry</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <select value={form.metric} onChange={(e) => setForm(p => ({ ...p, metric: e.target.value }))}
          className="rounded-lg border border-[#333333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none">
          {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="number" step="0.1" value={form.value} onChange={(e) => setForm(p => ({ ...p, value: e.target.value }))}
          placeholder="Value" required
          className="rounded-lg border border-[#333333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none" />
        <div className="flex gap-2">
          <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
            className="flex-1 rounded-lg border border-[#333333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none" />
          <button type="submit" disabled={loading}
            className="rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all">
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ── Session Log Modal ───────────────────────────────────
function SessionLogModal({ clientId, ptId, onClose, onSaved }: {
  clientId: string; ptId: string; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0], type: SESSION_TYPES[0],
    duration: '60', notes: '',
  })
  const [exercises, setExercises] = useState([{ name: '', sets: '3', reps: '10', weight: '', rest_time: '60' }])
  const [loading, setLoading] = useState(false)

  function addExercise() {
    setExercises(p => [...p, { name: '', sets: '3', reps: '10', weight: '', rest_time: '60' }])
  }
  function updateExercise(i: number, field: string, value: string) {
    setExercises(p => p.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex))
  }
  function removeExercise(i: number) {
    setExercises(p => p.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({ client_id: clientId, pt_id: ptId, date: form.date, type: form.type, duration: parseInt(form.duration), notes: form.notes || null })
      .select().single()
    if (sessionError) { toast.error(sessionError.message); setLoading(false); return }
    const validExercises = exercises.filter(ex => ex.name.trim())
    if (validExercises.length > 0) {
      const { error: exError } = await supabase.from('exercises').insert(
        validExercises.map(ex => ({
          session_id: session.id, name: ex.name, sets: parseInt(ex.sets), reps: parseInt(ex.reps),
          weight: ex.weight ? parseFloat(ex.weight) : null,
          rest_time: ex.rest_time ? parseInt(ex.rest_time) : null,
        }))
      )
      if (exError) toast.error(exError.message)
    }
    toast.success('Session logged')
    onSaved()
  }

  return (
    <Modal open onClose={onClose} title="Log Session" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} required
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Type</label>
            <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none">
              {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Duration (min)</label>
            <input type="number" value={form.duration} onChange={(e) => setForm(p => ({ ...p, duration: e.target.value }))} min="1" required
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Notes</label>
            <input type="text" value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes…"
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none" />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Exercises</p>
            <button type="button" onClick={addExercise} className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#c8c8c8] hover:text-white transition-colors">
              <Plus size={12} /> Add Exercise
            </button>
          </div>
          <div className="space-y-2">
            {exercises.map((ex, i) => (
              <div key={i} className="grid gap-2 rounded-lg bg-[#1a1a1a] p-3" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto' }}>
                <input placeholder="Exercise name" value={ex.name} onChange={(e) => updateExercise(i, 'name', e.target.value)}
                  className="rounded border border-[#333333] bg-[#222222] px-3 py-2 text-xs text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none" />
                <input placeholder="Sets" type="number" value={ex.sets} onChange={(e) => updateExercise(i, 'sets', e.target.value)} min="1"
                  className="rounded border border-[#333333] bg-[#222222] px-3 py-2 text-xs text-white focus:border-[#c8c8c8] focus:outline-none" />
                <input placeholder="Reps" type="number" value={ex.reps} onChange={(e) => updateExercise(i, 'reps', e.target.value)} min="1"
                  className="rounded border border-[#333333] bg-[#222222] px-3 py-2 text-xs text-white focus:border-[#c8c8c8] focus:outline-none" />
                <input placeholder="kg" type="number" step="0.5" value={ex.weight} onChange={(e) => updateExercise(i, 'weight', e.target.value)}
                  className="rounded border border-[#333333] bg-[#222222] px-3 py-2 text-xs text-white focus:border-[#c8c8c8] focus:outline-none" />
                <input placeholder="Rest (s)" type="number" value={ex.rest_time} onChange={(e) => updateExercise(i, 'rest_time', e.target.value)}
                  className="rounded border border-[#333333] bg-[#222222] px-3 py-2 text-xs text-white focus:border-[#c8c8c8] focus:outline-none" />
                <button type="button" onClick={() => removeExercise(i)} className="text-[#555555] hover:text-red-400 transition-colors text-lg leading-none">×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#333333] pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#333333] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#555555] hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving…' : 'Save Session'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Invoice Modal ────────────────────────────────────────
function InvoiceModal({ clientId, ptId, clientEmail, clientName, onClose, onSaved }: {
  clientId: string; ptId: string; clientEmail: string; clientName: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    amount: '', description: '',
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      // Create Stripe checkout session
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(form.amount), description: form.description, clientEmail }),
      })
      const { sessionUrl } = await res.json()

      await supabase.from('invoices').insert({
        client_id: clientId, pt_id: ptId,
        amount: parseFloat(form.amount),
        description: form.description,
        due_date: form.due_date,
        status: 'outstanding',
        stripe_checkout_url: sessionUrl || null,
      })
      toast.success('Invoice created')
      onSaved()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Create Invoice">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Description *</label>
          <input type="text" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="e.g. Personal Training — May 2025" required
            className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Amount (£) *</label>
            <input type="number" step="0.01" min="0.50" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="0.00" required
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Due Date *</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))} required
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#333333] pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#333333] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#555555] hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
