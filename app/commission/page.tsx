'use client'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang } from '@/lib/i18n'
import { Reveal, RevealGroup } from '@/components/Reveal'

const tiers = [
  { k: '文字PV / Lyric', zh: '按时长与复杂度报价', en: 'Priced by length & complexity' },
  { k: 'VJ 素材 / VJ Clips', zh: '按场次与素材量报价', en: 'Priced by show & volume' },
  { k: 'PV / MV', zh: '面议', en: 'By negotiation' },
]

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
            {tiers.map((x) => (
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
              QQ 2814374544 · WeChat weixinJUNKDOGE · 2814374544@qq.com
            </footer>
          </Reveal>
        </RevealGroup>
      </section>
    </main>
  )
}
