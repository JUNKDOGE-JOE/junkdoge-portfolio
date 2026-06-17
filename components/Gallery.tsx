'use client'
import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useLang } from '@/lib/i18n'
import type { Project } from '@/content/projects'
import { galleryFor } from '@/lib/projects'

// Module-level open-gallery counter — shared across all Gallery instances so
// CarouselRoot / ScrollingCircles can bail out of their wheel handlers even if a
// DOM event slips through the overlay's stopPropagation.
let _galleryCount = 0
export function isGalleryOpen(): boolean { return _galleryCount > 0 }

export function Gallery({
  project,
  originRect,
  onClose,
}: {
  project: Project
  originRect?: DOMRect | null
  onClose: () => void
}) {
  const root = useRef<HTMLDivElement>(null)
  const firstCardRef = useRef<HTMLDivElement>(null)
  const morphRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()
  const imgs = galleryFor(project)

  useEffect(() => {
    _galleryCount++
    return () => {
      _galleryCount--
    }
  }, [])

  // Shared-element morph: animate REAL top/left/width/height/borderRadius from the
  // origin circle to the first card. object-cover re-crops each frame so the image
  // never distorts (unlike a transform-scale / framer-layoutId morph).
  useLayoutEffect(() => {
    const m = morphRef.current
    const card = firstCardRef.current
    if (!m || !card) return
    if (!originRect) {
      gsap.set(card, { opacity: 1 })
      gsap.set(m, { opacity: 0 })
      return
    }
    const c = card.getBoundingClientRect()
    gsap.set(card, { opacity: 0 })
    gsap.set(m, {
      opacity: 1,
      position: 'fixed',
      top: originRect.top,
      left: originRect.left,
      width: originRect.width,
      height: originRect.height,
      borderRadius: 9999,
    })
    gsap.to(m, {
      top: c.top,
      left: c.left,
      width: c.width,
      height: c.height,
      borderRadius: 16,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.to(card, { opacity: 1, duration: 0.18 })
        gsap.to(m, { opacity: 0, duration: 0.18 })
      },
    })
  }, [originRect])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-g="backdrop"]', { autoAlpha: 0, duration: 0.35 })
      // fade only (no y) so the first card stays put for the morph to target
      gsap.from('[data-g="panel"]', { autoAlpha: 0, duration: 0.5, ease: 'power3.out' })
      gsap.from('[data-g="card-rest"]', { autoAlpha: 0, y: 42, duration: 0.55, stagger: 0.08, delay: 0.4, ease: 'power3.out' })
    }, root)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      ctx.revert()
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const stopWheel = (e: React.WheelEvent) => e.stopPropagation()

  return (
    <div
      ref={root}
      className="fixed inset-0 z-50 text-[var(--paper-text)]"
      onWheel={stopWheel}
      onWheelCapture={stopWheel}
    >
      <div data-g="backdrop" onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-2xl" />
      <div data-g="panel" className="absolute inset-0 flex flex-col gap-8 overflow-hidden p-8 md:flex-row md:p-16">
        <div className="shrink-0 md:w-1/3">
          <button onClick={onClose} aria-label="close gallery" className="ui-label mb-10 opacity-70 transition-opacity hover:opacity-100">✕ CLOSE</button>
          <h2 className="display-italic text-4xl font-medium leading-[0.95] md:text-6xl">{t(project.title)}</h2>
          <p className="ui-label mt-4 opacity-70">{t(project.role)} / {project.year}</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed opacity-80">{t(project.desc)}</p>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
          {imgs[0] && (
            <div ref={firstCardRef} className="aspect-video w-full overflow-hidden border border-white/15 shadow-2xl" style={{ borderRadius: 16 }}>
              <img src={imgs[0]} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          {imgs.slice(1).map((src, i) => (
            <div key={i + 1} data-g="card-rest" className="aspect-video w-full overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {/* Morph element — fixed, object-cover, invisible unless an originRect drives it.
          Uses the project cover (same image as the circle) so the shape morph is seamless. */}
      <div ref={morphRef} className="pointer-events-none fixed overflow-hidden" style={{ zIndex: 60, opacity: 0 }}>
        <img src={project.cover} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  )
}
