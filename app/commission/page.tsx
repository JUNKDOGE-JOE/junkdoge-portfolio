'use client'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang } from '@/lib/i18n'

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
        <h1 className="display-italic text-6xl font-bold md:text-8xl">{t({ zh: '委托', en: 'Commission' })}</h1>
        <ul className="mt-10 divide-y divide-white/15">
          {tiers.map((x) => (
            <li key={x.k} className="flex items-center justify-between py-5">
              <span className="text-xl">{x.k}</span>
              <span className="opacity-80">{t({ zh: x.zh, en: x.en })}</span>
            </li>
          ))}
        </ul>
        <footer className="mt-16 ui-label opacity-70">
          QQ 2814374544 · WeChat weixinJUNKDOGE · 2814374544@qq.com
        </footer>
      </section>
    </main>
  )
}
