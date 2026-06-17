'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface TrailItem { id: string; x: number; y: number; rot: number; src: string }

export function MouseTrail({ images, interval = 95 }: { images: string[]; interval?: number }) {
  const [items, setItems] = useState<TrailItem[]>([])
  const idx = useRef(0); const last = useRef(0); const lastPos = useRef({ x: -1, y: -1 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (e.clientX === lastPos.current.x && e.clientY === lastPos.current.y) return
      lastPos.current = { x: e.clientX, y: e.clientY }
      const now = performance.now()
      if (now - last.current < interval) return
      last.current = now
      const src = images[idx.current % images.length]; idx.current++
      setItems((p) => [...p, { id: crypto.randomUUID(), x: e.clientX, y: e.clientY, rot: (Math.random() - 0.5) * 38, src }])
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [images, interval])
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {items.map((it) => <TrailImg key={it.id} item={it} onDone={(id) => setItems((p) => p.filter((x) => x.id !== id))} />)}
    </div>
  )
}

function TrailImg({ item, onDone }: { item: TrailItem; onDone: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const tl = gsap.timeline({ onComplete: () => onDone(item.id) })
    tl.fromTo(el, { scale: 0, autoAlpha: 1 }, { scale: 1.15, duration: 0.14, ease: 'circ.out' })
      .to(el, { scale: 0, autoAlpha: 0, duration: 0.5, ease: 'circ.in' })
    return () => { tl.kill() }
  }, [])
  return (
    <div ref={ref} className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-white/25 shadow-lg"
      style={{ left: item.x, top: item.y, rotate: `${item.rot}deg` }}>
      <img src={item.src} alt="" className="h-full w-full object-cover" />
    </div>
  )
}
