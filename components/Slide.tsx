'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import type { Project } from '@/content/projects'
import { isImageSkin } from '@/lib/projects'
import { useLang } from '@/lib/i18n'
import { MediaImageSkin } from './skins/MediaImageSkin'
import { DevSkin } from './skins/DevSkin'
import { CircleCrop } from './CircleCrop'

function visitHref(p: Project): string {
  return p.links.bilibili || p.links.github || p.links.external || '#'
}

export function Slide({ project }: { project: Project }) {
  const { t, lang } = useLang()
  const image = isImageSkin(project)
  const dark = image
  const circleSrc = project.devVisual ?? project.cover
  const verb = project.type === 'dev' ? t({ zh: '查看', en: 'VIEW' }) : t({ zh: '观看', en: 'WATCH' })
  const href = visitHref(project)

  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="title"]', { yPercent: 12, opacity: 0, duration: 0.7, ease: 'power3.out' })
      gsap.from('[data-anim="meta"]', { opacity: 0, y: 8, duration: 0.6, delay: 0.1 })
    }, rootRef)
    return () => ctx.revert()
  }, [project.slug])

  return (
    <div ref={rootRef} data-testid="slide" className={dark ? 'text-[var(--paper-text)]' : 'text-[var(--ink)]'}>
      {image ? <MediaImageSkin project={project} /> : <DevSkin project={project} />}
      <div aria-live="polite" className="absolute left-1/2 top-[42%] w-[88%] max-w-3xl -translate-x-1/2 -translate-y-1/2 text-center">
        <h2 data-anim="title" className="display-italic text-5xl font-medium leading-[0.95] md:text-7xl">{t(project.title)}</h2>
        <p data-anim="meta" className="ui-label mt-3 opacity-80">{t(project.role)} / {project.year}</p>
        <div className="mt-4 flex items-start justify-center gap-8">
          <p className="max-w-[15rem] text-left text-sm leading-relaxed opacity-90">{t(project.desc)}</p>
          {href !== '#' && (
            <a href={href} target="_blank" rel="noreferrer"
              className="whitespace-nowrap rounded-full border px-4 py-1.5 text-xs tracking-wider"
              style={{ borderColor: dark ? '#fff' : 'var(--ink)' }}>
              {verb} ↗
            </a>
          )}
        </div>
      </div>
      <div className="absolute bottom-3 right-3 scale-90 sm:scale-100">
        <CircleCrop src={circleSrc} alt={t(project.title)} size={140} />
      </div>
      <span className="sr-only">{lang}</span>
    </div>
  )
}
