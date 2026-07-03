'use client'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang, ui } from '@/lib/i18n'
import { Reveal, RevealUp, RevealGroup } from '@/components/Reveal'
import { TiltCard } from '@/components/TiltCard'
import { site } from '@/lib/site'
import { projects } from '@/content/projects'
import { sfxHover, sfxClick } from '@/lib/sound'

const fields = [
  { no: '01', name: { zh: 'PV · 文字PV', en: 'PV · Lyric Motion' }, desc: { zh: '文字与画面同频呼吸的叙事影像', en: 'Narrative visuals where type breathes with the music' } },
  { no: '02', name: { zh: 'VJ · 现场视觉', en: 'VJ · Live Visuals' }, desc: { zh: '演出与音乐会的实时画面', en: 'Real-time visuals for shows and concerts' } },
  { no: '03', name: { zh: '创意开发', en: 'Creative Dev' }, desc: { zh: 'after-effects-mcp 等让 AI 参与映像制作的工具', en: 'Tools like after-effects-mcp that let AI join motion-making' } },
]

export default function About() {
  const { t } = useLang()
  const years = projects.map((p) => parseInt(p.year, 10)).filter((n) => !Number.isNaN(n))
  const yearSpan = years.length ? `${Math.min(...years)} — ${Math.max(...years)}` : ''
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bone)] text-[var(--ink)]">
      <SmoothScroll />
      <CornerFurniture />
      <section className="relative isolate mx-auto max-w-4xl px-6 pt-32 pb-24">
        {/* Ghost word — echoes the home slide's outline numerals */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-8 -z-10 select-none font-black italic leading-none"
          style={{ fontSize: 'clamp(6.5rem, 17vw, 12.5rem)', color: 'transparent', WebkitTextStroke: '1.5px rgba(28,26,23,0.09)' }}
        >
          ABOUT
        </span>

        <RevealGroup>
          <Reveal><p className="ui-label opacity-55">J / D — PROFILE</p></Reveal>
          <Reveal className="mt-3">
            <h1 className="display-italic text-6xl font-bold md:text-8xl">{t({ zh: '关于', en: 'About' })}</h1>
          </Reveal>
          <Reveal className="mt-8">
            <p className="max-w-xl text-lg leading-relaxed">{t(site.about.bio)}</p>
          </Reveal>

          {/* Stats strip — derived from project data */}
          <Reveal className="mt-10">
            <p className="ui-label flex flex-wrap gap-x-7 gap-y-2 opacity-60">
              <span>{t(ui.works)} {String(projects.length).padStart(2, '0')}</span>
              <span>{yearSpan}</span>
              <span>PV / VJ / DEV</span>
            </p>
          </Reveal>

          {/* Fields — numbered editorial rows */}
          <div className="mt-14 border-y border-black/10">
            {fields.map((f) => (
              <Reveal key={f.no}>
                <div className="grid grid-cols-[2.6rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-black/10 py-5 last:border-b-0 md:grid-cols-[2.6rem_15rem_1fr]">
                  <span className="ui-label opacity-40">{f.no}</span>
                  <span className="text-lg font-medium">{t(f.name)}</span>
                  <span className="col-start-2 text-sm opacity-70 md:col-start-3">{t(f.desc)}</span>
                </div>
              </Reveal>
            ))}
          </div>

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
