'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang, ui } from '@/lib/i18n'

export function ProjectCounter({ index, total, onPrev, onNext }: {
  index: number; total: number; onPrev: () => void; onNext: () => void
}) {
  const { t } = useLang()
  const n = String(index + 1).padStart(2, '0')
  return (
    <div
      className="absolute bottom-5 left-5 flex h-32 w-32 flex-col items-center justify-center rounded-full border border-current/40 text-center"
      style={{
        borderColor: 'color-mix(in srgb, var(--accent) 55%, white)',
        boxShadow: '0 0 22px color-mix(in srgb, var(--accent) 35%, transparent)',
        transition: 'border-color .7s ease, box-shadow .7s ease',
      }}
    >
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
