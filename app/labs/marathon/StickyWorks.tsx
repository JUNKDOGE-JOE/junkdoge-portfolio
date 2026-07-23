'use client'
/* eslint-disable @next/next/no-img-element */
// MARATHON — 作品区：横向单排作品 + 左侧信息槽 / 右侧大图槽 + 独立页面纵滚槽
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { projects, type Project, type ProjectType } from '@/content/projects'
import { useLang } from '@/lib/i18n'
import { pad2 } from './bits'
import { ProjectOverlay } from './ProjectOverlay'
import { TiltCard } from '@/components/TiltCard'
import styles from './marathon.module.css'

const WORKS = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order)

const TYPE_LABEL: Record<ProjectType, string> = { pv: 'PV', vj: 'VJ', collab: 'COL', dev: 'DEV' }

const LINK_LABEL: Record<keyof Project['links'], string> = {
  bilibili: 'Bilibili ↗',
  github: 'GitHub ↗',
  external: 'Website ↗',
}

function Panel({
  p,
  index,
  onOpen,
}: {
  p: Project
  index: number
  onOpen: (originRect?: DOMRect) => void
}) {
  const { t } = useLang()
  const figRef = useRef<HTMLButtonElement>(null)
  const nn = pad2(index + 1)
  const isDev = p.type === 'dev'
  const links = (Object.keys(p.links) as (keyof Project['links'])[]).filter((k) => p.links[k])
  const figSrc = p.devVisual ?? p.cover

  return (
    <article
      data-mr-panel
      className={`${styles.mrPanel} ${isDev ? styles.mrPanelDev : ''}`}
      style={{ '--mr-acc': p.accent ?? '#D8FF3D' } as CSSProperties}
    >
      {/* 氛围底只负责定调；右侧槽位保留清晰原图 */}
      <div className={styles.mrPanelBg} aria-hidden>
        <img src={p.cover} alt="" loading="lazy" decoding="async" />
        <span className={styles.mrPanelScrim} />
      </div>

      <div className={styles.mrPanelInner}>
        <TiltCard className={styles.mrPanelCopyTilt} maxDeg={5}>
          <div className={styles.mrPanelCopy}>
            <div className={styles.mrPanelCopyInner}>
              <div className={styles.mrKicker}>
                <span>{`01 / ${TYPE_LABEL[p.type]} — ${p.year}`}</span>
              </div>
              <p className={styles.mrPanelFile}>{`( ${nn} ) FILE_${nn}`}</p>
              <h3 className={styles.mrPanelTitle}>{t(p.title)}</h3>
              <p className={styles.mrPanelEn}>{p.title.en}</p>
              <p className={styles.mrPanelMeta}>{`${t(p.role)} / ${p.year}`}</p>
              {t(p.desc) ? <p className={styles.mrPanelDesc}>{t(p.desc)}</p> : null}
              <div className={styles.mrPanelFoot}>
                {links.map((k) => (
                  <a key={k} className={styles.mrCardLink} href={p.links[k]} target="_blank" rel="noreferrer">
                    {LINK_LABEL[k]}
                  </a>
                ))}
                <button
                  type="button"
                  className={`${styles.mrBtn} ${styles.mrBtnAcid}`}
                  onClick={() => onOpen()}
                >
                  {t({ zh: '查看详情', en: 'OPEN FILE' })}
                </button>
              </div>
              <span className={styles.mrPanelScrollHint}>
                {index === WORKS.length - 1
                  ? t({ zh: '右侧页面槽 · 关于 ↓', en: 'PAGE LANE · ABOUT ↓' })
                  : t({ zh: '滚动 · 下一作品 →', en: 'SCROLL · NEXT FILE →' })}
              </span>
            </div>
          </div>
        </TiltCard>

        <TiltCard className={styles.mrPanelFigTilt} maxDeg={6}>
          <button
            ref={figRef}
            type="button"
            className={styles.mrPanelFig}
            onClick={() => onOpen(figRef.current?.getBoundingClientRect())}
            aria-label={`${t({ zh: '打开', en: 'Open' })} ${t(p.title)}`}
          >
            <img
              src={figSrc}
              alt={t(p.title)}
              loading="lazy"
              decoding="async"
              style={isDev ? { objectPosition: 'top' } : undefined}
            />
            <span className={styles.mrPanelFigMeta} aria-hidden>
              <b>{nn}</b>
              <span>{`${TYPE_LABEL[p.type]} // ${p.year}`}</span>
            </span>
          </button>
        </TiltCard>
      </div>
    </article>
  )
}

