import type { Metadata } from 'next'
import { Noto_Sans_SC } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { ViewTransitions } from 'next-view-transitions'

const noto = Noto_Sans_SC({ subsets: ['latin'], weight: ['400', '500', '700', '900'], variable: '--font-noto', preload: false })

export const metadata: Metadata = {
  title: 'JUNK_DOGE — 映像创作 × 创意开发',
  description: 'PV / VJ / 映像创作 and creative development by JUNK_DOGE.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className={noto.variable} style={{ fontFamily: 'var(--font-noto), system-ui, sans-serif' }}>
        <ViewTransitions>
          <Providers>{children}</Providers>
        </ViewTransitions>
      </body>
    </html>
  )
}
