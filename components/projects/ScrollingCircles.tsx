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

const FRICTION         = 0.92
const SETTLE_THRESHOLD = 0.01

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
      velRef.current += e.deltaY * 0.12
    }
    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      if (pausedRef.current) return
      const delta = touchStartRef.current - e.touches[0].clientY
      touchStartRef.current = e.touches[0].clientY
      velRef.current += delta * 0.24
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

        // 2 dots at 9 o'clock (π) and 3 o'clock (0) on a ring of r=48
        const ringDots = [
          { cx: 50 + 48 * Math.cos(Math.PI),  cy: 50 },  // left  (9 o'clock)
          { cx: 50 + 48 * Math.cos(0),          cy: 50 },  // right (3 o'clock)
        ]

        return [
          // ── Left: name circle (wrapped to enable ring hover) ───────────────
          <div
            key={`name-${project.slug}`}
            className={styles.textCircleGroup}
            style={{
              transform: `translate(-50%, -50%) translate(${-TRACK}px, ${yName}px) scale(${focusScaleName})`,
              opacity: focusOpacName,
              pointerEvents: 'auto',
            }}
          >
            {/* Inner disc + text — scales down on hover (⑥) */}
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

            {/* Decorative spinning ring — pointer-events:none, sits over the circle (⑦ half-turn) */}
            <svg
              viewBox="0 0 100 100"
              className={styles.ringDeco}
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '-7px',           /* (224-210)/2 = 7 px extra on each side */
                width: 'calc(100% + 14px)',
                height: 'calc(100% + 14px)',
              }}
            >
              <circle cx={50} cy={50} r={48} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={0.4} />
              {ringDots.map((d, k) => (
                <circle key={k} cx={d.cx} cy={d.cy} r={0.8} fill="currentColor" fillOpacity={0.35} />
              ))}
            </svg>
          </div>,

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
