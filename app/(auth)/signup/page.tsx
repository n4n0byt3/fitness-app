'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import LEstrangeLogo from '@/components/logo/LEstrangeLogo'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'pt' | 'client',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName, role: formData.role },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Email confirmation required — session will be null
    if (data.user && !data.session) {
      setLoading(false)
      setAwaitingConfirmation(true)
      return
    }

    // Email confirmation disabled — session exists, redirect immediately
    if (data.session) {
      toast.success('Account created!')
      router.push(formData.role === 'pt' ? '/dashboard' : '/portal/dashboard')
      router.refresh()
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-10 flex flex-col items-center">
          <LEstrangeLogo size={90} className="mb-6" />
        </div>
        <div className="rounded-2xl border border-[#333333] bg-[#222222] p-8 shadow-2xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2a2a]">
              <MailCheck size={24} className="text-[#c8c8c8]" />
            </div>
          </div>
          <h2 className="mb-2 text-lg font-semibold uppercase tracking-widest text-white">Check your email</h2>
          <p className="text-sm text-[#888888]">
            We&apos;ve sent a confirmation link to <span className="text-[#c8c8c8]">{formData.email}</span>.
            Click the link to activate your account, then sign in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-xs font-semibold uppercase tracking-wider text-[#c8c8c8] hover:text-white transition-colors"
          >
            Go to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="mb-10 flex flex-col items-center">
        <LEstrangeLogo size={90} className="mb-6" />
        <h1 className="text-xs font-medium uppercase tracking-[0.3em] text-[#888888]">
          Create Account
        </h1>
      </div>

      <div className="rounded-2xl border border-[#333333] bg-[#222222] p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-semibold uppercase tracking-widest text-white">
          Register
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#555555] transition-colors focus:border-[#c8c8c8] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#555555] transition-colors focus:border-[#c8c8c8] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
              Account Type
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white focus:border-[#c8c8c8] focus:outline-none"
            >
              <option value="client">Client</option>
              <option value="pt">Personal Trainer</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-3 pr-11 text-sm text-white placeholder-[#555555] transition-colors focus:border-[#c8c8c8] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] transition-colors hover:text-[#c8c8c8]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#555555] transition-colors focus:border-[#c8c8c8] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-3 text-sm font-semibold uppercase tracking-widest text-[#1a1a1a] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-[#555555]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#c8c8c8] hover:text-white transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
