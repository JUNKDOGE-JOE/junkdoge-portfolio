'use client'
import { useLang, ui } from '@/lib/i18n'

export function ProjectCounter({ index, total, onPrev, onNext }: {
  index: number; total: number; onPrev: () => void; onNext: () => void
}) {
  const { t } = useLang()
  const n = String(index + 1).padStart(2, '0')
  return (
    <div className="absolute bottom-5 left-5 flex h-32 w-32 flex-col items-center justify-center rounded-full border border-current/40 text-center">
      <span className="ui-label text-[0.6rem] opacity-70">{t(ui.project)}</span>
      <span className="text-3xl font-medium leading-none">{n}</span>
      <span className="ui-label text-[0.6rem] opacity-70">{t(ui.number)}</span>
      <button aria-label="previous" onClick={onPrev} className="absolute -left-2 top-1/2 -translate-y-1/2 p-2">←</button>
      <button aria-label="next" onClick={onNext} className="absolute -right-2 top-1/2 -translate-y-1/2 p-2">→</button>
    </div>
  )
}
