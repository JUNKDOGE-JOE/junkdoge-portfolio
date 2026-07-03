'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useLang, ui } from '@/lib/i18n'
import { ProgressRing } from './ProgressRing'
import styles from './ProjectCounter.module.css'

export function ProjectCounter({ index, total, onPrev, onNext }: {
  index: number; total: number; onPrev: () => void; onNext: () => void
}) {
  const { t } = useLang()
  const n = String(index + 1).padStart(2, '0')
  const progress = total > 0 ? (index + 1) / total : 0

  return (
    <div
      className="absolute bottom-4 left-4 z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full text-center md:bottom-5 md:left-5 md:h-32 md:w-32"
      style={{
        boxShadow: '0 0 22px color-mix(in srgb, var(--accent) 35%, transparent)',
        transition: 'box-shadow .7s ease',
      }}
    >
      <ProgressRing size={96} progress={progress} className="md:hidden" />
      <ProgressRing size={128} progress={progress} className="hidden md:block" />

      <span className="ui-label text-[0.55rem] opacity-70 md:text-[0.6rem]">{t(ui.project)}</span>
      <span className="relative block overflow-hidden text-2xl font-medium leading-none md:text-3xl" style={{ height: '1.1em' }}>
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
      <span className="ui-label text-[0.55rem] opacity-70 md:text-[0.6rem]">{t(ui.number)}</span>
      <button
        aria-label="previous"
        onClick={onPrev}
        className={`absolute -left-1 top-1/2 -translate-y-1/2 p-1.5 transition-transform duration-700 hover:-translate-x-1 md:-left-2 md:p-2 ${styles.arrowLeft}`}
      >
        <span className={styles.arrowMask}>
          <span className={styles.arrowRow}>
            <svg viewBox="0 0 30 17" fill="none" className="w-full h-auto" aria-hidden="true">
              <path className="stroke-current" strokeWidth="1.5" d="M8.54736 16.6364L1.38827 8.26321L7.83145 0.727323"/>
              <path className="stroke-current" strokeWidth="1.5" d="M1.38817 8.28388L30.0245 8.28387"/>
            </svg>
            <svg viewBox="0 0 30 17" fill="none" className="w-full h-auto" aria-hidden="true">
              <path className="stroke-current" strokeWidth="1.5" d="M8.54736 16.6364L1.38827 8.26321L7.83145 0.727323"/>
              <path className="stroke-current" strokeWidth="1.5" d="M1.38817 8.28388L30.0245 8.28387"/>
            </svg>
          </span>
        </span>
      </button>
      <button
        aria-label="next"
        onClick={onNext}
        className={`absolute -right-1 top-1/2 -translate-y-1/2 p-1.5 transition-transform duration-700 hover:translate-x-1 md:-right-2 md:p-2 ${styles.arrowRight}`}
      >
        <span className={styles.arrowMask}>
          <span className={styles.arrowRow}>
            <svg viewBox="0 0 30 17" fill="none" className="w-full h-auto" aria-hidden="true">
              <path className="stroke-current" strokeWidth="1.5" d="M21.7229 0.363708L28.882 8.73691L22.4388 16.2728"/>
              <path className="stroke-current" strokeWidth="1.5" d="M28.8821 8.71619L0.245728 8.71619"/>
            </svg>
            <svg viewBox="0 0 30 17" fill="none" className="w-full h-auto" aria-hidden="true">
              <path className="stroke-current" strokeWidth="1.5" d="M21.7229 0.363708L28.882 8.73691L22.4388 16.2728"/>
              <path className="stroke-current" strokeWidth="1.5" d="M28.8821 8.71619L0.245728 8.71619"/>
            </svg>
          </span>
        </span>
      </button>
    </div>
  )
}
