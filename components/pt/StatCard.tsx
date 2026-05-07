import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  highlight?: boolean
}

export default function StatCard({ label, value, icon: Icon, trend, trendUp, highlight }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border p-5 transition-all hover:border-[#444444]',
        highlight
          ? 'border-[#c8c8c8]/30 bg-[#c8c8c8]/5'
          : 'border-[#333333] bg-[#222222]'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#888888]">
            {label}
          </p>
          <p className={cn('text-3xl font-bold', highlight ? 'text-[#c8c8c8]' : 'text-white')}>
            {value}
          </p>
          {trend && (
            <p className={cn('mt-1 text-xs font-medium', trendUp ? 'text-emerald-400' : 'text-red-400')}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            highlight ? 'bg-[#c8c8c8]/15' : 'bg-[#2a2a2a]'
          )}
        >
          <Icon size={20} className={highlight ? 'text-[#c8c8c8]' : 'text-[#888888]'} />
        </div>
      </div>
    </div>
  )
}
