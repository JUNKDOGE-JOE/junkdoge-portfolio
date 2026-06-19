'use client'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang } from '@/lib/i18n'
import { Reveal, RevealUp, RevealGroup } from '@/components/Reveal'
import { TiltCard } from '@/components/TiltCard'
import { site } from '@/lib/site'

export default function About() {
  const { t } = useLang()
  return (
    <main className="relative min-h-screen bg-[var(--bone)] text-[var(--ink)]">
      <SmoothScroll />
      <CornerFurniture />
      <section className="mx-auto max-w-4xl px-6 pt-32">
        <RevealGroup>
          <Reveal>
            <h1 className="display-italic text-6xl font-bold md:text-8xl">{t({ zh: '关于', en: 'About' })}</h1>
          </Reveal>
          <Reveal className="mt-6">
            <p className="max-w-xl text-lg leading-relaxed">{t(site.about.bio)}</p>
          </Reveal>
          <div className="mt-10 flex flex-wrap gap-3 ui-label">
            {site.about.links.map((l) => {
              const ext = l.href.startsWith('http')
              return (
                <RevealUp key={l.label}>
                  <TiltCard maxDeg={14}>
                    <a
                      className="inline-block rounded-full border border-current px-4 py-2"
                      href={l.href}
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
