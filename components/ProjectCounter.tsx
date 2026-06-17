'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang, ui } from '@/lib/i18n'

// SVG dimensions
const SZ = 128      // matches w-32 h-32
const R  = 61       // arc radius (leaves ~3px margin from edge for stroke)
const CIRC = 2 * Math.PI * R

export function ProjectCounter({ index, total, onPrev, onNext }: {
  index: number; total: number; onPrev: () => void; onNext: () => void
}) {
  const { t } = useLang()
  const n = String(index + 1).padStart(2, '0')

  // progress arc: (index+1)/total of full circumference
  const progress   = total > 0 ? (index + 1) / total : 0
  const dashOffset = CIRC * (1 - progress)

  return (
    <div
      className="absolute bottom-5 left-5 flex h-32 w-32 flex-col items-center justify-center rounded-full text-center"
      style={{
        boxShadow: '0 0 22px color-mix(in srgb, var(--accent) 35%, transparent)',
        transition: 'box-shadow .7s ease',
      }}
    >
      {/* SVG layer: track ring + progress arc + diagonal deco line */}
      <svg
        viewBox={`0 0 ${SZ} ${SZ}`}
        width={SZ}
        height={SZ}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ rotate: '-90deg' }}
      >
        {/* Faint full-circle track (replaces border ring) */}
        <circle
          cx={SZ / 2}
          cy={SZ / 2}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={1.5}
        />
        {/* Progress arc */}
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
        {/* Decorative diagonal line (top-right → bottom-left), in un-rotated space so we counter-rotate */}
        <line
          x1={SZ * 0.7}
          y1={SZ * 0.2}
          x2={SZ * 0.3}
          y2={SZ * 0.8}
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeWidth={0.8}
          style={{ transformOrigin: `${SZ / 2}px ${SZ / 2}px`, rotate: '90deg' }}
        />
      </svg>

      <span className="ui-label text-[0.6rem] opacity-70">{t(ui.project)}</span>
      {/* Number: old digit slides up & out, new slides up & in */}
      <span className="relative block overflow-hidden text-3xl font-medium leading-none" style={{ height: '1.1em' }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={n}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '-110%' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {n}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="ui-label text-[0.6rem] opacity-70">{t(ui.number)}</span>
      <button aria-label="previous" onClick={onPrev} className="absolute -left-2 top-1/2 -translate-y-1/2 p-2 transition-transform duration-200 hover:-translate-x-1">←</button>
      <button aria-label="next" onClick={onNext} className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 transition-transform duration-200 hover:translate-x-1">→</button>
    </div>
  )
}
