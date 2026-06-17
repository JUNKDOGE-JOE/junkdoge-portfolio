'use client'
import { useRef } from 'react'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  /** Maximum tilt in degrees. Default: 10 */
  maxDeg?: number
}

export function TiltCard({ children, className, maxDeg = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5   // -0.5..0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${-py * maxDeg}deg) rotateY(${px * maxDeg}deg)`
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.2s ease-out', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
