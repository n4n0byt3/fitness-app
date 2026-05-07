'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Dumbbell, CalendarDays, CreditCard, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import LEstrangeLogo from '@/components/logo/LEstrangeLogo'

const nav = [
  { href: '/portal/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { href: '/portal/progress', label: 'My Progress', short: 'Progress', icon: TrendingUp },
  { href: '/portal/sessions', label: 'Sessions', short: 'Sessions', icon: Dumbbell },
  { href: '/portal/bookings', label: 'Book Session', short: 'Book', icon: CalendarDays },
  { href: '/portal/payments', label: 'Payments', short: 'Pay', icon: CreditCard },
]

interface ClientNavProps {
  clientName: string
}

export default function ClientNav({ clientName }: ClientNavProps) {
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
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-full w-56 flex-col border-r border-[#333333] bg-[#1a1a1a]">
        <div className="flex items-center gap-3 border-b border-[#333333] px-5 py-5">
          <LEstrangeLogo size={36} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white">
              {process.env.NEXT_PUBLIC_BRAND_NAME?.split(' ')[0] || "L'Estrange"}
            </p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#888888]">Client Portal</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3 pt-4">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-all',
                  active ? 'bg-[#c8c8c8]/10 text-white' : 'text-[#888888] hover:bg-[#222222] hover:text-[#c8c8c8]'
                )}>
                <Icon size={16} className={active ? 'text-[#c8c8c8]' : 'text-[#555555]'} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-[#333333] p-3">
          <div className="mb-2 px-3 py-2">
            <p className="text-xs font-semibold text-white truncate">{clientName}</p>
          </div>
          <button onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#555555] hover:bg-[#222222] hover:text-red-400 transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-[#333333] bg-[#1a1a1a]/95 backdrop-blur-md lg:hidden">
        {nav.map(({ href, short, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={cn('flex flex-1 flex-col items-center gap-1 py-3', active ? 'text-[#c8c8c8]' : 'text-[#555555]')}>
              <Icon size={19} />
              <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">{short}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
