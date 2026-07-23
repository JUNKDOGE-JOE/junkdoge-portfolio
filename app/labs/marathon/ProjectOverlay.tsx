'use client'
/* eslint-disable @next/next/no-img-element */
// MARATHON — 作品详情 overlay：锁滚 + Escape + 焦点陷阱
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import gsap from 'gsap'
import { useLang } from '@/lib/i18n'
import { galleryFor } from '@/lib/projects'
import type { Project, ProjectType } from '@/content/projects'
import { TiltCard } from '@/components/TiltCard'
import { pad2 } from './bits'
import styles from './marathon.module.css'

let _ovCount = 0
export function isMrOverlayOpen(): boolean {
  return _ovCount > 0
}

const TYPE_LABEL: Record<ProjectType, string> = { pv: 'PV', vj: 'VJ', collab: 'COL', dev: 'DEV' }

const LINK_LABEL: Record<keyof Project['links'], string> = {
  bilibili: 'Bilibili ↗',
  github: 'GitHub ↗',
  external: 'Website ↗',
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function ProjectOverlay({
  project: p,
  index,
  originRect,
  onClose,
}: {
  project: Project
  index: number
  originRect?: DOMRect
  onClose: () => void
}) {
  const { t } = useLang()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const firstFigRef = useRef<HTMLDivElement>(null)
  const morphRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef(0)
  const closingRef = useRef(false)
  const onCloseRef = useRef(onClose)
  const [isClosing, setIsClosing] = useState(false)
  const imgs = galleryFor(p)
  const isDev = p.type === 'dev'
  const nn = pad2(index + 1)
  const links = (Object.keys(p.links) as (keyof Project['links'])[]).filter((k) => p.links[k])
  const heroSrc = p.devVisual ?? p.cover
  onCloseRef.current = onClose

  const requestClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => onCloseRef.current(), 360)
  }, [])

  // 与原主站 Gallery 相同的共享元素手法：用一张固定定位的真实图片
  // 从作品卡片的屏幕坐标移动到详情第一张，再无缝交还给详情图片。
  useLayoutEffect(() => {
    const first = firstFigRef.current
    const morph = morphRef.current
    if (!first || !morph || !originRect) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const target = first.getBoundingClientRect()
    first.style.visibility = 'hidden'
    gsap.set(morph, {
      opacity: 1,
      top: originRect.top,
      left: originRect.left,
      width: originRect.width,
      height: originRect.height,
    })
    const tween = gsap.to(morph, {
      top: target.top,
      left: target.left,
      width: target.width,
      height: target.height,
      duration: 0.65,
      ease: 'power3.inOut',
      onComplete: () => {
        first.style.visibility = 'visible'
        gsap.set(morph, { opacity: 0 })
      },
    })

    return () => {
      tween.kill()
      first.style.visibility = 'visible'
      gsap.set(morph, { opacity: 0 })
    }
  }, [originRect])

  useEffect(() => {
    _ovCount++
    const prevOverflow = document.body.style.overflow
    const prevFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        requestClose()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
      )
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      _ovCount--
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(closeTimerRef.current)
      prevFocus?.focus()
    }
  }, [requestClose])

  return (
    <div
      className={`${styles.mrOv} ${isClosing ? styles.mrOvClosing : ''}`}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className={styles.mrOvBackdrop} onClick={requestClose} aria-hidden />
      <div
        ref={panelRef}
        className={styles.mrOvPanel}
        role="dialog"
        aria-modal="true"
        aria-label={t(p.title)}
      >
        <div className={styles.mrOvInfo}>
          <button ref={closeRef} type="button" className={styles.mrOvClose} onClick={requestClose}>
            {'✕ CLOSE'}
          </button>
          <div className={styles.mrKicker}>
            <span>{`FILE_${nn} // ${TYPE_LABEL[p.type]} — ${p.year}`}</span>
          </div>
          <h2 className={styles.mrOvTitle}>{t(p.title)}</h2>
          <p className={styles.mrOvEn}>{p.title.en}</p>
          <p className={styles.mrOvMeta}>{`${t(p.role)} / ${p.year}`}</p>
          {t(p.desc) ? <p className={styles.mrOvDesc}>{t(p.desc)}</p> : null}
          {links.length ? (
            <div className={styles.mrOvLinks}>
              {links.map((k) => (
                <a key={k} className={styles.mrCardLink} href={p.links[k]} target="_blank" rel="noreferrer">
                  {LINK_LABEL[k]}
                </a>
              ))}
            </div>
          ) : null}
          <p className={styles.mrOvCount}>
            {imgs.length ? `GALLERY — ${pad2(imgs.length + 1)} IMGS` : 'COVER ONLY — NO GALLERY'}
          </p>
        </div>

        <div className={isDev ? styles.mrOvGalleryDev : styles.mrOvGallery}>
          <div
            ref={firstFigRef}
            className={`${styles.mrOvFigSlot} ${originRect ? '' : styles.mrOvItem}`}
            style={{ '--d': '80ms' } as CSSProperties}
          >
            <TiltCard
              className={`${styles.mrOvFig} ${isDev ? styles.mrOvFigDev : ''}`}
              maxDeg={4}
            >
              <div className={styles.mrOvTilt}>
                <img
                  src={heroSrc}
                  alt={t(p.title)}
                  style={isDev ? { objectPosition: 'top' } : undefined}
                />
              </div>
            </TiltCard>
          </div>
          {imgs.map((src, i) => (
            <div
              key={src}
              className={`${styles.mrOvFigSlot} ${styles.mrOvItem}`}
              style={{ '--d': `${140 + i * 60}ms` } as CSSProperties}
            >
              <TiltCard
                className={`${styles.mrOvFig} ${isDev ? styles.mrOvFigDev : ''}`}
                maxDeg={4}
              >
                <div className={styles.mrOvTilt}>
                  <img
                    src={src}
                    alt={`${t(p.title)} — ${pad2(i + 2)}`}
                    loading="lazy"
                    decoding="async"
                    style={isDev ? { objectPosition: 'top' } : undefined}
                  />
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>

      <div ref={morphRef} className={styles.mrOvMorph} aria-hidden>
        <img
          src={heroSrc}
          alt=""
          style={isDev ? { objectPosition: 'top' } : undefined}
        />
      </div>
    </div>
  )
}
