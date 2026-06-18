'use client'
import { useEffect, useRef } from 'react'
import styles from './MouseGradient.module.css'
import { useIsMobile } from '@/lib/useIsMobile'

/**
 * Fixed full-screen fluid-gradient backdrop for /projects.
 * - Base: warm #f1d7dd with 3 slow-drifting blob layers (blur 70px).
 * - Cursor bloom: large radial-gradient whose centre is driven by CSS vars
 *   --gx/--gy (in %). Updated each rAF via lerp(cur, target, 0.08).
 * - color: optional accent hex — blended via mix-blend-mode:color tint layer.
 *   As focal project changes, hue shifts smoothly (CSS transition 0.7s).
 */
interface Props {
  color?: string
}

export function MouseGradient({ color }: Props) {
  const isMobile = useIsMobile()
  const rootRef = useRef<HTMLDivElement>(null)
  // lerp state kept as plain refs — no re-renders needed
  const gxRef      = useRef(50)
  const gyRef      = useRef(50)
  const targetXRef = useRef(50)
  const targetYRef = useRef(50)
  const rafRef     = useRef<number | null>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const onMouseMove = (e: MouseEvent) => {
      targetXRef.current = (e.clientX / window.innerWidth)  * 100
      targetYRef.current = (e.clientY / window.innerHeight) * 100
    }

    const tick = () => {
      if (isMobile) {
        // mobile: follow the gyroscope's --mx/--my (0..1, written to <html>)
        const root = document.documentElement
        targetXRef.current = (parseFloat(root.style.getPropertyValue('--mx')) || 0.5) * 100
        targetYRef.current = (parseFloat(root.style.getPropertyValue('--my')) || 0.5) * 100
      }
      // lerp toward target with factor 0.08 — gives the "flows behind the cursor" feel
      gxRef.current += (targetXRef.current - gxRef.current) * 0.08
      gyRef.current += (targetYRef.current - gyRef.current) * 0.08
      el.style.setProperty('--gx', `${gxRef.current.toFixed(2)}%`)
      el.style.setProperty('--gy', `${gyRef.current.toFixed(2)}%`)
      rafRef.current = requestAnimationFrame(tick)
    }

    if (!isMobile) window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (!isMobile) window.removeEventListener('mousemove', onMouseMove)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isMobile])

  return (
    <div ref={rootRef} className={styles.root}>
      <div className={styles.blobs}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />
      </div>
      {/* Focal project theme-colour tint — sits above blobs, below bloom */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor:  color ?? 'transparent',
          mixBlendMode:     'color',
          opacity:          0.55,
          transition:       'background-color 0.7s ease',
          pointerEvents:    'none',
        }}
      />
      <div className={styles.bloom} />
      <div className={styles.vignette} />
    </div>
  )
}
