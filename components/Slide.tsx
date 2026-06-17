'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Project } from '@/content/projects'
import { isImageSkin, galleryFor } from '@/lib/projects'
import { useLang } from '@/lib/i18n'
import { CircleCrop } from './CircleCrop'
import { LetterSwap } from './LetterSwap'
import { Gallery } from './Gallery'

function visitHref(p: Project): string {
  return p.links.bilibili || p.links.github || p.links.external || '#'
}

export function Slide({ project }: { project: Project }) {
  const { t, lang } = useLang()
  const dark = isImageSkin(project)
  const circleSrc = project.devVisual ?? project.cover
  const verb = project.type === 'dev' ? t({ zh: '查看', en: 'VIEW' }) : t({ zh: '观看', en: 'WATCH' })
  const href = visitHref(project)
  const hasGallery = galleryFor(project).length > 0
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLButtonElement>(null)

  const openGallery = () => {
    if (circleRef.current) setOriginRect(circleRef.current.getBoundingClientRect())
    setGalleryOpen(true)
  }

  // Masked sentence-stagger reveal — runs on every remount (i.e. every slug change)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('[data-reveal] > *', { yPercent: 110 })
      gsap.to('[data-reveal] > *', {
        yPercent: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.09,
      })
    }, rootRef)
    return () => ctx.revert()
  }, [project.slug])

  return (
    <div
      ref={rootRef}
      data-testid="slide"
      className={`relative h-full w-full ${dark ? 'text-[var(--paper-text)]' : 'text-[var(--ink)]'}`}
    >
      <div aria-live="polite" className="absolute left-1/2 top-[42%] w-[88%] max-w-3xl -translate-x-1/2 -translate-y-1/2 text-center">
        {/* Title mask */}
        <span className="block overflow-hidden" data-reveal>
          <h2 className="display-italic block text-5xl font-medium leading-[0.95] md:text-7xl">
            {t(project.title)}
          </h2>
        </span>

        {/* Meta mask */}
        <span className="block overflow-hidden" data-reveal>
          <p className="ui-label block mt-3 opacity-80">{t(project.role)} / {project.year}</p>
        </span>

        <div className="mt-4 flex items-start justify-center gap-8">
          {/* Description mask */}
          <span className="block overflow-hidden" data-reveal>
            <p className="block max-w-[15rem] text-left text-sm leading-relaxed opacity-90">{t(project.desc)}</p>
          </span>

          {href !== '#' && (
            /* Visit button mask */
            <span className="block overflow-hidden" data-reveal>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="block whitespace-nowrap rounded-full border px-4 py-1.5 text-xs tracking-wider"
                style={{
                  borderColor: 'color-mix(in srgb, var(--accent) 60%, white)',
                  boxShadow: '0 0 18px color-mix(in srgb, var(--accent) 30%, transparent)',
                }}
              >
                <LetterSwap label={verb} /> ↗
              </a>
            </span>
          )}
        </div>
      </div>

      {/* Circle: morph trigger for image projects, plain circle for dev */}
      <div className="absolute bottom-3 right-3 scale-90 sm:scale-100">
        {hasGallery ? (
          <button
            ref={circleRef}
            onClick={openGallery}
            aria-label="open gallery"
            className="group absolute bottom-0 right-0 h-[140px] w-[140px] overflow-hidden rounded-full border border-white/40 cursor-pointer"
            style={{ visibility: galleryOpen ? 'hidden' : 'visible' }}
          >
            <img
              src={circleSrc}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </button>
        ) : (
          <CircleCrop src={circleSrc} alt={t(project.title)} size={140} />
        )}
      </div>

      <span className="sr-only">{lang}</span>
      {galleryOpen && (
        <Gallery
          project={project}
          originRect={originRect}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  )
}
