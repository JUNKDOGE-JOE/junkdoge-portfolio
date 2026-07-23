import type { Metadata } from 'next'
import { Marathon } from './labs/marathon/Marathon'

export const metadata: Metadata = {
  title: 'JUNK_DOGE — 文字 × 映像 × 代码',
  description:
    'JUNK_DOGE 的个人主页：Showreel、作品、简介与委托。Motion design, PV / VJ and creative development.',
}

export default function Home() {
  return <Marathon />
}
