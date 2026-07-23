'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/content/projects'
import type { SiteData } from '@/lib/site'
import styles from './endfield.module.css'

const TYPE_EN: Record<Project['type'], string> = {
  pv: 'MUSIC VIDEO',
  vj: 'LIVE VISUAL',
  collab: 'COLLABORATION',
  dev: 'DEVELOPMENT',
}
const TYPE_ZH: Record<Project['type'], string> = {
  pv: '音乐映像',
  vj: '现场视觉',
  collab: '合作企划',
  dev: '工具开发',
}

const SLICES = 6
const LOCK_MS = 620
const pad = (n: number) => String(n).padStart(2, '0')

/* ── 通用小件 ─────────────────────────────────────────── */

/** 四角 HUD 取景刻度 */
function Hud() {
  return (
    <>
      <i aria-hidden className={`${styles.hud} ${styles.hudTl}`} />
      <i aria-hidden className={`${styles.hud} ${styles.hudTr}`} />
      <i aria-hidden className={`${styles.hud} ${styles.hudBl}`} />
      <i aria-hidden className={`${styles.hud} ${styles.hudBr}`} />
    </>
  )
}

/** CMYK 印刷测试色带 */
function Cmyk({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`${styles.cmyk} ${className}`}>
      <i className={styles.cmykC} />
      <i className={styles.cmykM} />
      <i className={styles.cmykY} />
      <i className={styles.cmykK} />
    </div>
  )
}

function LinkBtn({ href, label }: { href: string; label: string }) {
  return (
    <a className={styles.btn} href={href} target="_blank" rel="noreferrer">
      <span aria-hidden className={styles.btnTri} />
      {label}
    </a>
  )
}

/* ── 各屏内容 ─────────────────────────────────────────── */

function HeroScreen({ tagline, total }: { tagline: string; total: number }) {
  return (
    <div className={styles.hero}>
      <Hud />
      <div aria-hidden className={styles.heroCoord}>
        <span>LAT 31.2304° N</span>
        <span>LON 121.4737° E</span>
        <span>FIG. 01 — OPERATOR PROFILE</span>
      </div>
      <Cmyk className={styles.heroCmyk} />
      <div aria-hidden className={`${styles.cross} ${styles.crossA}`}>+</div>
      <div aria-hidden className={`${styles.cross} ${styles.crossB}`}>+</div>
      <div aria-hidden className={styles.heroScan} />

      <p className={styles.heroKicker}>
        <span className={styles.en}>PIONEER PROTOCOL — PERSONAL ARCHIVE</span>
        <span className={styles.zhDim}>拓荒者档案 / 个人主页</span>
      </p>
      <h1 className={styles.heroTitle}>
        JUNK<span className={styles.heroUnderscore}>_</span>DOGE
        <span aria-hidden className={styles.heroTri} />
      </h1>
      <p className={styles.heroTagline}>{tagline}</p>
      <p className={styles.heroTagEn}>TYPE × MOTION × CODE — PV / VJ / CREATIVE DEVELOPMENT</p>
      <div className={styles.heroMeta}>
        <span><b>STATUS</b> OPEN FOR COMMISSION</span>
        <span><b>CLASS</b> MOTION DESIGNER / CREATIVE DEV</span>
        <span><b>SCREENS</b> {pad(total)} PANELS</span>
      </div>
      <p className={styles.heroHint}>
        <span aria-hidden className={styles.triDownS} />
        WHEEL / SWIPE / ARROW KEYS
        <span className={styles.zhDim}>滚轮 · 滑动 · 方向键 切屏</span>
      </p>
    </div>
  )
}

function WorkScreen({ p, no, total }: { p: Project; no: number; total: number }) {
  return (
    <div className={styles.workScreen} style={{ '--acc': p.accent ?? '#F5D110' } as React.CSSProperties}>
      {/* 封面压暗 / 双色调全屏底图 */}
      <img src={p.cover} alt="" className={styles.workBg} />
      <div aria-hidden className={styles.workTint} />
      <div aria-hidden className={styles.workShade} />
      <Hud />
      <div aria-hidden className={`${styles.cross} ${styles.crossA}`}>+</div>

      <div aria-hidden className={styles.workBig}>
        {pad(no)}
        <span>/{pad(total)}</span>
      </div>

      <div className={styles.workPanel}>
        <div className={styles.workType}>
          <span className={styles.en}>{TYPE_EN[p.type]}</span>
          <span className={styles.zhDim}>{TYPE_ZH[p.type]}</span>
          <span aria-hidden className={styles.workAccTri} />
        </div>
        <h2 className={styles.workTitle}>
          {p.title.zh}
          <span className={styles.workTitleEn}>{p.title.en}</span>
        </h2>
        <dl className={styles.workFields}>
          <div><dt>ROLE / 职责</dt><dd>{p.role.zh}</dd></div>
          <div><dt>YEAR / 年份</dt><dd className={styles.num}>{p.year}</dd></div>
        </dl>
        {p.desc.zh ? <p className={styles.workDesc}>{p.desc.zh}</p> : null}
        <div className={styles.workLinks}>
          {p.links.bilibili ? <LinkBtn href={p.links.bilibili} label="BILIBILI" /> : null}
          {p.links.github ? <LinkBtn href={p.links.github} label="GITHUB" /> : null}
          {p.links.external ? <LinkBtn href={p.links.external} label="LINK" /> : null}
        </div>
      </div>

      <div aria-hidden className={styles.workFoot}>
        <span>FIG. {pad(no)} — {p.title.en}</span>
        <span className={styles.workAccBar} />
      </div>
    </div>
  )
}

