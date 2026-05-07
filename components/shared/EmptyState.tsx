import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#333333] bg-[#222222]/50 px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2a2a]">
        <Icon size={24} className="text-[#888888]" />
      </div>
      <h3 className="mb-1 text-base font-semibold uppercase tracking-wider text-white">{title}</h3>
      {description && (
        <p className="mb-6 max-w-xs text-sm text-[#888888]">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
