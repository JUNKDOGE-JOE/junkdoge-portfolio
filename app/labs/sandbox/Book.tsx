'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { projects, type Project } from '@/content/projects'
import { site } from '@/lib/site'
import styles from './sandbox.module.css'

const TYPE_LABEL: Record<Project['type'], { zh: string; en: string }> = {
  pv: { zh: '影像', en: 'PV' },
  vj: { zh: '现场', en: 'VJ' },
  collab: { zh: '协作', en: 'COLLAB' },
  dev: { zh: '开发', en: 'DEV' },
}

const LINK_LABEL: Record<string, string> = {
  bilibili: '哔哩哔哩 BILIBILI',
  github: 'GitHub',
  external: '外部链接 LINK',
}

const no = (n: number) => `No.${String(n).padStart(3, '0')}`
const pg = (n: number) => `P.${String(n).padStart(2, '0')}`

type Sheet =
  | { kind: 'cover' }
  | { kind: 'toc' }
  | { kind: 'work'; project: Project }
  | { kind: 'about' }
  | { kind: 'commission' }
  | { kind: 'colophon' }

export function Book() {
  const works = useMemo(
    () => projects.filter((p) => p.featured).sort((a, b) => a.order - b.order),
    []
  )
  const sheets = useMemo<Sheet[]>(
    () => [
      { kind: 'cover' },
      { kind: 'toc' },
      ...works.map((project): Sheet => ({ kind: 'work', project })),
      { kind: 'about' },
      { kind: 'commission' },
      { kind: 'colophon' },
    ],
    [works]
  )

  const total = sheets.length
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState<'next' | 'prev'>('next')

  const goTo = useCallback(
    (i: number) => {
      setIndex((cur) => {
        const target = Math.max(0, Math.min(total - 1, i))
        if (target !== cur) setDir(target > cur ? 'next' : 'prev')
        return target
      })
    },
    [total]
  )
  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Home') goTo(0)
      else if (e.key === 'End') goTo(total - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, goTo, total])

  const sheet = sheets[index]

  return (
    <main className={styles.page}>
      {/* 展签式页眉 */}
      <header className={styles.masthead}>
        <span>個人作品展 · SOLO EXHIBITION</span>
        <span className={styles.mastDot} aria-hidden>◆</span>
        <span>纸上展册 · PAPER EDITION</span>
        <span className={styles.mastDot} aria-hidden>◆</span>
        <span>图录编号 CAT. JD-001</span>
      </header>

      {/* 书本 */}
      <div className={styles.bookWrap}>
        <div className={styles.book}>
          <div
            key={index}
            className={`${styles.sheet} ${dir === 'next' ? styles.enterNext : styles.enterPrev}`}
          >
            <SheetBody sheet={sheet} works={works} goTo={goTo} />
          </div>
          <span className={styles.crease} aria-hidden />
        </div>
      </div>

      {/* 翻页控制 */}
      <nav className={styles.controls} aria-label="翻页">
        <button
          type="button"
          className={styles.turnBtn}
          onClick={prev}
          disabled={index === 0}
          aria-label="上一页"
        >
          ← 前页 PREV
        </button>
        <button
          type="button"
          className={styles.pager}
          onClick={() => goTo(1)}
          aria-label="返回目录"
          title="返回目录 TOC"
        >
          {pg(index + 1)} / {total}
        </button>
        <button
          type="button"
          className={styles.turnBtn}
          onClick={next}
          disabled={index === total - 1}
          aria-label="下一页"
        >
          次页 NEXT →
        </button>
      </nav>
    </main>
  )
}

function SheetBody({
  sheet,
  works,
  goTo,
}: {
  sheet: Sheet
  works: Project[]
  goTo: (i: number) => void
}) {
  switch (sheet.kind) {
    case 'cover':
      return <CoverSheet />
    case 'toc':
      return <TocSheet works={works} goTo={goTo} />
    case 'work':
      return <WorkSheet p={sheet.project} />
    case 'about':
      return <AboutSheet />
    case 'commission':
      return <CommissionSheet />
    case 'colophon':
      return <ColophonSheet />
  }
}

