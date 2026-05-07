interface LogoProps {
  size?: number
  className?: string
}

export default function LEstrangeLogo({ size = 80, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hand-drawn style outer circle */}
      <path
        d="M50 4 C74.3 4 94 23.7 94 48 C94 72.3 74.3 92 50 92 C25.7 92 6 72.3 6 48 C6 23.7 25.7 4 50 4 Z"
        fill="#c8c8c8"
        stroke="#c8c8c8"
        strokeWidth="0.5"
      />
      {/* Slightly imperfect inner circle for hand-drawn feel */}
      <path
        d="M50 7.5 C72.4 7.5 90.5 25.7 90.5 48.1 C90.5 70.5 72.3 88.5 50 88.5 C27.7 88.5 9.5 70.5 9.5 48 C9.5 25.5 27.6 7.5 50 7.5 Z"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="0.8"
        strokeDasharray="0.5 0"
        opacity="0.15"
      />

      {/* L'ESTRANGE text */}
      <text
        x="50"
        y="38"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize="13"
        letterSpacing="2"
        fill="#1a1a1a"
      >
        L&apos;ESTRANGE
      </text>

      {/* Divider line */}
      <line x1="18" y1="44" x2="82" y2="44" stroke="#1a1a1a" strokeWidth="0.75" opacity="0.6" />

      {/* FITNESS text */}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="400"
        fontSize="9"
        letterSpacing="4"
        fill="#1a1a1a"
      >
        FITNESS
      </text>

      {/* Dumbbell / barbell icon */}
      {/* Left weight plate */}
      <rect x="19" y="68" width="5" height="11" rx="1" fill="#1a1a1a" />
      {/* Left collar */}
      <rect x="24" y="70" width="3" height="7" rx="0.5" fill="#1a1a1a" />
      {/* Bar */}
      <rect x="27" y="72" width="46" height="3" rx="1.5" fill="#1a1a1a" />
      {/* Right collar */}
      <rect x="73" y="70" width="3" height="7" rx="0.5" fill="#1a1a1a" />
      {/* Right weight plate */}
      <rect x="76" y="68" width="5" height="11" rx="1" fill="#1a1a1a" />
    </svg>
  )
}
