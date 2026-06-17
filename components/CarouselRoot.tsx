'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Project } from '@/content/projects'
import { nextIndex, prevIndex } from '@/lib/carousel'
import { Slide } from './Slide'
import { ProjectCounter } from './ProjectCounter'

export function CarouselRoot({ projects }: { projects: Project[] }) {
  const [index, setIndex] = useState(0)
  const lock = useRef(false)
  const dragX = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => (dir === 1 ? nextIndex(i, projects.length) : prevIndex(i, projects.length)))
  }, [projects.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    const onWheel = (e: WheelEvent) => {
      if (lock.current) return
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(d) < 12) return
      lock.current = true
      go(d > 0 ? 1 : -1)
      setTimeout(() => { lock.current = false }, 700)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('wheel', onWheel) }
  }, [go])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const section = sectionRef.current
      if (!section) return
      section.style.setProperty('--mx', String(e.clientX / window.innerWidth))
      section.style.setProperty('--my', String(e.clientY / window.innerHeight))
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => { dragX.current = e.clientX }
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragX.current === null) return
    const dx = e.clientX - dragX.current
    dragX.current = null
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  }

  const current = projects[index]
  return (
    <section ref={sectionRef} aria-roledescription="carousel" className="relative h-screen w-screen touch-pan-y overflow-hidden"
      style={{ '--accent': current.accent ?? '#2b2b30', '--mx': '0.5', '--my': '0.5' } as React.CSSProperties}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <Slide key={current.slug} project={current} />
      <ProjectCounter index={index} total={projects.length}
        onPrev={() => go(-1)} onNext={() => go(1)} />
    </section>
  )
}
