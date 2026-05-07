'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarDays, CreditCard, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/payments', label: 'Pay', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-[#333333] bg-[#1a1a1a]/95 backdrop-blur-md lg:hidden">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-3 text-center transition-colors',
              active ? 'text-[#c8c8c8]' : 'text-[#555555] hover:text-[#888888]'
            )}
          >
            <Icon size={20} />
            <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
