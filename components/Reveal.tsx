'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/** Wrap a TEXT node so it can rise from an overflow-hidden mask (sentence reveal).
    Do NOT use for bordered/boxed elements — the mask clips them; use RevealUp. */
export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className}`} data-reveal>
      <span className="block">{children}</span>
    </span>
  )
}

/** Reveal for boxed/bordered/inline elements (pills, buttons, cards): fade + rise,
    NO clipping mask. */
export function RevealUp({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} data-reveal-up>
      {children}
    </div>
  )
}

/** On mount, staggers every [data-reveal] (masked text) and [data-reveal-up] (boxes) up. */
export function RevealGroup({ children, className = '', stagger = 0.09, delay = 0 }:
  { children: React.ReactNode; className?: string; stagger?: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('[data-reveal] > *', { yPercent: 110 })
      gsap.set('[data-reveal-up]', { autoAlpha: 0, y: 28 })
      gsap.to('[data-reveal] > *', { yPercent: 0, duration: 0.85, ease: 'power3.out', stagger, delay })
      gsap.to('[data-reveal-up]', { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger, delay: delay + 0.2 })
    }, ref)
    return () => ctx.revert()
  }, [])
  return <div ref={ref} className={className}>{children}</div>
}
