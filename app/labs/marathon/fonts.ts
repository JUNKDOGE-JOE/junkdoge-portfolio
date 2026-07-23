import { Anton } from 'next/font/google'

// Anton — condensed ultra-heavy grotesque，仅用于巨型展示标题。
// 其余文字统一走根 layout 的 Noto Sans SC(var(--font-noto))。
export const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mr-anton',
  preload: false,
})
