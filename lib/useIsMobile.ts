'use client'
import { useState, useEffect } from 'react'

/** True when the viewport is at or below a mobile breakpoint (default 768px).
    SSR-safe: starts false, syncs on mount + on resize. */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [breakpoint])
  return isMobile
}
