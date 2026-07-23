'use client'
/* eslint-disable @next/next/no-img-element */
// MARATHON — sticky 粘性区：桌面竖滚驱动横移；≤760px / reduced-motion 降级为横向触控滑轨
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { projects, type Project, type ProjectType } from '@/content/projects'
import { useLang } from '@/lib/i18n'
import { Ticker, pad2 } from './bits'
import { ProjectOverlay, isMrOverlayOpen } from './ProjectOverlay'
import styles from './marathon.module.css'

const WORKS = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order)

const TYPE_LABEL: Record<ProjectType, string> = { pv: 'PV', vj: 'VJ', collab: 'COL', dev: 'DEV' }

const LINK_LABEL: Record<keyof Project['links'], string> = {
  bilibili: 'Bilibili ↗',
  github: 'GitHub ↗',
  external: 'Website ↗',
}

// 大中小混排 + 上下错位，形成拼贴节奏
const SIZES = ['L', 'M', 'S', 'M', 'L', 'S', 'M', 'L', 'M', 'S', 'M'] as const
const STAGGER = ['Up', 'Mid', 'Down'] as const

const EDGE_ITEMS = [
  'WORKS TRACK — A',
  `( ${pad2(WORKS.length)} ) FILES`,
  'SCROLL = DRIVE',
  'PV // VJ // DEV',
  'TAU CETI IV // SURFACE DATA',
]

function Card({ p, index, onOpen }: { p: Project; index: number; onOpen: () => void }) {
  const nn = pad2(index + 1)
  const size = SIZES[index % SIZES.length]
  const stagger = STAGGER[index % STAGGER.length]
  const isDev = p.type === 'dev'
  const links = (Object.keys(p.links) as (keyof Project['links'])[]).filter((k) => p.links[k])
  return (
    <article
      data-mr-card
      className={`${styles.mrCard} ${styles[`mrCard${size}`]} ${styles[`mrCard${stagger}`]} ${isDev ? styles.mrCardDev : ''}`}
      style={{ '--mr-acc': p.accent ?? '#D8FF3D' } as CSSProperties}
    >
      <span className={styles.mrCardBar} aria-hidden />
      <div className={styles.mrCardImg}>
        <img
          src={p.cover}
          alt={p.title.zh}
          loading="lazy"
          decoding="async"
          style={isDev ? { objectPosition: 'top' } : undefined}
        />
      </div>
      <div className={styles.mrCardBody}>
        <div className={styles.mrCardFile}>
          <span className={styles.mrCardNo}>{`( ${nn} )`}</span>
          <span>{`FILE_${nn} // ${TYPE_LABEL[p.type]} — ${p.year}`}</span>
        </div>
        <h3 className={styles.mrCardTitle}>{p.title.zh}</h3>
        <p className={styles.mrCardEn}>{p.title.en}</p>
        {p.desc.zh && size !== 'S' ? <p className={styles.mrCardDesc}>{p.desc.zh}</p> : null}
        <div className={styles.mrCardFoot}>
          <span className={styles.mrChip}>{p.role.zh}</span>
          {links.map((k) => (
            <a key={k} className={styles.mrCardLink} href={p.links[k]} target="_blank" rel="noreferrer">
              {LINK_LABEL[k]}
            </a>
          ))}
        </div>
      </div>
      <button
        type="button"
        className={styles.mrCardHit}
        onClick={onOpen}
        aria-label={`OPEN FILE_${nn} — ${p.title.zh}`}
      />
    </article>
  )
}

