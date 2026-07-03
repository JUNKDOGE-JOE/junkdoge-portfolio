'use client'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang } from '@/lib/i18n'
import { Reveal, RevealUp, RevealGroup } from '@/components/Reveal'
import { site } from '@/lib/site'
import { sfxHover, sfxClick } from '@/lib/sound'

const steps = [
  { no: '01', zh: '聊需求', en: 'Brief' },
  { no: '02', zh: '定报价与档期', en: 'Quote & schedule' },
  { no: '03', zh: '制作与看片', en: 'Production & review' },
  { no: '04', zh: '交付成片', en: 'Delivery' },
]

export default function Commission() {
  const { t } = useLang()
  const mail = site.about.links.find((l) => l.href.startsWith('mailto:'))
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--night)] text-[var(--paper-text)]">
      <SmoothScroll />
      <CornerFurniture />
      <section className="relative isolate mx-auto max-w-4xl px-6 pt-32 pb-24">
        {/* Ghost word — echoes the home slide's outline numerals */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-10 -z-10 select-none font-black italic leading-none"
          style={{ fontSize: 'clamp(5rem, 14vw, 10.5rem)', color: 'transparent', WebkitTextStroke: '1.5px rgba(241,238,232,0.10)' }}
        >
          WORK
        </span>

        <RevealGroup>
          <Reveal><p className="ui-label opacity-55">J / D — COMMISSION</p></Reveal>
          <Reveal className="mt-3">
            <h1 className="display-italic text-6xl font-bold md:text-8xl">{t({ zh: '委托', en: 'Commission' })}</h1>
          </Reveal>
          {site.commission.lead && (
            <Reveal className="mt-8">
              <p className="max-w-xl text-lg leading-relaxed opacity-90">{t(site.commission.lead)}</p>
            </Reveal>
          )}

          {/* Tiers — numbered editorial rows */}
          <div className="mt-14 border-y border-white/12">
            {site.commission.tiers.map((x, i) => (
              <Reveal key={x.k}>
                <div className="grid grid-cols-[2.6rem_1fr_auto] items-baseline gap-x-4 border-b border-white/12 px-3 py-6 -mx-3 last:border-b-0 transition-colors duration-300 hover:bg-white/[0.045]">
                  <span className="ui-label opacity-40">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xl">{x.k}</span>
                  <span className="text-right text-sm opacity-75">{t({ zh: x.zh, en: x.en })}</span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Process strip */}
          <Reveal className="mt-14"><p className="ui-label opacity-55">{t({ zh: '流程', en: 'PROCESS' })}</p></Reveal>
          <Reveal className="mt-4">
            <p className="ui-label flex flex-wrap items-center gap-x-3 gap-y-2 opacity-75">
              {steps.map((s, i) => (
                <span key={s.no} className="flex items-center gap-3">
                  <span className="flex items-baseline gap-2">
                    <span className="opacity-45">{s.no}</span>
                    <span>{t({ zh: s.zh, en: s.en })}</span>
                  </span>
                  {i < steps.length - 1 && <span aria-hidden="true" className="opacity-35">→</span>}
                </span>
              ))}
            </p>
          </Reveal>

          {/* Contact */}
          <Reveal className="mt-14"><p className="ui-label opacity-55">{t({ zh: '联系', en: 'CONTACT' })}</p></Reveal>
          {mail && (
            <RevealUp className="mt-4">
              <a
                href={mail.href}
                onMouseEnter={sfxHover}
                onClick={sfxClick}
                className="inline-block rounded-full border border-current px-5 py-2.5 ui-label transition-colors duration-300 hover:bg-white/10"
              >
                {t({ zh: '发邮件聊聊', en: 'EMAIL ME' })} ↗
              </a>
            </RevealUp>
          )}
          <Reveal className="mt-5">
            <footer className="ui-label opacity-60">{site.commission.contact}</footer>
          </Reveal>
        </RevealGroup>
      </section>
    </main>
  )
}