export function StickyWorks() {
  const { lang } = useLang()
  const sectionRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLElement>(null)
  const [openProject, setOpenProject] = useState<{ index: number; originRect?: DOMRect } | null>(null)
  const secLabel = lang === 'zh' ? '01 / 作品 — 横向切换' : '01 / WORKS — SCROLL SIDEWAYS'

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(pointer: coarse)').matches) return

    let raf = 0
    let nextX = 0.5
    let nextY = 0.5
    const commit = () => {
      raf = 0
      section.style.setProperty('--mx', String(nextX))
      section.style.setProperty('--my', String(nextY))
      section.style.setProperty('--mr-bg-x', `${(nextX - 0.5) * -72}px`)
      section.style.setProperty('--mr-bg-y', `${(nextY - 0.5) * -56}px`)
    }
    const onMove = (e: PointerEvent) => {
      nextX = e.clientX / window.innerWidth
      nextY = e.clientY / window.innerHeight
      if (!raf) raf = requestAnimationFrame(commit)
    }
    const onLeave = () => {
      nextX = 0.5
      nextY = 0.5
      if (!raf) raf = requestAnimationFrame(commit)
    }

    section.addEventListener('pointermove', onMove, { passive: true })
    section.addEventListener('pointerleave', onLeave)
    return () => {
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const mqMobile = window.matchMedia('(max-width: 760px)')
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0
    let wheelAccum = 0
    let wheelReset = 0
    let wheelUnlock = 0
    let wheelLocked = false

    const syncHud = () => {
      raf = 0
      const max = rail.scrollWidth - rail.clientWidth
      const p = max > 0 ? rail.scrollLeft / max : 0
      if (progRef.current) progRef.current.style.width = `${p * 100}%`
      if (pctRef.current) pctRef.current.textContent = `${String(Math.round(p * 100)).padStart(3, '0')}%`
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(syncHud)
    }

    const onWheel = (e: WheelEvent) => {
      // 手机/窄屏保留原生触控滑动；右侧“页面滚动槽”是 rail 的兄弟元素，
      // 不会进入这里，因此用户随时可以把鼠标移过去继续上下翻页。
      if (mqMobile.matches) return
      const max = rail.scrollWidth - rail.clientWidth
      if (max <= 0) return

      // 触控板横向手势由原生横轨处理。
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return

      const atStart = rail.scrollLeft <= 1
      const atEnd = rail.scrollLeft >= max - 1
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return

      e.preventDefault()
      if (wheelLocked) return

      const unit =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : e.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1
      wheelAccum += e.deltaY * unit

      window.clearTimeout(wheelReset)
      wheelReset = window.setTimeout(() => {
        wheelAccum = 0
      }, 180)

      if (Math.abs(wheelAccum) < 24) return

      const direction = Math.sign(wheelAccum)
      wheelAccum = 0
      const stops = Array.from(rail.querySelectorAll<HTMLElement>('[data-mr-panel]'))
        .map((panel) => panel.offsetLeft)
        .concat(max)
        .filter((left, index, all) => index === 0 || left !== all[index - 1])
      const target =
        direction > 0
          ? (stops.find((left) => left > rail.scrollLeft + 4) ?? max)
          : ([...stops].reverse().find((left) => left < rail.scrollLeft - 4) ?? 0)

      wheelLocked = true
      rail.scrollTo({ left: target, behavior: mqReduce.matches ? 'auto' : 'smooth' })
      onScroll()

      window.clearTimeout(wheelUnlock)
      wheelUnlock = window.setTimeout(() => {
        wheelLocked = false
      }, mqReduce.matches ? 0 : 520)
    }

    syncHud()
    rail.addEventListener('scroll', onScroll, { passive: true })
    rail.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('resize', onScroll)
    return () => {
      rail.removeEventListener('scroll', onScroll)
      rail.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onScroll)
      window.clearTimeout(wheelReset)
      window.clearTimeout(wheelUnlock)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      id="mr-works"
      ref={sectionRef}
      className={styles.mrHWorks}
      aria-label="作品列表"
      style={{ '--mx': '0.5', '--my': '0.5' } as CSSProperties}
    >
      <div className={styles.mrHHead}>
        <div className={styles.mrKicker}>
          <span key={lang}>{secLabel}</span>
        </div>
        <span className={styles.mrTrackMeta}>{`( ${pad2(WORKS.length)} ) FILES — 2024 / 2026`}</span>
      </div>

      <div ref={railRef} className={styles.mrHRail}>
        {WORKS.map((p, i) => (
          <Panel
            key={p.slug}
            p={p}
            index={i}
            onOpen={(originRect) => setOpenProject({ index: i, originRect })}
          />
        ))}
      </div>

      <div className={styles.mrHHud} aria-hidden>
        <span>{lang === 'zh' ? '画面滚轮 // 切换作品' : 'CANVAS WHEEL // SWITCH WORK'}</span>
        <div className={styles.mrTrackProgWrap}>
          <div ref={progRef} className={styles.mrTrackProg} />
        </div>
        <b ref={pctRef}>{'000%'}</b>
      </div>

      <aside
        data-mr-page-lane
        className={styles.mrPageLane}
        aria-label={lang === 'zh' ? '页面上下滚动区域' : 'Vertical page scroll area'}
      >
        <span>{lang === 'zh' ? '页面' : 'PAGE'}</span>
        <b aria-hidden>{'↑ ↓'}</b>
        <small>{lang === 'zh' ? '在此滚动' : 'SCROLL HERE'}</small>
      </aside>

      {openProject ? (
        <ProjectOverlay
          project={WORKS[openProject.index]}
          index={openProject.index}
          originRect={openProject.originRect}
          onClose={() => setOpenProject(null)}
        />
      ) : null}
    </section>
  )
}