export function StickyWorks() {
  const { lang } = useLang()
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLElement>(null)
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const secLabel = lang === 'zh' ? '01 / 作品 — 竖滚驱动横轨' : '01 / WORKS — SCROLL TO DRIVE'

  // 垂直滚动 → 横向位移。全部走 ref 直改 DOM，不触发 React 重渲染。
  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const mqMobile = window.matchMedia('(max-width: 760px)')
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isFallback = () => mqMobile.matches || mqReduce.matches
    let raf = 0
    let current = 0
    let target = 0

    const maxShift = () => Math.max(0, track.scrollWidth - window.innerWidth)

    const measure = () => {
      if (isFallback()) {
        section.style.height = ''
        return
      }
      section.style.height = `${window.innerHeight + maxShift()}px`
    }

    const apply = (p: number) => {
      track.style.transform = `translate3d(${-Math.round(p * maxShift())}px, 0, 0)`
      if (progRef.current) progRef.current.style.width = `${p * 100}%`
      if (pctRef.current) pctRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`
    }

    const readTarget = () => {
      if (isFallback()) {
        target = 0
        return
      }
      const total = section.offsetHeight - window.innerHeight
      const rect = section.getBoundingClientRect()
      target = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0
    }

    const tick = () => {
      if (isFallback()) {
        raf = 0
        return
      }
      const diff = target - current
      if (Math.abs(diff * maxShift()) < 0.5) {
        current = target
        apply(current)
        raf = 0
        return
      }
      current += diff * 0.14
      apply(current)
      raf = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (isMrOverlayOpen()) return
      readTarget()
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onResize = () => {
      measure()
      wake()
    }

    measure()
    readTarget()
    current = target
    apply(current)
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('resize', onResize)
    mqMobile.addEventListener('change', onResize)
    mqReduce.addEventListener('change', onResize)
    return () => {
      window.removeEventListener('scroll', wake)
      window.removeEventListener('resize', onResize)
      mqMobile.removeEventListener('change', onResize)
      mqReduce.removeEventListener('change', onResize)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const cards = trackRef.current?.querySelectorAll('[data-mr-card]')
    if (!cards || cards.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.mrScanned)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.3 },
    )
    cards.forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])

  const openProject = openIdx !== null ? WORKS[openIdx] : null

  return (
    <section id="mr-works" ref={sectionRef} className={styles.mrStickyWorks} aria-label="作品轨道">
      <div className={styles.mrStickyWrap}>
        <div aria-hidden className={styles.mrTrackBg}>
          <span className={styles.mrTrackBgWord}>{'WORKS'}</span>
          <span className={styles.mrTrackBgWordB}>{'// ARCHIVE'}</span>
        </div>

        <Ticker items={EDGE_ITEMS} className={styles.mrTickerEdgeTop} />

        <div className={styles.mrTrackHead}>
          <div className={styles.mrKicker}>
            <span key={lang}>{secLabel}</span>
          </div>
          <span className={styles.mrTrackMeta}>{`( ${pad2(WORKS.length)} ) FILES — 2024 / 2026`}</span>
        </div>

        <div ref={trackRef} className={styles.mrTrack}>
          {WORKS.map((p, i) => (
            <Card key={p.slug} p={p} index={i} onOpen={() => setOpenIdx(i)} />
          ))}
          <div className={`${styles.mrCard} ${styles.mrCardEnd}`} aria-hidden>
            <span className={styles.mrCardBar} />
            <div className={styles.mrCardEndBody}>
              <span className={styles.mrCardEndWord}>{'END OF TRACK ▮'}</span>
              <span className={styles.mrCardEndMeta}>{`${pad2(WORKS.length)} FILES — ALL CLEAR // CONTINUE ↓`}</span>
            </div>
          </div>
        </div>

        <div className={styles.mrTrackHud} aria-hidden>
          <span>
            {'TRACK_A // '} <b ref={pctRef}>{'000%'}</b>
          </span>
          <div className={styles.mrTrackProgWrap}>
            <div ref={progRef} className={styles.mrTrackProg} />
          </div>
          <span>{'END ▮'}</span>
        </div>

        <Ticker items={EDGE_ITEMS} reverse className={styles.mrTickerEdgeB} />
      </div>

      {openProject && openIdx !== null ? (
        <ProjectOverlay project={openProject} index={openIdx} onClose={() => setOpenIdx(null)} />
      ) : null}
    </section>
  )
}