/* —— 封面 —— */
function CoverSheet() {
  return (
    <div className={`${styles.leaf} ${styles.cover}`}>
      <div className={styles.heroMeta}>
        <p>展期 DATE —— 常设 PERMANENT</p>
        <p>场馆 VENUE —— junkdoge / web</p>
        <p>媒介 MEDIA —— 文字 · 映像 · 代码</p>
      </div>

      <h1 className={styles.coverTitle}>
        JUNK<span className={styles.coverUnderscore}>_</span>DOGE
      </h1>

      <div className={styles.coverSub}>
        <p className={styles.coverTagline}>{site.misc.homeTagline}</p>
        <p className={styles.coverEn}>Type, Image &amp; Code — Motion Design · Creative Development</p>
      </div>

      <div className={styles.coverSide} aria-hidden>
        <span>動</span><span>效</span><span>設</span><span>計</span>
        <i />
        <span>創</span><span>意</span><span>開</span><span>發</span>
      </div>

      <div className={styles.seal} aria-hidden><span>犬</span></div>

      <p className={styles.coverFoot}>个人作品图录 · A CATALOGUE OF SELECTED WORKS</p>
    </div>
  )
}

/* —— 目录 —— */
function TocSheet({ works, goTo }: { works: Project[]; goTo: (i: number) => void }) {
  return (
    <div className={styles.leaf}>
      <SheetHead no="目次" en="TABLE OF CONTENTS" />
      <ol className={styles.tocList}>
        {works.map((p, i) => (
          <li key={p.slug}>
            <button type="button" className={styles.tocRow} onClick={() => goTo(i + 2)}>
              <span className={styles.tocNo}>{no(p.order)}</span>
              <span className={styles.tocTitle}>
                {p.title.zh}
                <span className={styles.tocTitleEn}>{p.title.en}</span>
              </span>
              <span className={styles.tocDots} aria-hidden />
              <span className={styles.tocPage}>{pg(i + 3)}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className={styles.tocRow} onClick={() => goTo(works.length + 2)}>
            <span className={styles.tocNo}>—</span>
            <span className={styles.tocTitle}>展言<span className={styles.tocTitleEn}>About the Artist</span></span>
            <span className={styles.tocDots} aria-hidden />
            <span className={styles.tocPage}>{pg(works.length + 3)}</span>
          </button>
        </li>
        <li>
          <button type="button" className={styles.tocRow} onClick={() => goTo(works.length + 3)}>
            <span className={styles.tocNo}>—</span>
            <span className={styles.tocTitle}>委制<span className={styles.tocTitleEn}>Commission &amp; Rates</span></span>
            <span className={styles.tocDots} aria-hidden />
            <span className={styles.tocPage}>{pg(works.length + 4)}</span>
          </button>
        </li>
      </ol>
    </div>
  )
}

/* —— 作品对开页 —— */
function WorkSheet({ p }: { p: Project }) {
  const t = TYPE_LABEL[p.type]
  const linkEntries = Object.entries(p.links).filter(([, v]) => Boolean(v))
  return (
    <div className={`${styles.leaf} ${styles.spread}`}>
      {/* 左页：图版 */}
      <figure className={styles.plate}>
        <div className={styles.plateFrame}>
          <img src={p.cover} alt={p.title.zh} loading="lazy" />
        </div>
        <figcaption className={styles.plateCap}>
          FIG.{String(p.order).padStart(2, '0')} — {p.title.zh} · {p.year}
        </figcaption>
      </figure>

      {/* 右页：条目 */}
      <article className={styles.entry}>
        <p className={styles.entryKicker}>
          {no(p.order)} — {p.year} · {t.zh} {t.en}
        </p>
        <h3 className={styles.entryTitle}>
          {p.title.zh}
          <span className={styles.entryTitleEn}>{p.title.en}</span>
        </h3>
        <span
          className={styles.entrySeal}
          style={{ background: p.accent ?? '#1A1815' }}
          aria-hidden
        >
          {t.en.slice(0, 2)}
        </span>

        <dl className={styles.entryTable}>
          <div className={styles.entryRow}>
            <dt>职责 ROLE</dt>
            <dd>{p.role.zh}</dd>
          </div>
          <div className={styles.entryRow}>
            <dt>年份 YEAR</dt>
            <dd>{p.year}</dd>
          </div>
          {p.desc.zh.trim() !== '' && (
            <div className={styles.entryRow}>
              <dt>附记 NOTE</dt>
              <dd>{p.desc.zh}</dd>
            </div>
          )}
          {linkEntries.length > 0 && (
            <div className={styles.entryRow}>
              <dt>出处 LINKS</dt>
              <dd className={styles.entryLinks}>
                {linkEntries.map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer">
                    {LINK_LABEL[k] ?? k.toUpperCase()}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </article>
    </div>
  )
}

/* —— 展言 / 作者简历 —— */
function AboutSheet() {
  const bioParas = site.about.bio.zh.split('\n\n').map((s) => s.trim()).filter(Boolean)
  return (
    <div className={styles.leaf}>
      <SheetHead no="展言" en="ABOUT THE ARTIST" />
      <div className={styles.aboutGrid}>
        <div className={styles.aboutBio}>
          <p className={styles.aboutName}>
            JUNK_DOGE
            <span className={styles.aboutNameEn}>动效设计师 · 创意开发者 · 开源爱好者</span>
          </p>
          {bioParas.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className={styles.aboutAside}>
          <p className={styles.aboutAsideLabel}>社交 SOCIAL</p>
          <ul className={styles.aboutLinks}>
            {site.about.links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  <span>{l.label}</span>
                  <span aria-hidden>→</span>
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.aboutVert} aria-hidden>作者简历</p>
        </div>
      </div>
    </div>
  )
}

/* —— 委制 / 展览服务 —— */
function CommissionSheet() {
  return (
    <div className={styles.leaf}>
      <SheetHead no="委制" en="EXHIBITION SERVICES — RATES" />
      <div className={styles.commLead}>
        {site.commission.lead?.zh.split('\n\n').filter((s) => s.trim()).map((para, i) => (
          <p key={i}>{para.trim()}</p>
        ))}
      </div>
      <table className={styles.rateTable}>
        <tbody>
          {site.commission.tiers.map((tier) => (
            <tr key={tier.k}>
              <th scope="row">
                {tier.k}
                {tier.kEn && <span className={styles.rateSub}>{tier.kEn}</span>}
              </th>
              <td>
                {tier.zh}
                <span className={styles.rateSub}>{tier.en}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.commContact}>
        <span className={styles.commContactLabel}>联络 CONTACT</span>
        {site.commission.contact}
      </p>
    </div>
  )
}

/* —— 版权页 / 封底 —— */
function ColophonSheet() {
  const year = new Date().getFullYear()
  return (
    <div className={`${styles.leaf} ${styles.colophon}`}>
      <div className={styles.colophonInner}>
        <div className={styles.seal} aria-hidden><span>犬</span></div>
        <p className={styles.colophonMain}>JUNK_DOGE — 纸上展册</p>
        <p className={styles.colophonSub}>PAPER EDITION · 初版 FIRST PRINTING {year}</p>
        <div className={styles.colophonRule} aria-hidden />
        <p className={styles.colophonSub}>本刊物以网页为纸 · PRINTED ON THE WEB</p>
        <p className={styles.colophonSub}>© {year} JUNK_DOGE · 保留所有权利 ALL RIGHTS RESERVED</p>
        <p className={styles.colophonEnd}>—— 完 · FIN ——</p>
      </div>
    </div>
  )
}

/* 页内章节眉 */
function SheetHead({ no: label, en }: { no: string; en: string }) {
  return (
    <div className={styles.sheetHead}>
      <h2 className={styles.sheetHeadTitle}>{label}</h2>
      <span className={styles.sheetHeadEn}>{en}</span>
    </div>
  )
}
