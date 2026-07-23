'use client'
/* eslint-disable @next/next/no-img-element */
// MARATHON — 作品详情 overlay：锁滚 + Escape + 焦点陷阱
import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
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
  onClose,
}: {
  project: Project
  index: number
  onClose: () => void
}) {
  const { t } = useLang()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const imgs = galleryFor(p)
  const isDev = p.type === 'dev'
  const nn = pad2(index + 1)
  const links = (Object.keys(p.links) as (keyof Project['links'])[]).filter((k) => p.links[k])

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
        onClose()
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
      prevFocus?.focus()
    }
  }, [onClose])

  return (
    <div className={styles.mrOv} onWheel={(e) => e.stopPropagation()}>
      <div className={styles.mrOvBackdrop} onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        className={styles.mrOvPanel}
        role="dialog"
        aria-modal="true"
        aria-label={t(p.title)}
      >
        <div className={styles.mrOvInfo}>
          <button ref={closeRef} type="button" className={styles.mrOvClose} onClick={onClose}>
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
            className={`${styles.mrOvFig} ${isDev ? styles.mrOvFigDev : ''} ${styles.mrOvItem}`}
            style={{ '--d': '80ms' } as CSSProperties}
          >
            <TiltCard className={styles.mrOvTilt} maxDeg={4}>
              <img
                src={p.cover}
                alt={t(p.title)}
                style={isDev ? { objectPosition: 'top' } : undefined}
              />
            </TiltCard>
          </div>
          {imgs.map((src, i) => (
            <div
              key={src}
              className={`${styles.mrOvFig} ${isDev ? styles.mrOvFigDev : ''} ${styles.mrOvItem}`}
              style={{ '--d': `${140 + i * 60}ms` } as CSSProperties}
            >
              <TiltCard className={styles.mrOvTilt} maxDeg={4}>
                <img
                  src={src}
                  alt={`${t(p.title)} — ${pad2(i + 2)}`}
                  loading="lazy"
                  decoding="async"
                  style={isDev ? { objectPosition: 'top' } : undefined}
                />
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
