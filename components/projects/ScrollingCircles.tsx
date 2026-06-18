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
const INTRO_VELOCITY   = 90   // entry kick: fast-scrolls on mount, then friction eases it to rest

// mod that always returns positive result
const mod = (n: number, m: number) => ((n % m) + m) % m

// Wrap v into [-H/2, H/2) — centres the ring on y=0 so circles above and below
// viewport centre are symmetric (the off-screen wrap happens far past the edges).
function wrap(v: number, H: number): number {
  return mod(v, H) - H / 2
}

// 2 dots at 9 o'clock (π) and 3 o'clock (0) on a ring of r=48 — identical per circle.
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
  /** Called whenever the focal (closest-to-centre) project changes */
  onFocal?:    (p: Project) => void
  /** When true, wheel/touch velocity intake is suspended (gallery open) */
  paused?:     boolean
}

// ---------------------------------------------------------------------------
// ScrollingCircles
//
// Desktop: dual-track (name circles left, image circles right, opposite scroll).
// Mobile : single centred column of image circles (TRACK=0) with the name
//          overlaid on each — the dual track is far too wide for a phone.
//
// Scroll position lives in refs and is written STRAIGHT to the DOM each rAF —
// the loop never calls setState, so React never re-renders while you scroll.
// ---------------------------------------------------------------------------
export function ScrollingCircles({ projects, onCircleClick, onFocal, paused }: Props) {
  const { t } = useLang()
  const isMobile = useIsMobile()

  // Desktop = dual vertical tracks. Mobile = two horizontal rows of image circles,
  // brick-offset, scrolled sideways (like the reference site's phone layout).
  const SIZE  = isMobile ? 150 : 210
  const TRACK = isMobile ? 0   : 150   // desktop: column x-offset
  const ROW   = 84                     // mobile: row y-offset (±ROW = two rows)
  const STEP  = isMobile ? 92  : (210 + 56)  // mobile: horizontal spacing; desktop: SIZE+GAP

  const N    = projects.length
  const H    = N * STEP

  // Continuous scroll position (project-units, float) + velocity
  const sRef   = useRef(0)
  const velRef = useRef(0)
  const touchStartRef = useRef(0)
  const focalRef = useRef(-1)

  // Per-circle DOM handles for imperative transform/opacity writes
  const groupRefs = useRef<(HTMLDivElement | null)[]>([])
  const imgRefs   = useRef<(HTMLButtonElement | null)[]>([])

  // Keep latest props in refs so the loop never reads a stale closure
  const pausedRef   = useRef(paused ?? false)
  const onFocalRef  = useRef(onFocal)
  const projectsRef = useRef(projects)
  useEffect(() => { pausedRef.current   = paused ?? false }, [paused])
  useEffect(() => { onFocalRef.current  = onFocal },         [onFocal])
  useEffect(() => { projectsRef.current = projects },        [projects])

  useIsoLayoutEffect(() => {
    // Write every circle's position for the current sRef — directly to the DOM.
    const apply = () => {
      const s = sRef.current
      for (let i = 0; i < N; i++) {
        if (isMobile) {
          // two horizontal rows, brick-offset (even row up, odd row down), scrolled sideways
          const x = wrap((i - s) * STEP, H)
          const y = i % 2 === 0 ? -ROW : ROW
          const d = Math.abs(x)
          const fs = 1 + Math.max(0, 1 - d / (STEP * 2)) * 0.12
          const fo = 0.4 + Math.max(0, 1 - d / (STEP * 2.4)) * 0.6
          const im = imgRefs.current[i]
          if (im) {
            im.style.transform = `translate3d(-50%,-50%,0) translate3d(${x}px,${y}px,0) scale(${fs})`
            im.style.opacity = String(fo)
          }
          continue
        }
        const yName = wrap((i - s) * STEP, H)   // left col rises as s grows
        const yImg  = wrap((s - i) * STEP, H)   // right col falls (opposite)
        const distName = Math.abs(yName)
        const distImg  = Math.abs(yImg)
        const fsName = 1 + Math.max(0, 1 - distName / (STEP * 1.5)) * 0.06
        const fsImg  = 1 + Math.max(0, 1 - distImg  / (STEP * 1.5)) * 0.06
        const foName = 0.55 + Math.max(0, 1 - distName / (STEP * 2)) * 0.45
        const foImg  = 0.55 + Math.max(0, 1 - distImg  / (STEP * 2)) * 0.45

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
      velRef.current += delta * 0.18
    }

    window.addEventListener('wheel',      onWheel,      { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })

    let rafId: number
    const animate = () => {
      velRef.current *= FRICTION
      if (Math.abs(velRef.current) < SETTLE_THRESHOLD) velRef.current = 0
      sRef.current += velRef.current / STEP

      const focal = mod(Math.round(sRef.current), N)
      if (focal !== focalRef.current) {
        focalRef.current = focal
        onFocalRef.current?.(projectsRef.current[focal])
      }

      apply()
      rafId = requestAnimationFrame(animate)
    }

    // Intro: start a few projects "behind" the head and fast-scroll forward, so the ring
    // eases to rest roughly on the first project instead of a random midpoint.
    sRef.current = -(INTRO_VELOCITY * FRICTION) / (STEP * (1 - FRICTION))
    velRef.current = INTRO_VELOCITY
    apply()                       // place circles before first paint (no flash-in)
    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N, isMobile]) // re-init when project count or layout (mobile/desktop) changes

  // Snapshot the live scroll position for SSR / re-render.
  const s = sRef.current
  const sizeStyle = { width: SIZE, height: SIZE }

  return (
    <div className={styles.stage} aria-label="Projects gallery">
      {projects.map((project, i) => {
        const yName = wrap((i - s) * STEP, H)
        const yImg  = wrap((s - i) * STEP, H)
        const distName = Math.abs(yName)
        const distImg  = Math.abs(yImg)
        const fsName = 1 + Math.max(0, 1 - distName / (STEP * 1.5)) * 0.06
        const fsImg  = 1 + Math.max(0, 1 - distImg  / (STEP * 1.5)) * 0.06
        const foName = 0.55 + Math.max(0, 1 - distName / (STEP * 2)) * 0.45
        const foImg  = 0.55 + Math.max(0, 1 - distImg  / (STEP * 2)) * 0.45

        const no        = `N.${String(i + 1).padStart(2, '0')}`
        const year      = `Y.${project.year}`
        const titleText = t(project.title)

        // ── Mobile: two brick-offset rows, scrolled horizontally ────────────
        if (isMobile) {
          const x = wrap((i - s) * STEP, H)
          const y = i % 2 === 0 ? -ROW : ROW
          const d = Math.abs(x)
          const fs = 1 + Math.max(0, 1 - d / (STEP * 2)) * 0.12
          const fo = 0.4 + Math.max(0, 1 - d / (STEP * 2.4)) * 0.6
          return (
            <button
              key={`img-${project.slug}`}
              ref={(el) => { imgRefs.current[i] = el }}
              className={`${styles.circle} ${styles.imgCircle}`}
              style={{
                ...sizeStyle,
                transform: `translate3d(-50%,-50%,0) translate3d(${x}px,${y}px,0) scale(${fs})`,
                opacity: fo,
                willChange: 'transform, opacity',
              }}
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

        // ── Desktop: dual-track (name circle left, image circle right) ──────
        return [
          <div
            key={`name-${project.slug}`}
            ref={(el) => { groupRefs.current[i] = el }}
            className={styles.textCircleGroup}
            style={{
              ...sizeStyle,
              transform: `translate3d(-50%,-50%,0) translate3d(${-TRACK}px,${yName}px,0) scale(${fsName})`,
              opacity: foName,
              pointerEvents: 'auto',
              willChange: 'transform, opacity',
            }}
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
            style={{
              ...sizeStyle,
              transform: `translate3d(-50%,-50%,0) translate3d(${TRACK}px,${yImg}px,0) scale(${fsImg})`,
              opacity: foImg,
              willChange: 'transform, opacity',
            }}
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
