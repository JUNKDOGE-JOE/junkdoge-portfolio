'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/** Wrap a text node so it can rise from a mask. Use inside <RevealGroup>. */
export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className}`} data-reveal>
      <span className="block">{children}</span>
    </span>
  )
}

/** On mount, staggers every [data-reveal] descendant up from its mask. */
export function RevealGroup({ children, className = '', stagger = 0.09, delay = 0 }:
  { children: React.ReactNode; className?: string; stagger?: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('[data-reveal] > *', { yPercent: 110 })
      gsap.to('[data-reveal] > *', { yPercent: 0, duration: 0.85, ease: 'power3.out', stagger, delay })
    }, ref)
    return () => ctx.revert()
  }, [])
  return <div ref={ref} className={className}>{children}</div>
}
