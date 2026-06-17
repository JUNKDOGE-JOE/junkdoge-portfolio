'use client'
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

  return (
    <div data-testid="slide" className={dark ? 'text-[var(--paper-text)]' : 'text-[var(--ink)]'}>
      {image ? <MediaImageSkin project={project} /> : <DevSkin project={project} />}
      <div className="absolute left-1/2 top-[42%] w-[88%] max-w-3xl -translate-x-1/2 -translate-y-1/2 text-center">
        <h2 className="display-italic text-5xl font-medium leading-[0.95] md:text-7xl">{t(project.title)}</h2>
        <p className="ui-label mt-3 opacity-80">{t(project.role)} / {project.year}</p>
        <div className="mt-4 flex items-start justify-center gap-8">
          <p className="max-w-[15rem] text-left text-sm leading-relaxed opacity-90">{t(project.desc)}</p>
          <a href={visitHref(project)} target="_blank" rel="noreferrer"
            className="whitespace-nowrap rounded-full border px-4 py-1.5 text-xs tracking-wider"
            style={{ borderColor: dark ? '#fff' : 'var(--ink)' }}>
            {verb} ↗
          </a>
        </div>
      </div>
      <div className="absolute bottom-4 right-4">
        <CircleCrop src={circleSrc} alt={t(project.title)} size={140} />
      </div>
      <span className="sr-only">{lang}</span>
    </div>
  )
}
