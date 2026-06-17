'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Localized } from '@/content/projects'

export type Lang = 'zh' | 'en'

export const ui = {
  works: { zh: '作品', en: 'WORKS' },
  about: { zh: '关于', en: 'ABOUT' },
  commission: { zh: '委托', en: 'COMMISSION' },
  project: { zh: '项目', en: 'PROJECT' },
  number: { zh: '编号', en: 'NUMBER' },
  scroll: { zh: '滚动', en: 'SCROLL' },
  view: { zh: '查看', en: 'VIEW' },
  watch: { zh: '观看', en: 'WATCH' },
} satisfies Record<string, Localized>

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; toggle: () => void; t: (s: Localized) => string }
const Ctx = createContext<LangCtx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh')
  const toggle = () => setLang((l) => (l === 'zh' ? 'en' : 'zh'))
  const t = (s: Localized) => s[lang]
  return <Ctx.Provider value={{ lang, setLang, toggle, t }}>{children}</Ctx.Provider>
}

export function useLang(): LangCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLang must be used within LangProvider')
  return v
}
