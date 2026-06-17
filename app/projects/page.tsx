'use client'
import { useState } from 'react'
import { MouseGradient } from '@/components/projects/MouseGradient'
import { ScrollingCircles } from '@/components/projects/ScrollingCircles'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { Gallery } from '@/components/Gallery'
import { getHomeProjects } from '@/lib/projects'
import { useLang } from '@/lib/i18n'
import { Reveal, RevealGroup } from '@/components/Reveal'
import type { Project } from '@/content/projects'

const allProjects = getHomeProjects()

// Zero-pad count, e.g. 09
const padCount = (n: number) => String(n).padStart(2, '0')

// SVG constants for the progress-ring counter (mirrors ProjectCounter)
const COUNTER_SZ   = 112   // px — 7rem
const COUNTER_R    = 53    // arc radius (leaves ~3px margin inside 112px)
const COUNTER_CIRC = 2 * Math.PI * COUNTER_R

export default function ProjectsPage() {
  const { t } = useLang()
  const [active,      setActive]      = useState<Project | null>(null)
  const [focalProject, setFocalProject] = useState<Project | null>(null)
  const [focalIndex,   setFocalIndex]  = useState(0)

  const count = allProjects.length

  const handleFocal = (p: Project) => {
    setFocalProject(p)
    setFocalIndex(allProjects.indexOf(p))
  }

  // progress arc driven by focal index
  const progress   = count > 0 ? (focalIndex + 1) / count : 0
  const dashOffset = COUNTER_CIRC * (1 - progress)

  return (
    <main className="relative h-screen w-screen overflow-hidden"
          style={{ background: 'transparent', color: '#1a1a1a' }}>

      {/* ── Fixed gradient backdrop (with focal theme-colour tint) ── */}
      <MouseGradient color={focalProject?.accent} />

      {/* ── Dual-track scrolling circles ── */}
      <ScrollingCircles
        projects={allProjects}
        onCircleClick={(p) => setActive(p)}
        onFocal={handleFocal}
        paused={active !== null}
      />

      {/* ── Corner furniture (nav links).
            variant="projects": same ink as "light" but hides the "portfolio 2026"
            mid-left label that would collide with the "Featured NN projects" header. ── */}
      <CornerFurniture variant="projects" />

      {/* ── Left-centre label: "Featured (09) projects" ── */}
      <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-0.5"
           style={{ fontFamily: 'Georgia, serif' }}>
        <RevealGroup>
          <Reveal>
            <span
              style={{
                fontSize: '2.8rem',
                fontWeight: 500,
                lineHeight: 1,
                color: 'rgba(28,22,20,0.82)',
                display: 'block',
              }}
            >
              Featured
            </span>
          </Reveal>
          <Reveal>
            <span
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(28,22,20,0.45)',
                fontFamily: 'system-ui, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              ({padCount(count)})
            </span>
          </Reveal>
          <Reveal>
            <span
              style={{
                fontSize: '2.8rem',
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1,
                color: 'rgba(28,22,20,0.82)',
                display: 'block',
              }}
            >
              projects
            </span>
          </Reveal>
        </RevealGroup>
      </div>

      {/* ── Bottom-left navigation circle — progress ring (⑧) ── */}
      <div
        className="pointer-events-none absolute bottom-6 left-5 z-10
                   flex h-[7rem] w-[7rem] flex-col items-center justify-center
                   rounded-full text-center"
        style={{ color: 'rgba(28,22,20,0.75)' }}
      >
        {/* SVG layer: faint track + progress arc + diagonal deco line */}
        <svg
          viewBox={`0 0 ${COUNTER_SZ} ${COUNTER_SZ}`}
          width={COUNTER_SZ}
          height={COUNTER_SZ}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ rotate: '-90deg' }}
        >
          {/* Faint full-circle track */}
          <circle
            cx={COUNTER_SZ / 2}
            cy={COUNTER_SZ / 2}
            r={COUNTER_R}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={1.5}
          />
          {/* Progress arc */}
          <circle
            cx={COUNTER_SZ / 2}
            cy={COUNTER_SZ / 2}
            r={COUNTER_R}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.85}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray={COUNTER_CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          {/* Decorative diagonal line — counter-rotated to appear upright */}
          <line
            x1={COUNTER_SZ * 0.7}
            y1={COUNTER_SZ * 0.2}
            x2={COUNTER_SZ * 0.3}
            y2={COUNTER_SZ * 0.8}
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={0.8}
            style={{ transformOrigin: `${COUNTER_SZ / 2}px ${COUNTER_SZ / 2}px`, rotate: '90deg' }}
          />
        </svg>
        <span className="ui-label text-[0.55rem] opacity-60 mb-1">PROJECTS</span>
        {/* Two-number stack: focal+1 / total */}
        <div className="flex flex-col items-center leading-none">
          <span style={{ fontSize: '1.3rem', fontWeight: 500, transition: 'opacity 0.3s' }}>
            {padCount(focalIndex + 1)}
          </span>
          <span style={{ fontSize: '1.3rem', fontWeight: 500 }}>{padCount(count)}</span>
        </div>
        <span className="ui-label text-[0.55rem] opacity-60 mt-1">NAVIGATION</span>
      </div>

      {/* ── Right-centre: year range — nudged UP to clear the right circle track ── */}
      {/* Fix 4: was at top-1/2, the right circles sit at +TRACK=190px from centre;
          moving this label to top-8 clears the circle column entirely.           */}
      <div className="pointer-events-none absolute right-5 top-8 z-10
                      flex flex-col items-end gap-1"
           style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,22,20,0.7)' }}>
        <RevealGroup>
          <Reveal>
            <span
              style={{
                fontSize: '1.05rem',
                fontStyle: 'italic',
                letterSpacing: '0.04em',
                display: 'block',
              }}
            >
              2021&thinsp;/&thinsp;2026
            </span>
          </Reveal>
        </RevealGroup>
      </div>

      {/* ── Bottom-right tagline ── */}
      <div className="pointer-events-none absolute bottom-6 right-5 z-10
                      text-right ui-label leading-snug"
           style={{ color: 'rgba(28,22,20,0.5)', maxWidth: '14rem' }}>
        <RevealGroup>
          <Reveal>
            <span>A FEATURED SELECTION.</span>
          </Reveal>
          <Reveal>
            <span>映像创作 × 创意开发</span>
          </Reveal>
        </RevealGroup>
      </div>

      {/* ── Gallery overlay ── */}
      {active && (
        <Gallery project={active} onClose={() => setActive(null)} />
      )}
    </main>
  )
}
