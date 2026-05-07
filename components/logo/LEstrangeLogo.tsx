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
      {/* Grey background circle */}
      <circle cx="50" cy="50" r="47" fill="#c4c4c4" />

      {/* Hand-drawn style white border — slightly irregular path to mimic brush stroke */}
      <path
        d="
          M50,8
          C62,7 73,11 81,18
          C90,26 94,37 94,50
          C94,63 89,74 81,82
          C73,90 62,94 50,94
          C38,94 27,90 19,82
          C10,74 6,63 6,50
          C6,37 10,26 19,18
          C27,10 38,8 50,8
          Z
        "
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.85"
      />
      {/* Second slightly offset stroke to give brushstroke thickness variation */}
      <path
        d="
          M50,10
          C61,9 71,13 79,20
          C88,28 92,38 92,50
          C92,62 88,72 80,80
          C72,88 62,92 50,92
          C38,92 28,88 20,80
          C12,72 8,62 8,50
          C8,38 12,28 20,20
          C28,12 39,10 50,10
          Z
        "
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* L'ESTRANGE */}
      <text
        x="50"
        y="43"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="13.5"
        letterSpacing="1.5"
        fill="white"
      >
        L&apos;ESTRANGE
      </text>

      {/* Divider line */}
      <line x1="20" y1="49" x2="80" y2="49" stroke="white" strokeWidth="0.8" opacity="0.9" />

      {/* FITNESS */}
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="400"
        fontSize="8.5"
        letterSpacing="5"
        fill="white"
      >
        FITNESS
      </text>

      {/* Dumbbell — dark on the grey background */}
      {/* Left plate */}
      <rect x="21" y="70" width="4.5" height="10" rx="1" fill="#2a2a2a" />
      {/* Left collar */}
      <rect x="25.5" y="72" width="2.5" height="6" rx="0.5" fill="#2a2a2a" />
      {/* Bar */}
      <rect x="28" y="73.5" width="44" height="3" rx="1.5" fill="#2a2a2a" />
      {/* Right collar */}
      <rect x="72" y="72" width="2.5" height="6" rx="0.5" fill="#2a2a2a" />
      {/* Right plate */}
      <rect x="74.5" y="70" width="4.5" height="10" rx="1" fill="#2a2a2a" />
    </svg>
  )
}
