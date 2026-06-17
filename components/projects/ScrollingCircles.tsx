'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './ScrollingCircles.module.css'
import type { Project } from '@/content/projects'
import { useLang } from '@/lib/i18n'

// ---------------------------------------------------------------------------
// CONFIG — matches the BerlinBackground reference (size/gap/trackOffset)
// ---------------------------------------------------------------------------
const CONFIG = {
  size: 210,          // circle diameter px
  gap: 40,            // vertical gap between circles px
  trackOffset: 155,   // horizontal distance from centre to each track's centre px
  friction: 0.6,      // velocity multiplier per rAF frame (identical to reference)
  settleThreshold: 0.05,
}

// mod that always returns a positive result (handles negative wrap)
const mod = (n: number, m: number) => ((n % m) + m) % m

// ---------------------------------------------------------------------------
// Circle item shape
// ---------------------------------------------------------------------------
interface CircleItem {
  project: Project
  isText: boolean   // true = text circle, false = image circle
  /** Sequential index in the full circle list (for N.0X label) */
  listIndex: number
}

// ---------------------------------------------------------------------------
// ScrollingCircles
// ---------------------------------------------------------------------------
interface Props {
  projects: Project[]
  onCircleClick: (p: Project) => void
}

export function ScrollingCircles({ projects, onCircleClick }: Props) {
  const { t } = useLang()

  // Build the interleaved circle list:
  // For each project we create TWO circles (text + image).
  // We interleave them so tracks have mixed text/image, matching the reference
  // pattern: left track at even indices, right track at odd indices.
  // Within each project pair: first = text, second = image.
  const circles: CircleItem[] = []
  projects.forEach((project, pi) => {
    // text circle first, then image circle
    circles.push({ project, isText: true,  listIndex: pi })
    circles.push({ project, isText: false, listIndex: pi })
  })

  const N = circles.length // total circle count across both tracks

  // Split into left (even indices) and right (odd indices) tracks, matching
  // the reference's "isText = i % 2" stagger.
  const leftItems  = circles.filter((_, i) => i % 2 === 0)
  const rightItems = circles.filter((_, i) => i % 2 !== 0)

  const nLeft  = leftItems.length
  const nRight = rightItems.length

  // positions[i] is a fractional index in [0, N) that maps to a y-position.
  // Left and right tracks start offset by 0.5 so they don't align horizontally.
  const [leftPos,  setLeftPos]  = useState<number[]>(() => leftItems.map((_, i) => i))
  const [rightPos, setRightPos] = useState<number[]>(() => rightItems.map((_, i) => i + 0.5))

  const velocityRef    = useRef(0)
  const touchStartRef  = useRef(0)
  const rafRef         = useRef<number | null>(null)

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      velocityRef.current += e.deltaY * 0.5
    }
    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      const delta = touchStartRef.current - e.touches[0].clientY
      touchStartRef.current = e.touches[0].clientY
      velocityRef.current += delta * 1
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    const step = CONFIG.size + CONFIG.gap

    const animate = () => {
      // Apply friction identical to reference
      velocityRef.current *= CONFIG.friction

      // Settle threshold
      if (Math.abs(velocityRef.current) < CONFIG.settleThreshold) {
        velocityRef.current = 0
      }

      const vel = velocityRef.current

      setLeftPos(prev =>
        prev.map(pos => mod(pos + vel / step + nLeft, nLeft))
      )
      setRightPos(prev =>
        prev.map(pos => mod(pos - vel / step + nRight, nRight))
      )

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [nLeft, nRight])

  // Render a single circle
  const renderCircle = (
    item: CircleItem,
    track: 'left' | 'right',
    position: number,   // fractional index
    trackLen: number,
    key: string,
  ) => {
    const { project, isText, listIndex } = item
    const vel = velocityRef.current

    const step     = CONFIG.size + CONFIG.gap
    const totalH   = trackLen * step
    const baseY    = position * step
    const x        = track === 'left' ? -CONFIG.trackOffset : CONFIG.trackOffset
    const y        = baseY - totalH / 2

    // Velocity-driven tilt: nudge translateY and slight scale, same as reference
    const dy    = vel * 0.15
    const scale = 1 + Math.abs(vel) * 0.0008

    const circleStyle: React.CSSProperties = {
      width:  CONFIG.size,
      height: CONFIG.size,
      left:   `calc(50% + ${x}px - ${CONFIG.size / 2}px)`,
      top:    `calc(50% + ${y}px - ${CONFIG.size / 2}px)`,
      transform: `translateY(${dy}px) scale(${scale})`,
    }

    const no   = `N.${String(listIndex + 1).padStart(2, '0')}`
    const year = `Y.${project.year}`
    const titleText = t(project.title)

    if (isText) {
      return (
        <button
          key={key}
          className={`${styles.circle} ${styles.textCircle}`}
          style={circleStyle}
          onClick={() => onCircleClick(project)}
          aria-label={titleText}
        >
          <span className={styles.textNo}>{no}</span>
          <span className={styles.textTitle}>{titleText}</span>
          <span className={styles.textYear}>{year}</span>
        </button>
      )
    } else {
      return (
        <button
          key={key}
          className={`${styles.circle} ${styles.imgCircle}`}
          style={circleStyle}
          onClick={() => onCircleClick(project)}
          aria-label={titleText}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.cover} alt={titleText} />
        </button>
      )
    }
  }

  return (
    <div className={styles.stage} aria-label="Projects gallery">
      {leftItems.map((item, i) =>
        renderCircle(item, 'left', leftPos[i] ?? i, nLeft, `L-${i}-${item.project.slug}`)
      )}
      {rightItems.map((item, i) =>
        renderCircle(item, 'right', rightPos[i] ?? i, nRight, `R-${i}-${item.project.slug}`)
      )}
    </div>
  )
}
