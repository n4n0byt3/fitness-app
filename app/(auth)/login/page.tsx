'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import LEstrangeLogo from '@/components/logo/LEstrangeLogo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      let { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // Trigger didn't fire — create profile now from auth metadata
      if (!profile) {
        const meta = data.user.user_metadata
        const role = (meta?.role as string) || 'client'
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: meta?.full_name || '',
          email: data.user.email,
          role,
        })
        profile = { role }
      }

      if (profile?.role === 'pt') {
        router.push('/dashboard')
      } else {
        router.push('/portal/dashboard')
      }
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center">
        <LEstrangeLogo size={90} className="mb-6" />
        <h1 className="text-xs font-medium uppercase tracking-[0.3em] text-[#888888]">
          Client Portal
        </h1>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[#333333] bg-[#222222] p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-semibold uppercase tracking-widest text-white">
          Sign In
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder-[#555555] transition-colors focus:border-[#c8c8c8] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#888888]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#c8c8c8] px-4 py-3 text-sm font-semibold uppercase tracking-widest text-[#1a1a1a] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-[#555555]">
        New client?{' '}
        <Link href="/signup" className="text-[#c8c8c8] hover:text-white transition-colors">
          Request access
        </Link>
      </p>
    </div>
  )
}
