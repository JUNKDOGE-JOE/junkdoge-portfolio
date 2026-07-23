'use client'
// MARATHON — 共享小件：hooks / Reveal / Ticker
import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './marathon.module.css'

export const pad2 = (n: number) => String(n).padStart(2, '0')

export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return { ref, inView }
}

// 客户端挂载后取当天日期，格式 MM.DD.YYYY（rAF 异步写入，避免水合不一致与级联渲染）
export function useToday() {
  const [today, setToday] = useState('')
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const d = new Date()
      setToday(`${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}.${d.getFullYear()}`)
    })
    return () => cancelAnimationFrame(raf)
  }, [])
  return today
}

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12)
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${styles.mrReveal} ${inView ? styles.mrIn : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function Ticker({
  items,
  reverse = false,
  className = '',
}: {
  items: string[]
  reverse?: boolean
  className?: string
}) {
  return (
    <div className={`${styles.mrTicker} ${reverse ? styles.mrTickerRev : ''} ${className}`} aria-hidden>
      <div className={styles.mrTickerTrack}>
        {[0, 1].map((g) => (
          <div key={g} className={styles.mrTickerGroup}>
            {items.map((t) => (
              <span key={t}>{`${t} ▲`}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
