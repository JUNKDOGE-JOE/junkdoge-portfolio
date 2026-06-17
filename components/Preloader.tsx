'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export function Preloader() {
  const [pct, setPct] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obj = { v: 0 }
    gsap.to(obj, { v: 100, duration: 1.6, ease: 'power2.out',
      onUpdate: () => setPct(Math.round(obj.v)),
      onComplete: () => gsap.to(root.current, { autoAlpha: 0, duration: 0.6, delay: 0.1,
        onComplete: () => root.current && (root.current.style.display = 'none') }),
    })
  }, [])
  return (
    <div ref={root} className="fixed inset-0 z-50 flex items-end justify-end bg-[var(--night)] p-8">
      <span className="text-6xl font-bold tabular-nums">{pct}%</span>
    </div>
  )
}
