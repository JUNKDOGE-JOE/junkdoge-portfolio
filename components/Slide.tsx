'use client'
import { useRef, useState } from 'react'
import gsap from 'gsap'
import type { Project } from '@/content/projects'
import { isImageSkin, galleryFor } from '@/lib/projects'
import { useIsoLayoutEffect } from '@/lib/useIsoLayoutEffect'
import { useLang } from '@/lib/i18n'
import { CircleCrop } from './CircleCrop'
import { LetterSwap } from './LetterSwap'
import { Gallery } from './Gallery'
import { sfxHover, sfxClick } from '@/lib/sound'

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
    sfxClick()
    if (circleRef.current) setOriginRect(circleRef.current.getBoundingClientRect())
    setGalleryOpen(true)
  }

  // Masked reveal — runs on every remount (i.e. every slug change).
  // useIsoLayoutEffect (layout effect) sets the hidden start state BEFORE paint, so
  // there's no one-frame flash of the content at its natural position on switch.
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Per-letter stagger for the title chars (130% so the clipped char is fully hidden)
      gsap.set('[data-reveal-char]', { yPercent: 130 })
      gsap.to('[data-reveal-char]', {
        yPercent: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.035,
      })
      // Sentence-mask stagger for meta / desc / button (unchanged)
      gsap.set('[data-reveal] > *', { yPercent: 110 })
      gsap.to('[data-reveal] > *', {
        yPercent: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.09,
      })
      // Circle button: fade in so it doesn't flash on project switch
      if (circleRef.current) {
        gsap.from(circleRef.current, { autoAlpha: 0, duration: 0.6, delay: 0.25, ease: 'power2.out' })
      }
      // Ghost numeral drifts in slightly after the title
      gsap.from('[data-ghost]', { autoAlpha: 0, scale: 1.06, duration: 1.1, delay: 0.1, ease: 'power2.out' })
    }, rootRef)
    return () => ctx.revert()
  }, [project.slug])

  return (
    <div
      ref={rootRef}
      data-testid="slide"
      className={`relative h-full w-full ${dark ? 'text-[var(--paper-text)]' : 'text-[var(--ink)]'}`}
    >
      <div aria-live="polite" className="absolute left-1/2 top-[42%] w-[88%] max-w-3xl text-center"
           style={{ transform: 'translate(-50%, -50%) translate(calc((var(--mx,0.5) - 0.5) * 16px), calc((var(--my,0.5) - 0.5) * 16px))', transition: 'transform 0.3s ease-out' }}>
        {/* Ghost index numeral — oversized outline digit behind the title (editorial depth layer) */}
        <span
          aria-hidden="true"
          data-ghost
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-black italic leading-none"
          style={{
            fontSize: 'clamp(11rem, 30vw, 24rem)',
            color: 'transparent',
            // explicit colours: currentColor would resolve to the transparent fill above
            WebkitTextStroke: dark ? '1.5px rgba(241,238,232,0.17)' : '1.5px rgba(28,26,23,0.15)',
          }}
        >
          {String(project.order).padStart(2, '0')}
        </span>

        {/* Title: per-letter masked stagger — pb+leading give room for descenders/italic */}
        <h2
          className="display-italic text-5xl font-medium md:text-7xl"
          aria-label={t(project.title)}
        >
          {t(project.title).split('').map((char, i) => (
            <span
              key={i}
              className="inline-block align-bottom leading-[1.25] pb-[0.12em]"
              style={{ clipPath: 'inset(0 -0.45em 0 -0.45em)' }}
              aria-hidden="true"
            >
              <span className="inline-block" data-reveal-char>
                {char === ' ' ? ' ' : char}
              </span>
            </span>
          ))}
        </h2>

        {/* Meta mask */}
        <span className="block overflow-hidden" data-reveal>
          <p className="ui-label mt-3 flex items-center justify-center gap-2.5 opacity-80">
            <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--accent) 65%, currentColor)' }} />
            <span>{t(project.role)} · {project.year}</span>
            <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--accent) 65%, currentColor)' }} />
          </p>
        </span>

        <div className="mt-4 flex items-start justify-center gap-8">
          {/* Description mask */}
          <span className="block overflow-hidden" data-reveal>
            <p className="block max-w-[15rem] text-left text-sm leading-relaxed opacity-90">{t(project.desc)}</p>
          </span>

          {href !== '#' && (
            /* Visit button — no overflow-hidden so the accent glow isn't clipped into a rectangle */
            <span className="block" data-reveal>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={sfxHover}
                onClick={sfxClick}
                className="block whitespace-nowrap rounded-full border px-4 py-1.5 text-xs tracking-wider transition-[background-color,box-shadow] duration-300 hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] hover:shadow-[0_0_28px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
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
      <div className="absolute bottom-3 right-3"
           style={{ transform: 'translate(calc((var(--mx,0.5) - 0.5) * 38px), calc((var(--my,0.5) - 0.5) * 38px)) scale(0.95)', transition: 'transform 0.3s ease-out' }}>
        {hasGallery ? (
          <>
            {/* Slow-spinning label ring — signals the circle is clickable */}
            <svg
              aria-hidden="true"
              viewBox="0 0 200 200"
              className="ring-spin pointer-events-none absolute bottom-[-30px] right-[-30px] h-[200px] w-[200px] opacity-45"
              style={{ visibility: galleryOpen ? 'hidden' : 'visible' }}
            >
              <defs>
                <path id={`galring-${project.slug}`} d="M100,100 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0" />
              </defs>
              <text fill="currentColor" style={{ fontSize: '10px', letterSpacing: '0.34em', textTransform: 'uppercase' }}>
                <textPath href={`#galring-${project.slug}`}>
                  open gallery · 打开画廊 · open gallery · 打开画廊 ·
                </textPath>
              </text>
            </svg>
            <button
              ref={circleRef}
              onClick={openGallery}
              onMouseEnter={sfxHover}
              aria-label="open gallery"
              className="group absolute bottom-0 right-0 h-[140px] w-[140px] overflow-hidden rounded-full border border-white/40 cursor-pointer"
              style={{ visibility: galleryOpen ? 'hidden' : 'visible' }}
            >
              <img
                src={circleSrc}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                style={project.type === 'dev' ? { objectPosition: 'top' } : undefined}
              />
            </button>
          </>
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
