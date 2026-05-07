'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Dumbbell, CalendarDays,
  CreditCard, Settings, LogOut, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import LEstrangeLogo from '@/components/logo/LEstrangeLogo'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/sessions', label: 'Sessions', icon: Dumbbell },
  { href: '/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  ptName: string
  ptEmail: string
}

export default function Sidebar({ ptName, ptEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-[#333333] bg-[#1a1a1a]">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-[#333333] px-5 py-5">
        <LEstrangeLogo size={40} />
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-[0.15em] text-white">
            {process.env.NEXT_PUBLIC_BRAND_NAME || "L'Estrange"}
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">Trainer Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3 pt-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-[#c8c8c8]/10 text-white'
                  : 'text-[#888888] hover:bg-[#222222] hover:text-[#c8c8c8]'
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? 'text-[#c8c8c8]' : 'text-[#555555] group-hover:text-[#c8c8c8]'
                )}
              />
              <span className="uppercase tracking-wider text-[11px] font-semibold">{label}</span>
              {active && (
                <ChevronRight size={12} className="ml-auto text-[#c8c8c8]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-[#333333] p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c8c8c8]/10 text-xs font-bold text-[#c8c8c8]">
            {ptName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{ptName}</p>
            <p className="truncate text-[10px] text-[#555555]">{ptEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#555555] transition-colors hover:bg-[#222222] hover:text-red-400"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
