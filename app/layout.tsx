import type { Metadata } from 'next'
import { Noto_Sans_SC } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { ViewTransitions } from 'next-view-transitions'
import { DeviceTilt } from '@/components/DeviceTilt'
import { site } from '@/lib/site'

const noto = Noto_Sans_SC({ subsets: ['latin'], weight: ['400', '500', '700', '900'], variable: '--font-noto', preload: false })

export const metadata: Metadata = {
  title: 'JUNK_DOGE — 文字 × 映像 × 代码',
  description: 'JUNK_DOGE 的个人主页：PV / VJ / 映像创作与创意开发。Type, motion and code — PV, VJ visuals and creative tools by JUNK_DOGE.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className={noto.variable} style={{ fontFamily: 'var(--font-noto), system-ui, sans-serif' }}>
        <ViewTransitions>
          <Providers>{children}</Providers>
        </ViewTransitions>
        {/* 全局「装修中」提示 —— 固定顶部居中,脉动点 + 文字,不挡交互 */}
        <div aria-hidden className="pointer-events-none fixed top-14 md:top-3 left-1/2 z-40 -translate-x-1/2">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[0.62rem] tracking-[0.18em]"
            style={{
              background: 'rgba(18,18,22,0.55)',
              color: 'rgba(255,255,255,0.82)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#fbbf24' }} />
            {site.misc.bannerText}
          </span>
        </div>
        <div aria-hidden className="grain-overlay" />
        <DeviceTilt />
      </body>
    </html>
  )
}
