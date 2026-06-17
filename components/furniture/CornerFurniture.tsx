'use client'
import Link from 'next/link'
import { useLang, ui } from '@/lib/i18n'
import { Clock } from './Clock'
import { LetterSwap } from '@/components/LetterSwap'

export function CornerFurniture() {
  const { lang, toggle, t } = useLang()
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="pointer-events-auto absolute left-5 top-4 flex items-center gap-3">
        <Link href="/" className="text-sm font-bold tracking-[0.18em]"><LetterSwap label="J / D" /></Link>
        <Clock />
      </div>
      <nav className="pointer-events-auto absolute right-5 top-4 flex items-center gap-3 ui-label">
        <Link href="/about"><LetterSwap label={t(ui.about)} /></Link>
        <span>/</span>
        <Link href="/commission"><LetterSwap label={t(ui.commission)} /></Link>
        <button onClick={toggle} aria-label="toggle language"
          className="ml-1 rounded-full border border-current px-2 py-0.5">{lang === 'zh' ? 'EN' : '中'}</button>
      </nav>
      <span className="absolute left-5 top-1/2 -translate-y-1/2 ui-label opacity-70">portfolio 2026</span>
      <span className="absolute right-5 top-1/2 -translate-y-1/2 ui-label opacity-70">{t(ui.scroll)}</span>
      <span className="absolute bottom-6 left-[9.5rem] max-w-[12rem] ui-label leading-relaxed opacity-70">
        PV · VJ · 映像创作 × 创意开发
      </span>
    </div>
  )
}
