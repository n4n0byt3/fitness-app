import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: { wrapper: 'h-8 w-8', text: 'text-xs' },
  md: { wrapper: 'h-10 w-10', text: 'text-sm' },
  lg: { wrapper: 'h-14 w-14', text: 'text-lg' },
  xl: { wrapper: 'h-20 w-20', text: 'text-2xl' },
}

export default function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const { wrapper, text } = sizes[size]
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] font-semibold text-[#c8c8c8]',
        wrapper,
        text,
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="rounded-full object-cover"
          sizes="80px"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}
