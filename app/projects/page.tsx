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

export default function ProjectsPage() {
  const { t } = useLang()
  const [active, setActive]  = useState<Project | null>(null)
  const [focal,  setFocal]   = useState<Project | null>(null)

  const count = allProjects.length

  return (
    <main className="relative h-screen w-screen overflow-hidden"
          style={{ background: 'transparent', color: '#1a1a1a' }}>

      {/* ── Fixed gradient backdrop (with focal theme-colour tint) ── */}
      <MouseGradient color={focal?.accent} />

      {/* ── Dual-track scrolling circles ── */}
      <ScrollingCircles
        projects={allProjects}
        onCircleClick={(p) => setActive(p)}
        onFocal={setFocal}
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

      {/* ── Bottom-left navigation circle (decorative, reference-style) ── */}
      <div className="pointer-events-none absolute bottom-6 left-5 z-10
                      flex h-[7rem] w-[7rem] flex-col items-center justify-center
                      rounded-full border border-[rgba(28,22,20,0.25)] text-center"
           style={{ color: 'rgba(28,22,20,0.75)' }}>
        {/* Diagonal slash line */}
        <svg
          viewBox="0 0 80 80"
          className="absolute inset-0 w-full h-full opacity-20"
          aria-hidden
        >
          <line x1="25" y1="55" x2="55" y2="25" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="ui-label text-[0.55rem] opacity-60 mb-1">PROJECTS</span>
        {/* Two-number stack: top = 1, bottom = total */}
        <div className="flex flex-col items-center leading-none">
          <span style={{ fontSize: '1.3rem', fontWeight: 500 }}>1</span>
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
