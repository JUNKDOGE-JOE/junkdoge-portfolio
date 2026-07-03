'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { initSound, sfxBoot, sfxReady } from '@/lib/sound'

// Terminal-green boot screen. Fake startup log types in line-by-line while a
// progress bar fills along the bottom, then the whole thing fades out.
const GREEN = '#4ade80'
const LINES = [
  '> booting junkdoge.portfolio',
  '> loading /covers ............. ok',
  '> mounting gsap timeline ...... ok',
  '> patching audio synth ........ ok',
  '> JUNK_DOGE :: 文字 × 映像 × 代码',
  '> ready. enjoy the show.',
]

const MIN_BOOT_MS = 1200   // keep the boot aesthetic even on a warm cache
const MAX_WAIT_MS = 6000   // never block longer than this on slow networks

export function Preloader({ assets = [] }: { assets?: string[] }) {
  const [pct, setPct] = useState(0)
  const [n, setN] = useState(0)           // number of log lines revealed
  const [cursor, setCursor] = useState(true)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Audio is fully synthesized (no files to load) — init early so the first
    // user gesture unlocks the AudioContext as soon as possible.
    initSound()
    let line = 0
    const lineTimer = setInterval(() => {
      line += 1
      sfxBoot(line)
      if (line >= LINES.length) clearInterval(lineTimer)
      setN(line)
    }, 170)
    const curTimer = setInterval(() => setCursor((c) => !c), 500)

    // Real preload: fetch every cover now so slide switches are instant.
    const start = performance.now()
    const total = assets.length
    let loaded = 0
    let disposed = false
    const imgs = assets.map((src) => {
      const img = new Image()
      img.onload = img.onerror = () => { loaded += 1 }
      img.src = src
      return img
    })

    // Progress bar chases the REAL loading progress (time-based when no assets).
    let v = 0
    let finished = false
    let rafId = 0
    const finish = () => {
      finished = true
      sfxReady()
      gsap.to(root.current, {
        autoAlpha: 0,
        duration: 0.5,
        delay: 0.2,
        onComplete: () => root.current && (root.current.style.display = 'none'),
      })
    }
    const tick = () => {
      if (disposed || finished) return
      const elapsed = performance.now() - start
      const timePct = Math.min(1, elapsed / MIN_BOOT_MS) * 100
      const loadPct = total > 0 ? (loaded / total) * 100 : 100
      const target = Math.min(timePct, loadPct)
      v += (target - v) * 0.12
      setPct(Math.round(v))
      const ready = (loaded >= total || elapsed >= MAX_WAIT_MS) && elapsed >= MIN_BOOT_MS
      if (ready && v > 99.2) {
        setPct(100)
        finish()
        return
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      clearInterval(lineTimer)
      clearInterval(curTimer)
      imgs.forEach((img) => { img.onload = img.onerror = null })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[60] flex flex-col p-8 md:p-12"
      style={{
        background: '#000',
        color: GREEN,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      }}
    >
      {/* top label */}
      <div className="text-[0.7rem] tracking-[0.3em]" style={{ opacity: 0.55 }}>
        J / D — SYSTEM BOOT
      </div>

      {/* boot log — types in line by line */}
      <div className="mt-10 flex flex-1 flex-col gap-1.5 text-sm md:text-base">
        {LINES.slice(0, n).map((l, i) => (
          <div key={i}>
            <span style={{ opacity: 0.4 }}>{String(i + 1).padStart(2, '0')}&nbsp;&nbsp;</span>
            <span style={{ opacity: 0.92 }}>{l}</span>
          </div>
        ))}
        <span
          className="inline-block h-[1.05em] w-[0.5em] align-text-bottom"
          style={{ background: GREEN, opacity: cursor ? 0.9 : 0 }}
        />
      </div>

      {/* bottom progress bar */}
      <div>
        <div
          className="mb-2 flex items-end justify-between text-[0.7rem] tracking-[0.25em]"
          style={{ opacity: 0.8 }}
        >
          <span>LOADING ASSETS</span>
          <span className="tabular-nums">{String(pct).padStart(3, '0')}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden" style={{ background: 'rgba(74,222,128,0.14)' }}>
          <div
            className="h-full"
            style={{ width: `${pct}%`, background: GREEN, boxShadow: `0 0 12px ${GREEN}` }}
          />
        </div>
      </div>
    </div>
  )
}
