'use client'

const SZ = 128
const R = 61
const CIRC = 2 * Math.PI * R

/** Shared SVG progress ring — track + arc only, no decorative diagonals. */
export function ProgressRing({
  size = SZ,
  progress,
  className = '',
}: {
  size?: number
  progress: number
  className?: string
}) {
  const dashOffset = CIRC * (1 - progress)
  return (
    <svg
      viewBox={`0 0 ${SZ} ${SZ}`}
      width={size}
      height={size}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 m-auto ${className}`}
      style={{ rotate: '-90deg' }}
    >
      <circle cx={SZ / 2} cy={SZ / 2} r={R} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1.5} />
      <circle
        cx={SZ / 2}
        cy={SZ / 2}
        r={R}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.85}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray={CIRC}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}
