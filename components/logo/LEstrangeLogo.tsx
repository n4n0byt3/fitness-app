import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
}

export default function LEstrangeLogo({ size = 80, className = '' }: LogoProps) {
  return (
    <Image
      src="/image.png"
      alt="L'Estrange Fitness"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
      priority
    />
  )
}
