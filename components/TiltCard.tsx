'use client'
import { useEffect, useRef } from 'react'
import { useIsMobile } from '@/lib/useIsMobile'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  /** Maximum tilt in degrees. Default: 10 */
  maxDeg?: number
}

export function TiltCard({ children, className, maxDeg = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // Mobile: the gyroscope (--mx/--my on <html>, already smoothed) tilts every
  // card globally. No CSS transition here — the value is pre-lerped, so a
  // transition would just chase it and jitter.
  useEffect(() => {
    if (!isMobile) return
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    let raf = 0
    const loop = () => {
      const mx = parseFloat(root.style.getPropertyValue('--mx')) || 0.5
      const my = parseFloat(root.style.getPropertyValue('--my')) || 0.5
      el.style.transform = `perspective(900px) rotateX(${-(my - 0.5) * 2 * maxDeg}deg) rotateY(${(mx - 0.5) * 2 * maxDeg}deg)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [isMobile, maxDeg])

  // Desktop: cursor-driven tilt
  const onMove = (e: React.MouseEvent) => {
    if (isMobile) return
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${-py * maxDeg}deg) rotateY(${px * maxDeg}deg)`
  }
  const onLeave = () => {
    if (isMobile || !ref.current) return
    ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d', transition: isMobile ? 'none' : 'transform 0.2s ease-out', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
