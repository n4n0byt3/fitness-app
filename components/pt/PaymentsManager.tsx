'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Loader2, CreditCard, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/Badge'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import { STRIPE_PRODUCTS } from '@/lib/stripe-products'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { Invoice, Profile } from '@/lib/types'

interface Props {
  ptId: string
  initialInvoices: (Invoice & { client?: Profile })[]
  clients: Profile[]
}

type Filter = 'all' | 'outstanding' | 'paid' | 'overdue'

export default function PaymentsManager({ ptId, initialInvoices, clients }: Props) {
  const router = useRouter()
  const [invoices, setInvoices] = useState(initialInvoices)
  const [filter, setFilter] = useState<Filter>('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)

  // Monthly revenue chart data (last 6 months)
  const monthlyData = (() => {
    const months: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
      months[key] = 0
    }
    for (const inv of invoices.filter(i => i.status === 'paid')) {
      const key = new Date(inv.created_at).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
      if (key in months) months[key] += Number(inv.amount)
    }
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }))
  })()

  const totals = {
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0),
    outstanding: invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + Number(i.amount), 0),
  }

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-5">
          <p className="text-[10px] uppercase tracking-widest text-[#888888]">Total Invoiced</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatCurrency(invoices.reduce((s, i) => s + Number(i.amount), 0))}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400/70">Paid</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{formatCurrency(totals.paid)}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-[10px] uppercase tracking-widest text-amber-400/70">Outstanding</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{formatCurrency(totals.outstanding)}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border border-[#333333] bg-[#222222] p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white">Revenue — Last 6 Months</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
            <XAxis dataKey="month" stroke="#555555" tick={{ fontSize: 11, fill: '#888888' }} />
            <YAxis stroke="#555555" tick={{ fontSize: 11, fill: '#888888' }} tickFormatter={(v) => `£${v}`} />
            <Tooltip
              contentStyle={{ background: '#222222', border: '1px solid #333333', borderRadius: '8px', color: '#ffffff' }}
              formatter={(v: any) => [formatCurrency(v), 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#c8c8c8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Filters */}
          <div className="flex gap-1 rounded-xl border border-[#333333] bg-[#222222] p-1 w-fit">
            {(['all', 'outstanding', 'paid', 'overdue'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all',
                  filter === f ? 'bg-[#c8c8c8]/10 text-white' : 'text-[#555555] hover:text-[#888888]'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white transition-all"
          >
            <Plus size={14} /> Create Invoice
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={CreditCard} title={`No ${filter === 'all' ? '' : filter + ' '}invoices`} description="Invoices you create will appear here." />
        ) : (
          <div className="space-y-2">
            {filtered.map((invoice) => (
              <div key={invoice.id} className="flex items-center gap-4 rounded-xl border border-[#333333] bg-[#222222] px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{invoice.description}</p>
                  <p className="text-xs text-[#888888]">
                    {invoice.client?.full_name} · Due {formatDate(invoice.due_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-white">{formatCurrency(invoice.amount)}</p>
                  <StatusBadge status={invoice.status} />
                  <a
                    href={`/api/invoices/${invoice.id}/pdf`}
                    target="_blank"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#333333] text-[#888888] hover:border-[#c8c8c8]/30 hover:text-[#c8c8c8] transition-colors"
                    title="Download PDF"
                  >
                    <Download size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateInvoiceModal
          ptId={ptId}
          clients={clients}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}

function CreateInvoiceModal({ ptId, clients, onClose, onSaved }: {
  ptId: string; clients: Profile[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    client_id: clients[0]?.id || '',
    product: STRIPE_PRODUCTS[0].label as string,
    amount: '',
    description: '',
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)

  const selectedProduct = STRIPE_PRODUCTS.find(p => p.label === form.product) || STRIPE_PRODUCTS[0]
  const isCustom = selectedProduct.priceId === null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isCustom && !form.amount) return
    setLoading(true)
    try {
      const clientProfile = clients.find(c => c.id === form.client_id)
      const description = isCustom ? form.description : selectedProduct.label

      // Create invoice record first to get the ID for webhook metadata
      const supabase = createClient()
      const { data: invoice, error: invError } = await supabase.from('invoices').insert({
        client_id: form.client_id, pt_id: ptId,
        amount: isCustom ? parseFloat(form.amount) : 0,
        description,
        due_date: form.due_date, status: 'outstanding',
      }).select().single()
      if (invError) throw invError

      // Create Stripe checkout
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isCustom
            ? { amount: parseFloat(form.amount), description }
            : { priceId: selectedProduct.priceId }),
          clientEmail: clientProfile?.email,
          invoiceId: invoice.id,
        }),
      })
      const { sessionUrl } = await res.json()

      // Update invoice with checkout URL
      if (sessionUrl) {
        await supabase.from('invoices').update({ stripe_checkout_url: sessionUrl }).eq('id', invoice.id)
      }

      // Email the client
      if (clientProfile) {
        await fetch('/api/notifications/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: clientProfile.email, clientName: clientProfile.full_name,
            amount: isCustom ? formatCurrency(parseFloat(form.amount)) : selectedProduct.label,
            description, dueDate: formatDate(form.due_date),
            paymentUrl: sessionUrl || `${window.location.origin}/portal/payments`,
          }),
        })
      }

      toast.success('Invoice created and sent')
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
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Client *</label>
          <select value={form.client_id} onChange={(e) => setForm(p => ({ ...p, client_id: e.target.value }))} required
            className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none">
            {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Product / Service *</label>
          <select value={form.product} onChange={(e) => setForm(p => ({ ...p, product: e.target.value }))} required
            className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none">
            {STRIPE_PRODUCTS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
          </select>
        </div>
        {isCustom && (
          <>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Description *</label>
              <input type="text" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Personal Training — May 2025" required={isCustom}
                className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Amount (£) *</label>
              <input type="number" step="0.01" min="0.50" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0.00" required={isCustom}
                className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none" />
            </div>
          </>
        )}
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Due Date *</label>
          <input type="date" value={form.due_date} onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))} required
            className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none" />
        </div>
        <div className="flex justify-end gap-3 border-t border-[#333333] pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#333333] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#555555] hover:text-white transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Creating…' : 'Create & Send'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