function AboutScreen({ site }: { site: SiteData }) {
  return (
    <div className={`${styles.plain} ${styles.scrollable}`}>
      <Hud />
      <header className={styles.plainHead}>
        <span className={styles.plainNo}>{pad(13)}</span>
        <span className={styles.en}>OPERATOR FILE</span>
        <span className={styles.zhDim}>关于本人</span>
        <span aria-hidden className={styles.plainRule} />
        <span aria-hidden className={styles.tri} />
      </header>
      <div className={styles.aboutGrid}>
        <dl className={styles.specTable}>
          <div><dt>NAME / 代号</dt><dd>JUNK_DOGE</dd></div>
          <div><dt>CLASS / 职能</dt><dd>动效设计师 · 创意开发者</dd></div>
          <div><dt>FIELD / 领域</dt><dd>PV / VJ / BGA / 创意工具</dd></div>
          <div><dt>STATUS / 状态</dt><dd><i aria-hidden className={styles.dotLive} />接受委托中</dd></div>
        </dl>
        <div>
          <div className={styles.bio}>
            {site.about.bio.zh.split('\n').map((line, i) =>
              line.trim() ? <p key={i}>{line}</p> : null,
            )}
          </div>
          <div className={styles.aboutLinks}>
            {site.about.links.map((l) => (
              <LinkBtn key={l.label} href={l.href} label={l.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CommissionScreen({ site }: { site: SiteData }) {
  return (
    <div className={`${styles.plain} ${styles.light} ${styles.scrollable}`}>
      <Hud />
      <Cmyk className={styles.lightCmyk} />
      <header className={styles.plainHead}>
        <span className={styles.plainNo}>{pad(14)}</span>
        <span className={styles.en}>COMMISSION SHEET</span>
        <span className={styles.zhDim}>委托报价</span>
        <span aria-hidden className={styles.plainRule} />
        <span aria-hidden className={styles.tri} />
      </header>
      <div className={styles.tierTable}>
        <div className={`${styles.tierRow} ${styles.tierHead}`}>
          <span className={styles.en}>ITEM / 项目</span>
          <span className={styles.en}>QUOTE / 报价</span>
        </div>
        {site.commission.tiers.map((t, i) => (
          <div className={styles.tierRow} key={i}>
            <span className={styles.tierK}>
              <span aria-hidden className={styles.tierTri} />
              {t.k}
              {t.kEn ? <span className={styles.tierKEn}>{t.kEn}</span> : null}
            </span>
            <span className={styles.tierV}>
              <b className={styles.num}>{t.zh}</b>
              <span className={styles.tierVEn}>{t.en}</span>
            </span>
          </div>
        ))}
      </div>
      <div className={styles.contact}>
        <span aria-hidden className={styles.contactTri} />
        <div>
          <p className={styles.en}>CONTACT / 联系方式</p>
          <p className={styles.contactLine}>{site.commission.contact}</p>
        </div>
      </div>
    </div>
  )
}

function FooterScreen({ year }: { year: number }) {
  return (
    <div className={styles.footerScr}>
      <Hud />
      <div aria-hidden className={`${styles.cross} ${styles.crossA}`}>+</div>
      <p className={styles.footerBig}>
        END OF TRANSMISSION
        <span className={styles.footerBigZh}>传输结束 / 感谢检阅</span>
      </p>
      <div className={styles.footGrid}>
        <span className={styles.num}>© {year} JUNK_DOGE</span>
        <span className={styles.zhDim}>终末地整屏实验 / ENDFIELD FULLPAGE LAB</span>
        <Link className={styles.btn} href="/">
          <span aria-hidden className={styles.btnTri} />
          BACK TO BASE / 返回主站
        </Link>
      </div>
      <div aria-hidden className={styles.heroCoord}>
        <span>ARCHIVE CLOSED</span>
        <span>SIGNAL LOST — 00:00:00</span>
      </div>
    </div>
  )
}

/* ── 整屏 cinema 主控 ─────────────────────────────────── */

export function EndfieldCinema({
  works,
  site,
  buildYear,
}: {
  works: Project[]
  site: SiteData
  buildYear: number
}) {
  const total = works.length + 4 // 01 hero + 作品 + about + commission + footer
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [dir, setDir] = useState(1)
  const [reduced, setReduced] = useState(false)
  const indexRef = useRef(0)
  const lockRef = useRef(false)
  const wheelAcc = useRef(0)
  const touchY = useRef<number | null>(null)

  const go = useCallback(
    (target: number, d?: number) => {
      if (lockRef.current) return
      const t = Math.max(0, Math.min(total - 1, target))
      if (t === indexRef.current) return
      lockRef.current = true
      setDir(d ?? (t > indexRef.current ? 1 : -1))
      setPrev(indexRef.current)
      indexRef.current = t
      setIndex(t)
      window.setTimeout(() => {
        setPrev(null)
        lockRef.current = false
      }, LOCK_MS)
    },
    [total],
  )

  /* prefers-reduced-motion → 退化为普通垂直滚动 */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* 键盘 */
  useEffect(() => {
    if (reduced) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        go(indexRef.current + 1, 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        go(indexRef.current - 1, -1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        go(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        go(total - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, reduced, total])

  const onWheel = (e: React.WheelEvent) => {
    if (reduced) return
    if (lockRef.current) {
      wheelAcc.current = 0
      return
    }
    wheelAcc.current += e.deltaY
    if (Math.abs(wheelAcc.current) < 70) return
    const d = wheelAcc.current > 0 ? 1 : -1
    wheelAcc.current = 0
    go(indexRef.current + d, d)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchY.current = e.touches[0]?.clientY ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (reduced || touchY.current === null) return
    const dy = touchY.current - (e.changedTouches[0]?.clientY ?? touchY.current)
    touchY.current = null
    if (Math.abs(dy) < 48) return
    const d = dy > 0 ? 1 : -1
    go(indexRef.current + d, d)
  }

  const renderScreen = (i: number) => {
    if (i === 0) return <HeroScreen tagline={site.misc.homeTagline} total={total} />
    if (i <= works.length) return <WorkScreen p={works[i - 1]} no={i + 1} total={total} />
    if (i === works.length + 1) return <AboutScreen site={site} />
    if (i === works.length + 2) return <CommissionScreen site={site} />
    return <FooterScreen year={buildYear} />
  }

  /* 降级模式：全部屏纵向平铺，正常滚动 */
  if (reduced) {
    return (
      <main className={styles.rootRed}>
        <div aria-hidden className={styles.noise} />
        {Array.from({ length: total }, (_, i) => (
          <section key={i} className={styles.screenRed} aria-label={`第 ${i + 1} 屏`}>
            {renderScreen(i)}
          </section>
        ))}
      </main>
    )
  }

  const transitioning = prev !== null

  return (
    <main
      className={styles.root}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ '--dir': dir } as React.CSSProperties}
    >
      <div aria-hidden className={styles.noise} />

      {/* 屏层：前一屏垫底，当前屏切片进入 */}
      {transitioning && (
        <section aria-hidden className={`${styles.screen} ${styles.screenPrev}`}>
          {renderScreen(prev)}
        </section>
      )}
      <section
        key={index}
        className={`${styles.screen} ${styles.screenActive} ${transitioning ? styles.screenIn : ''}`}
        aria-label={`第 ${index + 1} 屏 / 共 ${total} 屏`}
      >
        {renderScreen(index)}
      </section>

      {/* 切片错位 + 扫描线闪现的硬过渡 */}
      {transitioning && (
        <div aria-hidden className={styles.slices}>
          {Array.from({ length: SLICES }, (_, i) => (
            <i key={i} className={styles.slice} style={{ animationDelay: `${i * 42}ms` }} />
          ))}
          <b className={styles.scanFlash} />
        </div>
      )}

      {/* 常驻右侧刻度进度轨 */}
      <nav className={styles.rail} aria-label="屏序号导航">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-current={i === index}
            aria-label={`跳转到第 ${i + 1} 屏`}
            className={i === index ? styles.railBtnCur : styles.railBtn}
          >
            <span aria-hidden className={styles.railTri} />
            {pad(i + 1)}
          </button>
        ))}
      </nav>

      {/* prev/next 三角 + 当前屏号 */}
      <div className={styles.navBtns}>
        <button type="button" className={styles.navBtn} aria-label="上一屏" onClick={() => go(indexRef.current - 1, -1)}>
          <i aria-hidden className={styles.triUp} />
        </button>
        <span className={styles.navIdx}>
          {pad(index + 1)}
          <em>/{pad(total)}</em>
        </span>
        <button type="button" className={styles.navBtn} aria-label="下一屏" onClick={() => go(indexRef.current + 1, 1)}>
          <i aria-hidden className={styles.triDown} />
        </button>
      </div>
    </main>
  )
}
