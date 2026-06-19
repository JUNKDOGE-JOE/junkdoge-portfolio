'use client'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang } from '@/lib/i18n'
import { Reveal, RevealGroup } from '@/components/Reveal'
import { site } from '@/lib/site'

export default function Commission() {
  const { t } = useLang()
  return (
    <main className="relative min-h-screen bg-[var(--night)] text-[var(--paper-text)]">
      <SmoothScroll />
      <CornerFurniture />
      <section className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <RevealGroup>
          <Reveal>
            <h1 className="display-italic text-6xl font-bold md:text-8xl">{t({ zh: '委托', en: 'Commission' })}</h1>
          </Reveal>
          <ul className="mt-10 divide-y divide-white/15">
            {site.commission.tiers.map((x) => (
              <Reveal key={x.k}>
                <li className="flex items-center justify-between py-5">
                  <span className="text-xl">{x.k}</span>
                  <span className="opacity-80">{t({ zh: x.zh, en: x.en })}</span>
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-16">
            <footer className="ui-label opacity-70">
              {site.commission.contact}
            </footer>
          </Reveal>
        </RevealGroup>
      </section>
    </main>
  )
}
