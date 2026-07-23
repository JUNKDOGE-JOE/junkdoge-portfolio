'use client'
import Link from 'next/link'
import { useLang, ui } from '@/lib/i18n'
import { Clock } from './Clock'
import { LetterSwap } from '@/components/LetterSwap'
import { site } from '@/lib/site'
import { SoundToggle } from '@/components/SoundToggle'
import { sfxHover, sfxClick } from '@/lib/sound'
import styles from './Nav.module.css'

const uiProjects = { zh: '作品', en: 'PROJECTS' }

/**
 * variant="light"     → dark ink for the light-bg /projects page.
 * variant="dark"      → paper-text colours (inherited) for dark pages.
 * variant="home"      → follows the active slide's skin via --ui-ink
 *                        (published by CarouselRoot) so it stays legible
 *                        when the light dev skin is showing.
 * variant="projects"  → same as "light" but hides the mid-left "portfolio 2026"
 *                        label that would collide with the Featured header.
 */
export function CornerFurniture({ variant = 'dark' }: { variant?: 'dark' | 'light' | 'projects' | 'home' }) {
  const { lang, toggle, t } = useLang()
  const isLight = variant === 'light' || variant === 'projects'
  const inkStyle = isLight
    ? { color: 'rgba(28,22,20,0.75)' }
    : variant === 'home'
      ? { color: 'var(--ui-ink, var(--paper-text))', transition: 'color 0.6s ease' }
      : {}
  const hidePortfolioLabel = variant === 'projects'
  // The tagline sits next to the bottom-left counter ring — only home/projects have one
  const showTagline = variant === 'home' || variant === 'projects'

  return (
    <div className="pointer-events-none absolute inset-0 z-20" style={inkStyle}>
      <div className="pointer-events-auto absolute left-4 top-3 flex items-center gap-2 md:left-5 md:top-4 md:gap-3">
        <Link href="/" className="text-sm font-bold tracking-[0.18em]"><LetterSwap label="J / D" /></Link>
        <span className="hidden md:block"><Clock /></span>
      </div>
      <nav className="pointer-events-auto absolute right-3 top-3 flex max-w-[62vw] flex-wrap items-center justify-end gap-x-2 gap-y-1 ui-label sm:max-w-none md:right-5 md:top-4 md:gap-3">
        <Link href="/projects" className={styles.link} onMouseEnter={sfxHover} onClick={sfxClick}>{t(uiProjects)}</Link>
        <span>/</span>
        <Link href="/about" className={styles.link} onMouseEnter={sfxHover} onClick={sfxClick}>{t(ui.about)}</Link>
        <span>/</span>
        <Link href="/commission" className={styles.link} onMouseEnter={sfxHover} onClick={sfxClick}>{t(ui.commission)}</Link>
        <button onClick={() => { sfxClick(); toggle() }} onMouseEnter={sfxHover} aria-label="toggle language"
          className="ml-1 rounded-full border border-current px-2 py-0.5">{lang === 'zh' ? 'EN' : '中'}</button>
        <SoundToggle />
      </nav>
      {/* Hidden on /projects to avoid collision with the "Featured NN projects" header */}
      {!hidePortfolioLabel && (
        <span className="absolute left-5 top-1/2 -translate-y-1/2 hidden md:block ui-label opacity-70">portfolio 2026</span>
      )}
      <span className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:block ui-label opacity-70">{t(ui.scroll)}</span>
      {showTagline && (
        <span className="absolute bottom-[4.6rem] left-[12.5rem] hidden md:block whitespace-nowrap ui-label opacity-55">
          {site.misc.homeTagline}
        </span>
      )}
    </div>
  )
}
