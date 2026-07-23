import type { Metadata } from 'next'
import { Book } from './Book'

export const metadata: Metadata = {
  title: 'JUNK_DOGE — 纸上展册 | Sandbox',
  description: '纸感展册 · 可翻页的展览图录：JUNK_DOGE 个人主页实验。',
}

export default function SandboxPage() {
  return <Book />
}
