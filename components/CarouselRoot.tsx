'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Project } from '@/content/projects'
import { nextIndex, prevIndex } from '@/lib/carousel'
import { galleryFor } from '@/lib/projects'
import { Slide } from './Slide'
import { MouseTrail } from './MouseTrail'
import { ProjectCounter } from './ProjectCounter'
import { useIsMobile } from '@/lib/useIsMobile'
import { isImageSkin } from '@/lib/projects'
import { SlideBackground } from './SlideBackground'
import { isGalleryOpen } from './Gallery'
import { sfxSlide } from '@/lib/sound'

export function CarouselRoot({ projects }: { projects: Project[] }) {
  const [index, setIndex] = useState(0)
  const current = projects[index]
  const isMobile = useIsMobile()
  const lock = useRef(false)
  const lastScroll = useRef(0)
  const accum = useRef(0)
  const dragX = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const go = useCallback((dir: 1 | -1) => {
    sfxSlide(dir)
    setIndex((i) => (dir === 1 ? nextIndex(i, projects.length) : prevIndex(i, projects.length)))
  }, [projects.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isGalleryOpen()) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    const onWheel = (e: WheelEvent) => {
      if (isGalleryOpen()) return
      const now = performance.now()
      if (lock.current || now - lastScroll.current < 500) return
      accum.current += e.deltaY
      if (accum.current > 100) {
        accum.current = 0
        lastScroll.current = now
        lock.current = true
        go(1)
        setTimeout(() => { lock.current = false }, 800)
      } else if (accum.current < -100) {
        accum.current = 0
        lastScroll.current = now
        lock.current = true
        go(-1)
        setTimeout(() => { lock.current = false }, 800)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('wheel', onWheel) }
  }, [go])

  useEffect(() => {
    if (isMobile) return // mobile drives --mx/--my via the gyroscope (written to <html>)
    const onMouseMove = (e: MouseEvent) => {
      const section = sectionRef.current
      if (!section) return
      section.style.setProperty('--mx', String(e.clientX / window.innerWidth))
      section.style.setProperty('--my', String(e.clientY / window.innerHeight))
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [isMobile])

  // Fixed UI (corner nav, counter) lives outside the slide's own colour scope —
  // publish the skin-appropriate ink so it stays legible on the light dev skin.
  useEffect(() => {
    const ink = isImageSkin(current) ? 'var(--paper-text)' : 'var(--ink)'
    document.documentElement.style.setProperty('--ui-ink', ink)
    return () => { document.documentElement.style.removeProperty('--ui-ink') }
  }, [current])

  const onPointerDown = (e: React.PointerEvent) => { dragX.current = e.clientX }
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragX.current === null) return
    const dx = e.clientX - dragX.current
    dragX.current = null
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  }

  const trailImgs = galleryFor(current).length ? galleryFor(current) : [current.cover]
  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      className="relative h-screen w-screen touch-pan-y overflow-hidden"
      style={{
        '--accent': current.accent ?? '#2b2b30',
        color: 'var(--ui-ink, var(--paper-text))',
        transition: 'color 0.6s ease',
        ...(isMobile ? {} : { '--mx': '0.5', '--my': '0.5' }),
      } as React.CSSProperties}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* Persistent background: crossfades between projects with overlapping opacity */}
      <SlideBackground project={current} />

      {/* Slide content: exit blur-fade out; enter is GSAP cascade (no framer enter anim) */}
      <AnimatePresence>
        <motion.div
          key={current.slug}
          initial={false}
          exit={{ opacity: 0, filter: 'blur(14px)' }}
          transition={{ duration: 0.55, ease: 'easeIn' }}
          className="absolute inset-0"
        >
          <Slide project={current} />
        </motion.div>
      </AnimatePresence>

      <ProjectCounter
        index={index}
        total={projects.length}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
      />
      {!isMobile && <MouseTrail images={trailImgs} />}

      {/* Mobile: swipe-to-switch hint (desktop has the wheel + "scroll" label) */}
      {isMobile && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <span
            className="rounded-full px-3 py-1 text-[0.55rem] tracking-[0.22em]"
            style={{ background: 'rgba(0,0,0,0.28)', color: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          >
            ← 滑动切换 →
          </span>
        </div>
      )}
    </section>
  )
}
