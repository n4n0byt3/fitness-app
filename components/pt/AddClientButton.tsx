'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Loader2, CheckCircle, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '@/components/shared/Modal'
import { cn } from '@/lib/utils'

interface AddClientButtonProps {
  ptId: string
  variant?: 'default' | 'subtle'
}

type Step = 'email' | 'details'

const emptyForm = {
  email: '',
  full_name: '',
  phone: '',
  goal: '',
  start_date: new Date().toISOString().split('T')[0],
  notes: '',
}

export default function AddClientButton({ ptId, variant = 'default' }: AddClientButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('email')
  const [form, setForm] = useState(emptyForm)
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [existingUser, setExistingUser] = useState<{ id: string; full_name: string; email: string } | null>(null)
  const [emailChecked, setEmailChecked] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (e.target.name === 'email') {
      setEmailChecked(false)
      setExistingUser(null)
    }
  }

  function handleClose() {
    setOpen(false)
    setStep('email')
    setForm(emptyForm)
    setExistingUser(null)
    setEmailChecked(false)
  }

  async function checkEmail() {
    if (!form.email) return
    setChecking(true)
    try {
      const res = await fetch(`/api/clients/add?email=${encodeURIComponent(form.email)}`)
      const data = await res.json()
      setEmailChecked(true)
      if (data.found) {
        setExistingUser(data.profile)
        // Pre-fill name from their profile
        setForm((prev) => ({ ...prev, full_name: data.profile.full_name }))
      } else {
        setExistingUser(null)
      }
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/clients/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success(
        data.isNewUser
          ? `${form.full_name || form.email} added. They can log in and set their own password.`
          : `${existingUser?.full_name || form.email} linked to your account.`
      )
      handleClose()
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

      <Modal open={open} onClose={handleClose} title="Add Client" size="md">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email lookup — always visible */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
              Client Email *
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={checkEmail}
                placeholder="client@example.com"
                required
                className="flex-1 rounded-lg border border-[#333333] bg-[#111111] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none"
              />
              <button
                type="button"
                onClick={checkEmail}
                disabled={checking || !form.email}
                className="rounded-lg border border-[#333333] px-3 py-2.5 text-xs text-[#888888] hover:border-[#555555] hover:text-white transition-colors disabled:opacity-40"
              >
                {checking ? <Loader2 size={14} className="animate-spin" /> : 'Check'}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-[#555555]">
              Enter their email to check if they already have an account.
            </p>
          </div>

          {/* Result of email check */}
          {emailChecked && (
            <div className={cn(
              'flex items-start gap-3 rounded-lg border p-3',
              existingUser
                ? 'border-green-500/20 bg-green-500/5'
                : 'border-[#444444] bg-[#222222]'
            )}>
              {existingUser ? (
                <>
                  <UserCheck size={16} className="mt-0.5 shrink-0 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{existingUser.full_name}</p>
                    <p className="text-xs text-green-400">Already registered — you can link them directly.</p>
                  </div>
                </>
              ) : (
                <>
                  <UserX size={16} className="mt-0.5 shrink-0 text-[#888888]" />
                  <div>
                    <p className="text-sm text-white">No account found</p>
                    <p className="text-xs text-[#888888]">
                      An account will be created for them. They'll receive a password reset email so they can set their own password and log in.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Extra details — show once email is checked */}
          {emailChecked && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {!existingUser && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      required={!existingUser}
                      className="w-full rounded-lg border border-[#333333] bg-[#111111] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+44 7700 000000"
                    className="w-full rounded-lg border border-[#333333] bg-[#111111] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Training Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#333333] bg-[#111111] px-4 py-2.5 text-sm text-white focus:border-[#c8c8c8] focus:outline-none"
                  />
                </div>
                <div className={cn(!existingUser ? 'sm:col-span-2' : '')}>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
                    Training Goal
                  </label>
                  <input
                    type="text"
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                    placeholder="e.g. Lose 10kg, build muscle"
                    className="w-full rounded-lg border border-[#333333] bg-[#111111] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Injuries, medical notes, preferences…"
                  className="w-full resize-none rounded-lg border border-[#333333] bg-[#111111] px-4 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#c8c8c8] focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-[#333333] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#555555] hover:text-white transition-colors"
            >
              Cancel
            </button>
            {emailChecked && (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] hover:bg-white disabled:opacity-60 transition-all"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Adding…' : existingUser ? 'Link Client' : 'Add Client'}
              </button>
            )}
          </div>
        </form>
      </Modal>
    </>
  )
}
