interface LogoProps {
  size?: number
  className?: string
}

export default function LEstrangeLogo({ size = 80, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-8 -8 116 116"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Makes the circle stroke look like a rough brushstroke */}
        <filter id="lef-brush" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="8" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Grey background circle */}
      <circle cx="50" cy="50" r="50" fill="#bbbbbb" />

      {/* Brushstroke ring — filter gives it the rough hand-painted look */}
      <circle
        cx="50" cy="50" r="42"
        fill="none"
        stroke="white"
        strokeWidth="5.5"
        filter="url(#lef-brush)"
        opacity="0.92"
      />

      {/* L'ESTRANGE */}
      <text
        x="50" y="44"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="14"
        letterSpacing="1.8"
        fill="white"
      >
        L&apos;ESTRANGE
      </text>

      {/* Divider line */}
      <line x1="16" y1="50" x2="84" y2="50" stroke="white" strokeWidth="0.9" opacity="0.95" />

      {/* FITNESS */}
      <text
        x="50" y="62"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="400"
        fontSize="8.5"
        letterSpacing="5.5"
        fill="white"
      >
        FITNESS
      </text>

      {/* Dumbbell */}
      {/* Left plate */}
      <rect x="21.5" y="71.5" width="4" height="9" rx="0.8" fill="#1e1e1e" />
      {/* Left collar */}
      <rect x="25.5" y="73" width="2" height="6" rx="0.5" fill="#1e1e1e" />
      {/* Bar */}
      <rect x="27.5" y="74.5" width="45" height="3" rx="1.5" fill="#1e1e1e" />
      {/* Right collar */}
      <rect x="72.5" y="73" width="2" height="6" rx="0.5" fill="#1e1e1e" />
      {/* Right plate */}
      <rect x="74.5" y="71.5" width="4" height="9" rx="0.8" fill="#1e1e1e" />
    </svg>
  )
}
