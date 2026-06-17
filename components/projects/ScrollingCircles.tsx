'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './ScrollingCircles.module.css'
import type { Project } from '@/content/projects'
import { useLang } from '@/lib/i18n'

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const SIZE  = 210   // circle diameter px
const GAP   = 56    // vertical gap between circles
const TRACK = 190   // horizontal offset from viewport centre to each track centre

const FRICTION         = 0.6
const SETTLE_THRESHOLD = 0.05

// mod that always returns positive result
const mod = (n: number, m: number) => ((n % m) + m) % m

// Wrap v into the range [-H/2, H/2)
// This centres the ring on y=0 so circles above and below viewport centre are symmetric.
function wrap(v: number, H: number): number {
  return mod(v, H) - H / 2
}

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
// ---------------------------------------------------------------------------
export function ScrollingCircles({ projects, onCircleClick, onFocal, paused }: Props) {
  const { t } = useLang()

  const N    = projects.length
  const STEP = SIZE + GAP
  const H    = N * STEP

  // Shared continuous scroll position in project-units (float)
  const sRef   = useRef(0)
  const velRef = useRef(0)

  const touchStartRef = useRef(0)

  // Trigger re-render each rAF; keeps read of sRef/velRef consistent
  const [tick, setTick] = useState(0)

  // Track focal index to fire onFocal only on change
  const focalRef = useRef(-1)

  // Paused ref to avoid stale closure inside rAF
  const pausedRef = useRef(paused ?? false)
  useEffect(() => { pausedRef.current = paused ?? false }, [paused])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return
      velRef.current += e.deltaY * 0.5
    }
    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (pausedRef.current) return
      const delta = touchStartRef.current - e.touches[0].clientY
      touchStartRef.current = e.touches[0].clientY
      velRef.current += delta * 1
    }

    window.addEventListener('wheel',      onWheel,      { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })

    let rafId: number
    const animate = () => {
      velRef.current *= FRICTION
      if (Math.abs(velRef.current) < SETTLE_THRESHOLD) velRef.current = 0

      sRef.current += velRef.current / STEP

      // Compute focal index and fire callback when it changes
      const focal = ((Math.round(sRef.current) % N) + N) % N
      if (focal !== focalRef.current) {
        focalRef.current = focal
        onFocal?.(projects[focal])
      }

      setTick(t => t + 1)
      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]) // re-init only if number of projects changes

  const s = sRef.current

  return (
    <div className={styles.stage} aria-label="Projects gallery">
      {projects.map((project, i) => {
        // Left column: name circles
        // y approaches 0 when s ≈ i; moves UP as s increases
        const yName = wrap((i - s) * STEP, H)

        // Right column: image circles
        // y approaches 0 when s ≈ i; moves DOWN as s increases (opposite)
        const yImg  = wrap((s - i) * STEP, H)

        // "In focus" emphasis: distance from centre
        const distName = Math.abs(yName)
        const distImg  = Math.abs(yImg)
        const focusScaleName = 1 + Math.max(0, 1 - distName / (STEP * 1.5)) * 0.06
        const focusScaleImg  = 1 + Math.max(0, 1 - distImg  / (STEP * 1.5)) * 0.06
        const focusOpacName  = 0.55 + Math.max(0, 1 - distName / (STEP * 2)) * 0.45
        const focusOpacImg   = 0.55 + Math.max(0, 1 - distImg  / (STEP * 2)) * 0.45

        const no        = `N.${String(i + 1).padStart(2, '0')}`
        const year      = `Y.${project.year}`
        const titleText = t(project.title)

        return [
          // ── Left: name circle ──────────────────────────────────────────────
          <button
            key={`name-${project.slug}`}
            className={`${styles.circle} ${styles.textCircle}`}
            style={{
              transform: `translate(-50%, -50%) translate(${-TRACK}px, ${yName}px) scale(${focusScaleName})`,
              opacity: focusOpacName,
            }}
            onClick={() => onCircleClick(project)}
            aria-label={titleText}
          >
            <span className={styles.textNo}>{no}</span>
            <span className={styles.textTitle}>{titleText}</span>
            <span className={styles.textYear}>{year}</span>
          </button>,

          // ── Right: image circle ────────────────────────────────────────────
          <button
            key={`img-${project.slug}`}
            className={`${styles.circle} ${styles.imgCircle}`}
            style={{
              transform: `translate(-50%, -50%) translate(${TRACK}px, ${yImg}px) scale(${focusScaleImg})`,
              opacity: focusOpacImg,
            }}
            onClick={() => onCircleClick(project)}
            aria-label={titleText}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.cover} alt={titleText} />
          </button>,
        ]
      })}
    </div>
  )
}
