export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Financeiro"
    >
      <defs>
        {/* Main diagonal gradient: violet → indigo → deep navy */}
        <linearGradient id="lgBg" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="48%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        {/* Top highlight — glassy sheen */}
        <linearGradient id="lgShine" x1="20" y1="0" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity={0.18} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>

        {/* Clip path matching rounded background */}
        <clipPath id="lgClip">
          <rect width="40" height="40" rx="11" />
        </clipPath>

        {/* Glow filter for the trend dot */}
        <filter id="lgGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx="11" fill="url(#lgBg)" />

      {/* Glass shine overlay (clipped to rounded rect) */}
      <g clipPath="url(#lgClip)">
        <rect width="40" height="22" fill="url(#lgShine)" />
      </g>

      {/* ── F letterform ── */}

      {/* Vertical stem */}
      <rect x="9.5" y="9" width="5" height="22" rx="2.5" fill="white" />

      {/* Top horizontal bar */}
      <rect x="9.5" y="9" width="20.5" height="5" rx="2.5" fill="white" />

      {/* Middle horizontal bar */}
      <rect x="9.5" y="17.5" width="14.5" height="5" rx="2.5" fill="white" />

      {/* ── Trend line in F's negative space (financial growth accent) ── */}
      <path
        d="M 19.5 30.5 C 22.5 26 26 21.5 31 15"
        stroke="rgba(255,255,255,0.32)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Glowing dot at tip of trend line */}
      <circle
        cx="31"
        cy="15"
        r="2.5"
        fill="rgba(255,255,255,0.55)"
        filter="url(#lgGlow)"
      />
    </svg>
  );
}
