'use client'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang } from '@/lib/i18n'
import { Reveal, RevealUp, RevealGroup } from '@/components/Reveal'
import { TiltCard } from '@/components/TiltCard'

export default function About() {
  const { t } = useLang()
  const bio = { zh: '我是 JUNK_DOGE —— PV师 / VJ / 映像创作，同时做创意开发（after-effects-mcp 等工具）。',
                en: "I'm JUNK_DOGE — PV / VJ / motion artist, and a creative developer (tools like after-effects-mcp)." }
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
            <p className="max-w-xl text-lg leading-relaxed">{t(bio)}</p>
          </Reveal>
          <div className="mt-10 flex flex-wrap gap-3 ui-label">
            <RevealUp>
              <TiltCard maxDeg={14}>
                <a className="inline-block rounded-full border border-current px-4 py-2" href="https://space.bilibili.com/73910418" target="_blank" rel="noreferrer">BILIBILI ↗</a>
              </TiltCard>
            </RevealUp>
            <RevealUp>
              <TiltCard maxDeg={14}>
                <a className="inline-block rounded-full border border-current px-4 py-2" href="https://github.com/JUNKDOGE-JOE" target="_blank" rel="noreferrer">GITHUB ↗</a>
              </TiltCard>
            </RevealUp>
            <RevealUp>
              <TiltCard maxDeg={14}>
                <a className="inline-block rounded-full border border-current px-4 py-2" href="mailto:2814374544@qq.com">EMAIL ↗</a>
              </TiltCard>
            </RevealUp>
          </div>
        </RevealGroup>
      </section>
    </main>
  )
}
