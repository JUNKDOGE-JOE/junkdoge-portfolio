import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'LABS — 风格实验 · JUNK_DOGE',
  description: '三份不同风格的个人主页实验：终末地 / 失落星船马拉松（准上线候选） / 纸感展册。',
}

const designs = [
  {
    href: '/labs/endfield',
    no: 'EXP.01',
    name: '终末地',
    en: 'ENDFIELD STYLE',
    desc: '整屏翻页 cinema · 一屏一作品 · 切片过渡 + 扫描线 · HUD 刻度轨导航',
    badge: null as string | null,
    bg: '#0E0F11',
    fg: '#F2F0EA',
    accent: '#F5D110',
  },
  {
    href: '/labs/marathon',
    no: 'EXP.02',
    name: '失落星船马拉松',
    en: 'MARATHON STYLE',
    desc: 'Showreel 首屏 · 粘性横向作品轨 · 关于 / 委托单页锚点 · Anton × 酸绿',
    badge: '已切主站 → /',
    bg: '#0A0A0B',
    fg: '#FFFFFF',
    accent: '#D8FF3D',
  },
  {
    href: '/labs/sandbox',
    no: 'EXP.03',
    name: '纸感展册',
    en: 'EDITORIAL CATALOG',
    desc: '可翻页展览图录 · 对开跨页 · 目录索引跳页 · 书页模型 · 朱红印章',
    badge: null as string | null,
    bg: '#F4F1EA',
    fg: '#1A1815',
    accent: '#C8442C',
  },
] as const

export default function LabsIndex() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#111',
        color: '#eee',
        fontFamily: 'var(--font-noto), system-ui, sans-serif',
        padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 8vw, 6rem)',
      }}
    >
      <p style={{ fontSize: '0.72rem', letterSpacing: '0.3em', opacity: 0.55, marginBottom: '0.75rem' }}>
        JUNK_DOGE // STYLE LABS
      </p>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '0.5rem' }}>
        主页风格实验
      </h1>
      <p style={{ opacity: 0.65, marginBottom: '3rem', fontSize: '0.95rem' }}>
        同一套真实内容，三种视觉语言。马拉松已切为主站 `/`；此处保留终末地与纸感展册对照。
      </p>

      <div style={{ display: 'grid', gap: '1px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.15)' }}>
        {designs.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center',
              gap: 'clamp(1rem, 3vw, 2.5rem)',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              background: d.bg,
              color: d.fg,
              textDecoration: 'none',
            }}
          >
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.72rem', color: d.accent }}>{d.no}</span>
            <span>
              <span style={{ display: 'block', fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 900 }}>
                {d.name}{' '}
                <span style={{ fontSize: '0.6em', fontWeight: 400, opacity: 0.6, letterSpacing: '0.15em' }}>{d.en}</span>
                {d.badge ? (
                  <span
                    style={{
                      marginLeft: '0.75rem',
                      fontSize: '0.55em',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      color: d.accent,
                      verticalAlign: 'middle',
                    }}
                  >
                    {d.badge}
                  </span>
                ) : null}
              </span>
              <span style={{ display: 'block', marginTop: '0.4rem', fontSize: '0.8rem', opacity: 0.65 }}>{d.desc}</span>
            </span>
            <span aria-hidden style={{ color: d.accent, fontSize: '1.4rem' }}>
              →
            </span>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '0.75rem', opacity: 0.45 }}>
        <Link href="/" style={{ color: 'inherit' }}>
          ← 返回当前主页
        </Link>
      </p>
    </main>
  )
}
