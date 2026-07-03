'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './ScrollingCircles.module.css'
import type { Project } from '@/content/projects'
import { useLang } from '@/lib/i18n'
import { useIsoLayoutEffect } from '@/lib/useIsoLayoutEffect'
import { useIsMobile } from '@/lib/useIsMobile'
import { sfxHover } from '@/lib/sound'

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const FRICTION         = 0.94
const SETTLE_THRESHOLD = 0.01
const INTRO_VELOCITY   = 90

const mod = (n: number, m: number) => ((n % m) + m) % m
function wrap(v: number, H: number): number {
  return mod(v, H) - H / 2
}

interface Props {
  projects:    Project[]
  onCircleClick: (p: Project) => void
  onFocal?:    (p: Project) => void
  paused?:     boolean
}

// ---------------------------------------------------------------------------
// ScrollingCircles — dual HORIZONTAL rings on every viewport.
//
// Each project is one circle (cover image + name overlay). Even-index projects
// ride the top row, odd-index the bottom; the rows scroll in opposite
// directions. Each row's sequence is duplicated enough times that the looping
// band is always wider than the viewport — the belt reaches past both screen
// edges and reads as an endless conveyor.
//
// Positions are written straight to the DOM each rAF; React never re-renders
// while you scroll.
// ---------------------------------------------------------------------------
export function ScrollingCircles({ projects, onCircleClick, onFocal, paused }: Props) {
  const { t } = useLang()
  const isMobile = useIsMobile()

  const N = projects.length

  // Geometry (mobile / desktop)
  const SIZE = isMobile ? 150 : 250
  const ROW  = isMobile ? 92 : 150   // row y-offset from centre
  const STEP = isMobile ? 162 : 290  // horizontal spacing (≥ SIZE so rows never self-overlap)
  const UP   = Math.ceil(N / 2)      // top-row project count
  const DOWN = Math.floor(N / 2)     // bottom-row project count

  // How many times each row repeats its sequence so the belt overflows the
  // viewport on both sides (min 2 so wrap-around is always seamless).
  const [vw, setVw] = useState(1920)
  useEffect(() => {
    const update = () => setVw(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const copiesFor = (rowCount: number) =>
    Math.max(2, Math.ceil((vw + STEP * 2) / Math.max(1, rowCount * STEP)))
  const copiesTop = copiesFor(UP)
  const copiesBot = copiesFor(DOWN)

  // Flat render list: every (project, copy) pair.
  const items: { i: number; c: number }[] = []
  for (let i = 0; i < N; i++) {
    const copies = i % 2 === 0 ? copiesTop : copiesBot
    for (let c = 0; c < copies; c++) items.push({ i, c })
  }

  // Continuous scroll position + velocity
  const sRef   = useRef(0)
  const velRef = useRef(0)
  const touchStartRef = useRef(0)
  const focalRef = useRef(-1)

  const imgRefs = useRef<(HTMLButtonElement | null)[]>([])

  const pausedRef   = useRef(paused ?? false)
  const onFocalRef  = useRef(onFocal)
  const projectsRef = useRef(projects)
  useEffect(() => { pausedRef.current   = paused ?? false }, [paused])
  useEffect(() => { onFocalRef.current  = onFocal },         [onFocal])
  useEffect(() => { projectsRef.current = projects },        [projects])

  const place = (i: number, c: number, s: number) => {
    const row      = i % 2                    // 0 top, 1 bottom
    const rowIndex = Math.floor(i / 2)
    const rowCount = row === 0 ? UP : DOWN
    const copies   = row === 0 ? copiesTop : copiesBot
    const dir      = row === 0 ? -1 : 1       // rows scroll in opposite directions
    const loopW    = rowCount * copies * STEP
    const x = wrap((rowIndex + c * rowCount + dir * s) * STEP, loopW)
    const y = row === 0 ? -ROW : ROW
    const d = Math.abs(x)
    const fs = 1 + Math.max(0, 1 - d / (STEP * 1.6)) * 0.1
    const fo = 0.45 + Math.max(0, 1 - d / (STEP * 2)) * 0.55
    return { x, y, d, fs, fo }
  }

  useIsoLayoutEffect(() => {
    const apply = () => {
      const s = sRef.current
      let minD = Infinity, focalI = 0
      for (let k = 0; k < items.length; k++) {
        const { i, c } = items[k]
        const { x, y, d, fs, fo } = place(i, c, s)
        if (d < minD) { minD = d; focalI = i }
        const im = imgRefs.current[k]
        if (im) {
          im.style.transform = `translate3d(-50%,-50%,0) translate3d(${x}px,${y}px,0) scale(${fs})`
          im.style.opacity = String(fo)
        }
      }
      if (focalI !== focalRef.current) {
        focalRef.current = focalI
        onFocalRef.current?.(projectsRef.current[focalI])
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return
      velRef.current += e.deltaY * 0.09
    }
    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientX
    }
    const onTouchMove = (e: TouchEvent) => {
      if (pausedRef.current) return
      const pos = e.touches[0].clientX
      const delta = touchStartRef.current - pos
      touchStartRef.current = pos
      velRef.current += delta * 0.14
    }

    window.addEventListener('wheel',      onWheel,      { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })

    let rafId: number
    const animate = () => {
      velRef.current *= FRICTION
      if (Math.abs(velRef.current) < SETTLE_THRESHOLD) velRef.current = 0
      sRef.current += velRef.current / STEP
      apply()
      rafId = requestAnimationFrame(animate)
    }

    sRef.current = -(INTRO_VELOCITY * FRICTION) / (STEP * (1 - FRICTION))
    velRef.current = INTRO_VELOCITY
    apply()
    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N, isMobile, copiesTop, copiesBot])

  const s = sRef.current
  const sizeStyle = { width: SIZE, height: SIZE }

  return (
    <div className={styles.stage} aria-label="Projects gallery">
      {items.map(({ i, c }, k) => {
        const project   = projects[i]
        const no        = `N.${String(i + 1).padStart(2, '0')}`
        const year      = `Y.${project.year}`
        const titleText = t(project.title)
        const { x, y, fs, fo } = place(i, c, s)
        return (
          <button
            key={`${project.slug}-${c}`}
            ref={(el) => { imgRefs.current[k] = el }}
            className={`${styles.circle} ${styles.imgCircle}`}
            style={{ ...sizeStyle, transform: `translate3d(-50%,-50%,0) translate3d(${x}px,${y}px,0) scale(${fs})`, opacity: fo, willChange: 'transform, opacity' }}
            onClick={() => onCircleClick(project)}
            onMouseEnter={sfxHover}
            aria-label={titleText}
            aria-hidden={c > 0 || undefined}
            tabIndex={c > 0 ? -1 : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.cover} alt={c === 0 ? titleText : ''} style={project.type === 'dev' ? { objectPosition: 'top' } : undefined} />
            <span className={styles.mobileLabel}>
              <span className={styles.mlNo}>{no}</span>
              <span className={styles.mlTitle}>{titleText}</span>
              <span className={styles.mlYear}>{year}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
