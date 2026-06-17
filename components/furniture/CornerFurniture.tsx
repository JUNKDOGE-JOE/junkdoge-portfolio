'use client'
import { Link } from 'next-view-transitions'
import { useLang, ui } from '@/lib/i18n'
import { Clock } from './Clock'
import { LetterSwap } from '@/components/LetterSwap'
import styles from './Nav.module.css'

const uiProjects = { zh: '作品', en: 'PROJECTS' }

/**
 * variant="light"     → dark ink for the light-bg /projects page.
 * variant="dark"      → paper-text colours for the dark home page.
 * variant="projects"  → same as "light" but hides the mid-left "portfolio 2026"
 *                        label that would collide with the Featured header.
 */
export function CornerFurniture({ variant = 'dark' }: { variant?: 'dark' | 'light' | 'projects' }) {
  const { lang, toggle, t } = useLang()
  const isLight = variant === 'light' || variant === 'projects'
  const inkStyle = isLight ? { color: 'rgba(28,22,20,0.75)' } : {}
  const hidePortfolioLabel = variant === 'projects'

  return (
    <div className="pointer-events-none absolute inset-0 z-20" style={inkStyle}>
      <div className="pointer-events-auto absolute left-5 top-4 flex items-center gap-3">
        <Link href="/" className="text-sm font-bold tracking-[0.18em]"><LetterSwap label="J / D" /></Link>
        <Clock />
      </div>
      <nav className="pointer-events-auto absolute right-5 top-4 flex items-center gap-3 ui-label">
        <Link href="/projects" className={styles.link}>{t(uiProjects)}</Link>
        <span>/</span>
        <Link href="/about" className={styles.link}>{t(ui.about)}</Link>
        <span>/</span>
        <Link href="/commission" className={styles.link}>{t(ui.commission)}</Link>
        <button onClick={toggle} aria-label="toggle language"
          className="ml-1 rounded-full border border-current px-2 py-0.5">{lang === 'zh' ? 'EN' : '中'}</button>
      </nav>
      {/* Hidden on /projects to avoid collision with the "Featured NN projects" header */}
      {!hidePortfolioLabel && (
        <span className="absolute left-5 top-1/2 -translate-y-1/2 ui-label opacity-70">portfolio 2026</span>
      )}
      <span className="absolute right-5 top-1/2 -translate-y-1/2 ui-label opacity-70">{t(ui.scroll)}</span>
      <span className="absolute bottom-6 left-[9.5rem] max-w-[12rem] ui-label leading-relaxed opacity-70">
        PV · VJ · 映像创作 × 创意开发
      </span>
    </div>
  )
}
