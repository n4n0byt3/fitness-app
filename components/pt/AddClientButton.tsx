'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '@/components/shared/Modal'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface AddClientButtonProps {
  ptId: string
  variant?: 'default' | 'subtle'
}

export default function AddClientButton({ ptId, variant = 'default' }: AddClientButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', goal: '',
    start_date: new Date().toISOString().split('T')[0], notes: '', password: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    try {
      // Create auth user for client
      const { data: authData, error: authError } = await supabase.auth.admin
        ? // If service role is available, use admin API
          { data: null, error: null }
        : { data: null, error: null }

      // Use signUp flow — client gets an invite-style account
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password || Math.random().toString(36).slice(-10),
        options: {
          data: { full_name: form.full_name, role: 'client' },
        },
      })

      if (signUpError) throw signUpError

      if (newUser.user) {
        // The trigger creates the profile — now create client_profile
        const { error: cpError } = await supabase.from('client_profiles').insert({
          user_id: newUser.user.id,
          pt_id: ptId,
          goal: form.goal || null,
          start_date: form.start_date || null,
          notes: form.notes || null,
        })
        if (cpError) throw cpError

        // Also update phone on the profile
        if (form.phone) {
          await supabase
            .from('profiles')
            .update({ phone: form.phone })
            .eq('id', newUser.user.id)
        }
      }

      toast.success(`${form.full_name} added as a client`)
      setOpen(false)
      setForm({ full_name: '', email: '', phone: '', goal: '', start_date: new Date().toISOString().split('T')[0], notes: '', password: '' })
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all',
          variant === 'default'
            ? 'bg-[#c8c8c8] text-[#1a1a1a] hover:bg-white'
            : 'border border-[#333333] text-[#888888] hover:border-[#c8c8c8]/30 hover:text-[#c8c8c8]'
        )}
      >
        <UserPlus size={14} />
        Add Client
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add New Client" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Full Name *</label>
              <input type="text" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Jane Smith" required />
            </div>
            <div>
              <label className="field-label">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" required />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="+44 7700 000000" />
            </div>
            <div>
              <label className="field-label">Start Date</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
            </div>
            <div>
              <label className="field-label">Temporary Password</label>
              <input type="text" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to auto-generate" />
            </div>
            <div>
              <label className="field-label">Training Goal</label>
              <input type="text" name="goal" value={form.goal} onChange={handleChange} placeholder="e.g. Lose 10kg, build muscle" />
            </div>
          </div>
          <div>
            <label className="field-label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Injuries, preferences, medical notes…" className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[#333333] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#555555] hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Adding…' : 'Add Client'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
