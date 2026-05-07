'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface Props { profile: Profile | null }

export default function SettingsForm({ profile }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', profile?.id)
    if (error) toast.error(error.message)
    else { toast.success('Profile updated'); router.refresh() }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account Details */}
      <section className="rounded-xl border border-[#333333] bg-[#222222] p-6">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white">Account Details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))}
                className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+44 7700 000000"
                className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#888888]">Email</label>
            <input type="email" value={profile?.email} disabled
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-[#555555] cursor-not-allowed" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* Branding */}
      <section className="rounded-xl border border-[#333333] bg-[#222222] p-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">Branding</h2>
        <p className="mb-4 text-xs text-[#888888]">Branding is configured via environment variables for easy redeployment with other clients.</p>
        <div className="space-y-3 rounded-lg bg-[#1a1a1a] p-4 font-mono text-xs text-[#888888]">
          <p><span className="text-[#c8c8c8]">NEXT_PUBLIC_BRAND_NAME</span>=&quot;{process.env.NEXT_PUBLIC_BRAND_NAME}&quot;</p>
          <p><span className="text-[#c8c8c8]">NEXT_PUBLIC_BRAND_COLOR</span>=&quot;{process.env.NEXT_PUBLIC_BRAND_COLOR}&quot;</p>
          <p><span className="text-[#c8c8c8]">NEXT_PUBLIC_BRAND_TAGLINE</span>=&quot;{process.env.NEXT_PUBLIC_BRAND_TAGLINE}&quot;</p>
        </div>
      </section>

      {/* Stripe */}
      <section className="rounded-xl border border-[#333333] bg-[#222222] p-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">Stripe Payments</h2>
        <p className="mb-4 text-xs text-[#888888]">Manage your Stripe account and review payments in the Stripe Dashboard.</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-[#888888]">Stripe connected</span>
            <span className="ml-auto font-mono text-[10px] text-[#555555]">pk_live_...{process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.slice(-6)}</span>
          </div>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-[#333333] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#c8c8c8]/30 hover:text-[#c8c8c8] transition-colors w-fit"
          >
            <ExternalLink size={12} /> Stripe Dashboard
          </a>
        </div>
      </section>

      {/* Webhook info */}
      <section className="rounded-xl border border-[#333333] bg-[#222222] p-6">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">Stripe Webhook</h2>
        <p className="mb-4 text-xs text-[#888888]">
          Add this endpoint URL in your Stripe Dashboard → Developers → Webhooks to auto-confirm payments.
        </p>
        <div className="rounded-lg bg-[#1a1a1a] px-4 py-3 font-mono text-xs text-[#c8c8c8] break-all">
          {process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/stripe/webhook
        </div>
        <p className="mt-2 text-[10px] text-[#555555]">Listen for: <code className="text-[#888888]">checkout.session.completed</code></p>
      </section>
    </div>
  )
}
