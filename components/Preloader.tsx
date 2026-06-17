'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

// Terminal-green boot screen. Fake startup log types in line-by-line while a
// progress bar fills along the bottom, then the whole thing fades out.
const GREEN = '#4ade80'
const LINES = [
  '> booting junkdoge.portfolio',
  '> loading /covers ............. ok',
  '> mounting gsap timeline ...... ok',
  '> compiling shaders ........... ok',
  '> JUNK_DOGE :: 映像创作 × 创意开发',
  '> ready.',
]

export function Preloader() {
  const [pct, setPct] = useState(0)
  const [n, setN] = useState(0)           // number of log lines revealed
  const [cursor, setCursor] = useState(true)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setN((v) => {
        const nv = v + 1
        if (nv >= LINES.length) clearInterval(lineTimer)
        return nv
      })
    }, 300)
    const curTimer = setInterval(() => setCursor((c) => !c), 500)

    const obj = { v: 0 }
    gsap.to(obj, {
      v: 100,
      duration: 2.0,
      ease: 'power1.inOut',
      onUpdate: () => setPct(Math.round(obj.v)),
      onComplete: () =>
        gsap.to(root.current, {
          autoAlpha: 0,
          duration: 0.5,
          delay: 0.25,
          onComplete: () => root.current && (root.current.style.display = 'none'),
        }),
    })

    return () => {
      clearInterval(lineTimer)
      clearInterval(curTimer)
    }
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
