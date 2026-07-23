import type { Metadata } from 'next'
import { projects } from '@/content/projects'
import { site } from '@/lib/site'
import { EndfieldCinema } from './endfield-cinema'

export const metadata: Metadata = {
  title: 'JUNK_DOGE — ENDFIELD / 终末地整屏档案',
  description: 'JUNK_DOGE 个人主页 · 终末地风格实验：fullpage 整屏 cinema。科幻拓荒、机能工业、CAD 图纸感。',
}

export default function EndfieldPage() {
  const works = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order)
  return <EndfieldCinema works={works} site={site} buildYear={new Date().getFullYear()} />
}
