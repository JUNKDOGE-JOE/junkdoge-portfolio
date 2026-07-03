'use client'
import { useState } from 'react'
import { MouseGradient } from '@/components/projects/MouseGradient'
import { ScrollingCircles } from '@/components/projects/ScrollingCircles'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { Gallery } from '@/components/Gallery'
import { getHomeProjects } from '@/lib/projects'
import { useLang } from '@/lib/i18n'
import { Reveal, RevealGroup } from '@/components/Reveal'
import { ProgressRing } from '@/components/ProgressRing'
import type { Project } from '@/content/projects'
import { sfxClick } from '@/lib/sound'

const allProjects = getHomeProjects()

// Year range derived from the data (e.g. "2023 / 2026")
const projectYears = allProjects.map((p) => parseInt(p.year, 10)).filter((n) => !Number.isNaN(n))
const yearRange = projectYears.length
  ? `${Math.min(...projectYears)}\u2009/\u2009${Math.max(...projectYears)}`
  : ''

// Zero-pad count, e.g. 09
const padCount = (n: number) => String(n).padStart(2, '0')

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

  const progress = count > 0 ? (focalIndex + 1) / count : 0

  return (
    <main className="relative h-screen w-screen overflow-hidden"
          style={{ background: 'transparent', color: '#1a1a1a' }}>

      {/* ── Fixed gradient backdrop (with focal theme-colour tint) ── */}
      <MouseGradient color={focalProject?.accent} />

      {/* ── Dual-track scrolling circles ── */}
      <ScrollingCircles
        projects={allProjects}
        onCircleClick={(p) => { sfxClick(); setActive(p) }}
        onFocal={handleFocal}
        paused={active !== null}
      />

      {/* ── Corner furniture (nav links).
            variant="projects": same ink as "light" but hides the "portfolio 2026"
            mid-left label that would collide with the "Featured NN projects" header. ── */}
      <CornerFurniture variant="projects" />

      {/* ── Header: "Featured (11) projects" — top-left, clear of the two circle rows ── */}
      <div className="pointer-events-none absolute left-5 top-14 z-10 hidden md:block"
           style={{ fontFamily: 'Georgia, serif' }}>
        <RevealGroup>
          <Reveal>
            <span style={{ fontSize: '2.1rem', fontWeight: 500, lineHeight: 1.05, color: 'rgba(28,22,20,0.82)', display: 'block' }}>
              Featured <span style={{ fontSize: '0.95rem', letterSpacing: '0.1em', color: 'rgba(28,22,20,0.45)', fontFamily: 'system-ui, sans-serif' }}>({padCount(count)})</span> <em>projects</em>
            </span>
          </Reveal>
        </RevealGroup>
      </div>

      {/* ── Bottom-left navigation circle — same clean layout as the home counter ── */}
      <div
        className="pointer-events-none absolute bottom-4 left-4 z-10 hidden sm:flex
                   h-24 w-24 flex-col items-center justify-center rounded-full text-center
                   md:bottom-6 md:left-5 md:h-[7rem] md:w-[7rem]"
        style={{ color: 'rgba(28,22,20,0.75)' }}
      >
        <ProgressRing size={96} progress={progress} className="md:hidden" />
        <ProgressRing size={112} progress={progress} className="hidden md:block" />
        <span className="ui-label text-[0.5rem] opacity-60 md:text-[0.55rem]">PROJECTS</span>
        <span className="text-xl font-medium leading-none tabular-nums md:text-[1.35rem]">
          {padCount(focalIndex + 1)}<span className="mx-0.5 opacity-35">/</span>{padCount(count)}
        </span>
        <span className="ui-label text-[0.5rem] opacity-60 md:text-[0.55rem]">NAVIGATION</span>
      </div>

      {/* ── Right-centre: year range — nudged UP to clear the right circle track ── */}
      {/* Fix 4: was at top-1/2, the right circles sit at +TRACK=190px from centre;
          moving this label to top-8 clears the circle column entirely.           */}
      <div className="pointer-events-none absolute right-5 top-8 z-10
                      hidden md:flex flex-col items-end gap-1"
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
              {yearRange}
            </span>
          </Reveal>
        </RevealGroup>
      </div>

      {/* ── Bottom-right tagline ── */}
      <div className="pointer-events-none absolute bottom-6 right-5 z-10
                      hidden md:block text-right ui-label leading-snug"
           style={{ color: 'rgba(28,22,20,0.5)', maxWidth: '14rem' }}>
        <RevealGroup>
          <Reveal>
            <span>A FEATURED SELECTION.</span>
          </Reveal>
          <Reveal>
            <span>文字 × 映像 × 代码</span>
          </Reveal>
        </RevealGroup>
      </div>

      {/* ── Mobile: horizontal-swipe hint (desktop uses the wheel + "scroll" label) ── */}
      <div className="md:hidden pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-10 ui-label text-[0.58rem] tracking-[0.22em]"
           style={{ color: 'rgba(28,22,20,0.45)' }}>
        ← 横向滑动浏览 →
      </div>

      {/* ── Gallery overlay ── */}
      {active && (
        <Gallery project={active} onClose={() => setActive(null)} />
      )}
    </main>
  )
}
