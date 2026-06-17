'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const SPACING = 90 // minimum px between spawned trail items
const MAX = 6     // maximum live trail items

interface TrailItem { id: string; x: number; y: number; src: string }

export function MouseTrail({ images }: { images: string[] }) {
  const [items, setItems] = useState<TrailItem[]>([])
  const idx         = useRef(0)
  const lastSpawn   = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cur = { x: e.clientX, y: e.clientY }

      if (!lastSpawn.current) {
        lastSpawn.current = cur
        return
      }

      const dx   = cur.x - lastSpawn.current.x
      const dy   = cur.y - lastSpawn.current.y
      const dist = Math.hypot(dx, dy)

      if (dist < SPACING) return

      const dirX  = dx / dist
      const dirY  = dy / dist
      const steps = Math.min(Math.floor(dist / SPACING), 3)

      const newItems: TrailItem[] = []
      for (let k = 1; k <= steps; k++) {
        const src = images[idx.current % images.length]
        idx.current++
        newItems.push({
          id:  crypto.randomUUID(),
          x:   lastSpawn.current.x + dirX * k * SPACING,
          y:   lastSpawn.current.y + dirY * k * SPACING,
          src,
        })
      }

      lastSpawn.current = {
        x: lastSpawn.current.x + dirX * steps * SPACING,
        y: lastSpawn.current.y + dirY * steps * SPACING,
      }

      if (newItems.length) {
        setItems(p => [...p, ...newItems].slice(-MAX))
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [images])

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {items.map(it => (
        <TrailImg
          key={it.id}
          item={it}
          onDone={id => setItems(p => p.filter(x => x.id !== id))}
        />
      ))}
    </div>
  )
}

function TrailImg({ item, onDone }: { item: TrailItem; onDone: (id: string) => void }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const imgRef   = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const img   = imgRef.current
    if (!outer || !img) return

    // Outer frame: pops in then shrinks away quickly (~0.5s total)
    const tl = gsap.timeline({ onComplete: () => onDone(item.id) })
    tl.fromTo(outer, { scale: 0, autoAlpha: 1 }, { scale: 1, duration: 0.12, ease: 'circ.out' }, 0)
      .to(outer, { scale: 0, autoAlpha: 0, duration: 0.32, ease: 'circ.in' }, 0.18)

    // Inner image: zooms in at a different (slower) rate
    gsap.fromTo(img, { scale: 1.6 }, { scale: 1, duration: 0.55, ease: 'power2.out' })

    return () => { tl.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={outerRef}
      className="absolute h-24 w-36 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-white/25 shadow-lg"
      style={{ left: item.x, top: item.y }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} src={item.src} alt="" className="h-full w-full object-cover" />
    </div>
  )
}
