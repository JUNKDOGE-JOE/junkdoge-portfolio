'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useLang } from '@/lib/i18n'
import type { Project } from '@/content/projects'
import { galleryFor } from '@/lib/projects'

export function Gallery({ project, onClose }: { project: Project; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const { t } = useLang()
  const imgs = galleryFor(project)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-g="backdrop"]', { autoAlpha: 0, duration: 0.35 })
      gsap.from('[data-g="panel"]', { autoAlpha: 0, y: 28, duration: 0.5, ease: 'power3.out' })
      gsap.from('[data-g="card"]', { autoAlpha: 0, y: 42, duration: 0.55, stagger: 0.08, delay: 0.12, ease: 'power3.out' })
    }, root)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { ctx.revert(); window.removeEventListener('keydown', onKey) }
  }, [onClose])
  return (
    <div ref={root} className="fixed inset-0 z-50 text-[var(--paper-text)]">
      <div data-g="backdrop" onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-2xl" />
      <div data-g="panel" className="absolute inset-0 flex flex-col gap-8 overflow-hidden p-8 md:flex-row md:p-16">
        <div className="shrink-0 md:w-1/3">
          <button onClick={onClose} aria-label="close gallery" className="ui-label mb-10 opacity-70 transition-opacity hover:opacity-100">✕ CLOSE</button>
          <h2 className="display-italic text-4xl font-medium leading-[0.95] md:text-6xl">{t(project.title)}</h2>
          <p className="ui-label mt-4 opacity-70">{t(project.role)} / {project.year}</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed opacity-80">{t(project.desc)}</p>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
          {imgs.map((src, i) => (
            <div key={i} data-g="card" className="overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
              <img src={src} alt="" className="w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
