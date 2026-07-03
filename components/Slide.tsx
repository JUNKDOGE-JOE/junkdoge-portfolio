'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Project } from '@/content/projects'
import { isImageSkin, galleryFor } from '@/lib/projects'
import { useIsoLayoutEffect } from '@/lib/useIsoLayoutEffect'
import { useLang } from '@/lib/i18n'
import { LetterSwap } from './LetterSwap'
import { GhostOutline } from './GhostOutline'
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
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLButtonElement>(null)

  // Prefetch this project's gallery while the slide is showing, so opening
  // the gallery (or the mouse trail on desktop) never waits on the network.
  useEffect(() => {
    const srcs = galleryFor(project)
    if (!srcs.length) return
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window ? window.requestIdleCallback(cb) : setTimeout(cb, 350)
    const handle = idle(() => srcs.forEach((src) => { const im = new Image(); im.src = src }))
    return () => {
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(handle as number)
      else clearTimeout(handle as ReturnType<typeof setTimeout>)
    }
  }, [project])

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
      // Ghost numeral: fade only — a scale tween would rasterize the huge
      // outline text on a low-res GPU layer, making it snap sharp afterwards
      gsap.from('[data-ghost]', { autoAlpha: 0, duration: 1.1, delay: 0.1, ease: 'power2.out' })
    }, rootRef)
    return () => ctx.revert()
  }, [project.slug])

  return (
    <div
      ref={rootRef}
      data-testid="slide"
      className={`relative h-full w-full ${dark ? 'text-[var(--paper-text)]' : 'text-[var(--ink)]'}`}
    >
      <div aria-live="polite" className="absolute left-1/2 top-[40%] w-[92%] max-w-3xl text-center md:top-[42%] md:w-[88%]"
           style={{ transform: 'translate(-50%, -50%) translate(calc((var(--mx,0.5) - 0.5) * 16px), calc((var(--my,0.5) - 0.5) * 16px))', transition: 'transform 0.3s ease-out' }}>
        {/* Title block — ghost numeral centres on the visible title box, not the whole slide */}
        <div className="relative inline-block max-w-full">
          {/* Parallax lives on this wrapper (not on [data-ghost]) so GSAP's
              entrance tween doesn't freeze the mouse-driven transform.
              Net drift ≈ -34px vs the title's +16px and the skin's -110px,
              placing the numeral on a depth layer between them. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              transform: 'translate(calc((var(--mx,0.5) - 0.5) * -50px), calc((var(--my,0.5) - 0.5) * -50px))',
              transition: 'transform 0.35s ease-out',
            }}
          >
            <span className="flex h-full w-full items-center justify-center">
              <GhostOutline
                data-ghost
                text={String(project.order).padStart(2, '0')}
                color={dark ? 'rgba(241,238,232,0.17)' : 'rgba(28,26,23,0.15)'}
                className="flex-none overflow-visible"
                style={{ width: 'clamp(20rem, 54vw, 48rem)', height: 'auto' }}
              />
            </span>
          </span>
          <h2
            className="display-italic relative z-[1] text-4xl font-medium sm:text-5xl md:text-7xl"
            aria-label={t(project.title)}
          >
            {/* Words are kept whole (whitespace-nowrap) so lines only break at spaces;
                chars inside each word still stagger individually. */}
            {t(project.title).split(' ').map((word, wi, words) => (
              <span key={wi} aria-hidden="true">
                <span className="inline-block whitespace-nowrap">
                  {word.split('').map((char, ci) => (
                    <span
                      key={ci}
                      className="inline-block align-bottom leading-[1.25] pb-[0.12em]"
                      style={{ clipPath: 'inset(0 -0.45em 0 -0.45em)' }}
                    >
                      <span className="inline-block" data-reveal-char>{char}</span>
                    </span>
                  ))}
                </span>
                {wi < words.length - 1 && ' '}
              </span>
            ))}
          </h2>
        </div>

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
          {/* Description mask — skipped entirely when the project has no blurb */}
          {t(project.desc) && (
            <span className="block overflow-hidden" data-reveal>
              <p className="block max-w-[15rem] text-left text-sm leading-relaxed opacity-90">{t(project.desc)}</p>
            </span>
          )}

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

      {/* Circle: always opens the gallery overlay — with no gallery images it
          simply presents the cover full-size (same behaviour as /projects) */}
      <div className="absolute bottom-3 right-3"
           style={{ transform: 'translate(calc((var(--mx,0.5) - 0.5) * 38px), calc((var(--my,0.5) - 0.5) * 38px)) scale(0.95)', transition: 'transform 0.3s ease-out' }}>
        <>
            {/* Slow-spinning label ring — signals the circle is clickable.
                Hidden on phones: it would clip at the viewport edge. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 200 200"
              className="ring-spin pointer-events-none absolute bottom-[-30px] right-[-30px] hidden h-[200px] w-[200px] opacity-45 md:block"
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
              className="group absolute bottom-0 right-0 h-[108px] w-[108px] overflow-hidden rounded-full border border-white/40 cursor-pointer md:h-[140px] md:w-[140px]"
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
