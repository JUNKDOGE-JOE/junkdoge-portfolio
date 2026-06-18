'use client'
import { useEffect, useRef } from 'react'
import styles from './ScrollingCircles.module.css'
import type { Project } from '@/content/projects'
import { useLang } from '@/lib/i18n'
import { useIsoLayoutEffect } from '@/lib/useIsoLayoutEffect'
import { useIsMobile } from '@/lib/useIsMobile'

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

const RING_DOTS = [
  { cx: 50 + 48 * Math.cos(Math.PI), cy: 50 },
  { cx: 50 + 48 * Math.cos(0),       cy: 50 },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  projects:    Project[]
  onCircleClick: (p: Project) => void
  onFocal?:    (p: Project) => void
  paused?:     boolean
}

// ---------------------------------------------------------------------------
// ScrollingCircles
//
// Desktop: dual VERTICAL tracks (name circles left, image circles right).
// Mobile : each project is ONE circle (image + name overlaid). The circles are
//          split across TWO INDEPENDENT horizontal rings — even-index projects
//          on the top row, odd-index on the bottom — each cycling on its own.
//          Because the rows are separate loops (5 and 4 circles), there is no
//          shared "last↔first" seam: every row is evenly spaced, end to end.
//
// Positions are written straight to the DOM each rAF; React never re-renders
// while you scroll.
// ---------------------------------------------------------------------------
export function ScrollingCircles({ projects, onCircleClick, onFocal, paused }: Props) {
  const { t } = useLang()
  const isMobile = useIsMobile()

  const N = projects.length

  // Geometry
  const SIZE     = isMobile ? 150 : 210
  const TRACK    = 150               // desktop column x-offset
  const ROW      = 92                // mobile row y-offset (top −ROW, bottom +ROW)
  const STEP_D   = 210 + 56          // desktop vertical step (one project)
  const STEP_M   = 162               // mobile horizontal spacing (≥ SIZE so a row never self-overlaps)
  const H_D      = N * STEP_D
  const STEP_EFF = isMobile ? STEP_M : STEP_D   // scroll → position units
  const UP       = Math.ceil(N / 2)             // top-row circle count
  const DOWN     = Math.floor(N / 2)            // bottom-row circle count

  // Continuous scroll position + velocity
  const sRef   = useRef(0)
  const velRef = useRef(0)
  const touchStartRef = useRef(0)
  const focalRef = useRef(-1)

  const groupRefs = useRef<(HTMLDivElement | null)[]>([])
  const imgRefs   = useRef<(HTMLButtonElement | null)[]>([])

  const pausedRef   = useRef(paused ?? false)
  const onFocalRef  = useRef(onFocal)
  const projectsRef = useRef(projects)
  useEffect(() => { pausedRef.current   = paused ?? false }, [paused])
  useEffect(() => { onFocalRef.current  = onFocal },         [onFocal])
  useEffect(() => { projectsRef.current = projects },        [projects])

  useIsoLayoutEffect(() => {
    const apply = () => {
      const s = sRef.current

      if (isMobile) {
        let minD = Infinity, focalI = 0
        for (let i = 0; i < N; i++) {
          const row      = i % 2                       // 0 top, 1 bottom
          const rowIndex = Math.floor(i / 2)           // position within its row
          const rowCount = row === 0 ? UP : DOWN
          const dir      = row === 0 ? -1 : 1           // rows scroll in opposite directions
          const x = wrap((rowIndex + dir * s) * STEP_M, rowCount * STEP_M)
          const y = row === 0 ? -ROW : ROW
          const d = Math.abs(x)
          if (d < minD) { minD = d; focalI = i }
          const fs = 1 + Math.max(0, 1 - d / (STEP_M * 1.6)) * 0.1
          const fo = 0.45 + Math.max(0, 1 - d / (STEP_M * 2)) * 0.55
          const im = imgRefs.current[i]
          if (im) {
            im.style.transform = `translate3d(-50%,-50%,0) translate3d(${x}px,${y}px,0) scale(${fs})`
            im.style.opacity = String(fo)
          }
        }
        if (focalI !== focalRef.current) {
          focalRef.current = focalI
          onFocalRef.current?.(projectsRef.current[focalI])
        }
        return
      }

      // desktop dual-track
      for (let i = 0; i < N; i++) {
        const yName = wrap((i - s) * STEP_D, H_D)
        const yImg  = wrap((s - i) * STEP_D, H_D)
        const distName = Math.abs(yName)
        const distImg  = Math.abs(yImg)
        const fsName = 1 + Math.max(0, 1 - distName / (STEP_D * 1.5)) * 0.06
        const fsImg  = 1 + Math.max(0, 1 - distImg  / (STEP_D * 1.5)) * 0.06
        const foName = 0.55 + Math.max(0, 1 - distName / (STEP_D * 2)) * 0.45
        const foImg  = 0.55 + Math.max(0, 1 - distImg  / (STEP_D * 2)) * 0.45
        const g = groupRefs.current[i]
        if (g) {
          g.style.transform = `translate3d(-50%,-50%,0) translate3d(${-TRACK}px,${yName}px,0) scale(${fsName})`
          g.style.opacity = String(foName)
        }
        const im = imgRefs.current[i]
        if (im) {
          im.style.transform = `translate3d(-50%,-50%,0) translate3d(${TRACK}px,${yImg}px,0) scale(${fsImg})`
          im.style.opacity = String(foImg)
        }
      }
      const focal = mod(Math.round(s), N)
      if (focal !== focalRef.current) {
        focalRef.current = focal
        onFocalRef.current?.(projectsRef.current[focal])
      }
    }

    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return
      velRef.current += e.deltaY * 0.09
    }
    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = isMobile ? e.touches[0].clientX : e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (pausedRef.current) return
      const pos = isMobile ? e.touches[0].clientX : e.touches[0].clientY
      const delta = touchStartRef.current - pos
      touchStartRef.current = pos
      velRef.current += delta * (isMobile ? 0.14 : 0.18)
    }

    window.addEventListener('wheel',      onWheel,      { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })

    let rafId: number
    const animate = () => {
      velRef.current *= FRICTION
      if (Math.abs(velRef.current) < SETTLE_THRESHOLD) velRef.current = 0
      sRef.current += velRef.current / STEP_EFF
      apply()
      rafId = requestAnimationFrame(animate)
    }

    sRef.current = -(INTRO_VELOCITY * FRICTION) / (STEP_EFF * (1 - FRICTION))
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
  }, [N, isMobile])

  const s = sRef.current
  const sizeStyle = { width: SIZE, height: SIZE }

  return (
    <div className={styles.stage} aria-label="Projects gallery">
      {projects.map((project, i) => {
        const no        = `N.${String(i + 1).padStart(2, '0')}`
        const year      = `Y.${project.year}`
        const titleText = t(project.title)

        // ── Mobile: one circle (image + overlaid name), placed on its row's ring ──
        if (isMobile) {
          const row      = i % 2
          const rowIndex = Math.floor(i / 2)
          const rowCount = row === 0 ? UP : DOWN
          const dir      = row === 0 ? -1 : 1           // rows scroll in opposite directions
          const x = wrap((rowIndex + dir * s) * STEP_M, rowCount * STEP_M)
          const y = row === 0 ? -ROW : ROW
          const d = Math.abs(x)
          const fs = 1 + Math.max(0, 1 - d / (STEP_M * 1.6)) * 0.1
          const fo = 0.45 + Math.max(0, 1 - d / (STEP_M * 2)) * 0.55
          return (
            <button
              key={`img-${project.slug}`}
              ref={(el) => { imgRefs.current[i] = el }}
              className={`${styles.circle} ${styles.imgCircle}`}
              style={{ ...sizeStyle, transform: `translate3d(-50%,-50%,0) translate3d(${x}px,${y}px,0) scale(${fs})`, opacity: fo, willChange: 'transform, opacity' }}
              onClick={() => onCircleClick(project)}
              aria-label={titleText}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.cover} alt={titleText} style={project.type === 'dev' ? { objectPosition: 'top' } : undefined} />
              <span className={styles.mobileLabel}>
                <span className={styles.mlNo}>{no}</span>
                <span className={styles.mlTitle}>{titleText}</span>
                <span className={styles.mlYear}>{year}</span>
              </span>
            </button>
          )
        }

        // ── Desktop: name circle (left) + image circle (right) ──
        const yName = wrap((i - s) * STEP_D, H_D)
        const yImg  = wrap((s - i) * STEP_D, H_D)
        const distName = Math.abs(yName)
        const distImg  = Math.abs(yImg)
        const fsName = 1 + Math.max(0, 1 - distName / (STEP_D * 1.5)) * 0.06
        const fsImg  = 1 + Math.max(0, 1 - distImg  / (STEP_D * 1.5)) * 0.06
        const foName = 0.55 + Math.max(0, 1 - distName / (STEP_D * 2)) * 0.45
        const foImg  = 0.55 + Math.max(0, 1 - distImg  / (STEP_D * 2)) * 0.45

        return [
          <div
            key={`name-${project.slug}`}
            ref={(el) => { groupRefs.current[i] = el }}
            className={styles.textCircleGroup}
            style={{ ...sizeStyle, transform: `translate3d(-50%,-50%,0) translate3d(${-TRACK}px,${yName}px,0) scale(${fsName})`, opacity: foName, pointerEvents: 'auto', willChange: 'transform, opacity' }}
          >
            <div className={styles.innerDisc}>
              <button
                className={`${styles.circle} ${styles.textCircle}`}
                style={{ position: 'absolute', inset: 0, transform: 'none' }}
                onClick={() => onCircleClick(project)}
                aria-label={titleText}
              >
                <span className={styles.textNo}>{no}</span>
                <span className={styles.textTitle}>{titleText}</span>
                <span className={styles.textYear}>{year}</span>
              </button>
            </div>
            <svg
              viewBox="0 0 100 100"
              className={styles.ringDeco}
              aria-hidden="true"
              style={{ position: 'absolute', inset: '-7px', width: 'calc(100% + 14px)', height: 'calc(100% + 14px)' }}
            >
              <circle cx={50} cy={50} r={48} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={0.4} />
              {RING_DOTS.map((d, k) => (
                <circle key={k} cx={d.cx} cy={d.cy} r={0.8} fill="currentColor" fillOpacity={0.35} />
              ))}
            </svg>
          </div>,

          <button
            key={`img-${project.slug}`}
            ref={(el) => { imgRefs.current[i] = el }}
            className={`${styles.circle} ${styles.imgCircle}`}
            style={{ ...sizeStyle, transform: `translate3d(-50%,-50%,0) translate3d(${TRACK}px,${yImg}px,0) scale(${fsImg})`, opacity: foImg, willChange: 'transform, opacity' }}
            onClick={() => onCircleClick(project)}
            aria-label={titleText}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.cover} alt={titleText} style={project.type === 'dev' ? { objectPosition: 'top' } : undefined} />
          </button>,
        ]
      })}
    </div>
  )
}
