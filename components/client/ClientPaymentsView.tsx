'use client'

import { useState } from 'react'
import { CreditCard, Download, ExternalLink } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/Badge'
import EmptyState from '@/components/shared/EmptyState'
import type { Invoice } from '@/lib/types'

export default function ClientPaymentsView({ invoices }: { invoices: Invoice[] }) {
  const outstanding = invoices.filter(i => i.status !== 'paid')
  const paid = invoices.filter(i => i.status === 'paid')

  const outstandingTotal = outstanding.reduce((s, i) => s + Number(i.amount), 0)

  return (
    <div className="space-y-6">
      {/* Outstanding banner */}
      {outstanding.length > 0 && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-5">
          <p className="text-sm font-semibold text-amber-400">
            {formatCurrency(outstandingTotal)} outstanding
          </p>
          <p className="mt-0.5 text-xs text-amber-400/70">
            {outstanding.length} invoice{outstanding.length > 1 ? 's' : ''} awaiting payment
          </p>
        </div>
      )}

      {/* Outstanding Invoices */}
      {outstanding.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">Outstanding</h2>
          <div className="space-y-3">
            {outstanding.map((invoice) => (
              <div key={invoice.id} className="rounded-xl border border-amber-500/15 bg-[#222222] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{invoice.description}</p>
                    <p className="mt-0.5 text-xs text-[#888888]">Due {formatDate(invoice.due_date, 'long')}</p>
                  </div>
                  <p className="text-xl font-bold text-white">{formatCurrency(invoice.amount)}</p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <StatusBadge status={invoice.status} />
                  <div className="ml-auto flex gap-2">
                    <a
                      href={`/api/invoices/${invoice.id}/pdf`}
                      target="_blank"
                      className="flex items-center gap-1.5 rounded-lg border border-[#333333] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#c8c8c8]/30 hover:text-[#c8c8c8] transition-colors"
                    >
                      <Download size={12} /> PDF
                    </a>
                    {invoice.stripe_checkout_url && (
                      <a
                        href={invoice.stripe_checkout_url}
                        target="_blank"
                        className="flex items-center gap-1.5 rounded-lg bg-[#c8c8c8] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white transition-all"
                      >
                        <CreditCard size={12} /> Pay Now
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">Payment History</h2>
        {paid.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payment history" description="Paid invoices will appear here." />
        ) : (
          <div className="space-y-2">
            {paid.map((invoice) => (
              <div key={invoice.id} className="flex items-center gap-4 rounded-xl border border-[#333333] bg-[#222222] px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{invoice.description}</p>
                  <p className="text-xs text-[#888888]">{formatDate(invoice.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold text-white">{formatCurrency(invoice.amount)}</p>
                  <StatusBadge status="paid" />
                  <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank"
                    className="text-[#555555] hover:text-[#c8c8c8] transition-colors">
                    <Download size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
