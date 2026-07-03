'use client'
import { Link } from 'next-view-transitions'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang } from '@/lib/i18n'
import { Reveal, RevealUp, RevealGroup } from '@/components/Reveal'
import { MultilineCopy } from '@/components/MultilineCopy'
import { TiltCard } from '@/components/TiltCard'
import { GhostOutline } from '@/components/GhostOutline'
import { site } from '@/lib/site'
import { sfxHover, sfxClick } from '@/lib/sound'

export default function About() {
  const { t, lang } = useLang()
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bone)] text-[var(--ink)]">
      <SmoothScroll />
      <CornerFurniture />
      <section className="relative isolate mx-auto max-w-4xl px-5 pt-24 pb-20 sm:px-6 md:pt-32 md:pb-24">
        {/* Ghost word — desktop only; it crowds the title on narrow screens */}
        <GhostOutline
          text="ABOUT"
          color="rgba(28,26,23,0.09)"
          viewBoxWidth={320}
          className="pointer-events-none absolute left-0 top-2 -z-10 hidden select-none md:block"
          style={{ width: 'clamp(24rem, 56vw, 44rem)', height: 'auto' }}
        />

        <RevealGroup>
          <Reveal><p className="ui-label opacity-55">J / D — PROFILE</p></Reveal>
          <Reveal className="mt-3">
            <h1 className="display-italic text-6xl font-bold md:text-8xl">{t({ zh: '关于', en: 'About' })}</h1>
          </Reveal>
          <RevealUp className="mt-8">
            <MultilineCopy text={t(site.about.bio)} className="max-w-2xl text-base leading-relaxed md:text-lg" />
          </RevealUp>

          {/* Services — synced from commission tiers (edit in admin → 委托 tab) */}
          <Reveal className="mt-14">
            <p className="ui-label opacity-55">{t({ zh: '制作内容', en: 'WHAT I MAKE' })}</p>
          </Reveal>
          <div className="mt-4 border-y border-black/10">
            {site.commission.tiers.map((x, i) => (
              <Reveal key={x.k}>
                <div className="grid grid-cols-[2.6rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-black/10 py-5 last:border-b-0 md:grid-cols-[2.6rem_1fr_auto]">
                  <span className="ui-label opacity-40">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-lg font-medium">{lang === 'en' && x.kEn ? x.kEn : x.k}</span>
                  <span className="col-start-2 text-sm opacity-70 md:col-start-3 md:text-right">{t({ zh: x.zh, en: x.en })}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-4">
            <Link href="/commission" onMouseEnter={sfxHover} onClick={sfxClick}
                  className="ui-label inline-block opacity-60 transition-opacity hover:opacity-100">
              {t({ zh: '委托详情 →', en: 'COMMISSION DETAILS →' })}
            </Link>
          </Reveal>

          {/* Links */}
          <Reveal className="mt-14"><p className="ui-label opacity-55">FIND ME</p></Reveal>
          <div className="mt-4 flex flex-wrap gap-3 ui-label">
            {site.about.links.map((l) => {
              const ext = l.href.startsWith('http')
              return (
                <RevealUp key={l.label}>
                  <TiltCard maxDeg={14}>
                    <a
                      className="inline-block rounded-full border border-current px-4 py-2 transition-colors duration-300 hover:bg-black/[0.06]"
                      href={l.href}
                      onMouseEnter={sfxHover}
                      onClick={sfxClick}
                      {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {l.label} ↗
                    </a>
                  </TiltCard>
                </RevealUp>
              )
            })}
          </div>
        </RevealGroup>
      </section>
    </main>
  )
}
