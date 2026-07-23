'use client'
/* eslint-disable @next/next/no-img-element */
// MARATHON — 准上线候选：showreel 首屏 + 作品 / 关于 / 委托单页锚点
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react'
import { projects, type Localized } from '@/content/projects'
import { site } from '@/lib/site'
import { LangProvider, useLang, ui } from '@/lib/i18n'
import { LetterSwap } from '@/components/LetterSwap'
import { anton } from './fonts'
import { Reveal, useToday, pad2 } from './bits'
import { StickyWorks } from './StickyWorks'
import styles from './marathon.module.css'

const WORKS = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order)

const SECTION_IDS = ['mr-works', 'mr-about', 'mr-commission'] as const
type SectionId = (typeof SECTION_IDS)[number]

/* 本地 UI 字典(项目数据之外的双语标签) */
const MR = {
  ctaWorks: { zh: '查看作品 ↓', en: 'VIEW WORKS ↓' },
  ctaCollab: { zh: '委托合作 ↗', en: 'COMMISSION ↗' },
  heroStatement: {
    zh: '你好，我是 JUNK_DOGE。\nMotion Designer & 创意开发',
    en: "Hi, I'm JUNK_DOGE.\nMotion Designer & Creative Developer",
  },
  aboutTitle: { zh: '文字 × 映像 × 代码', en: 'TYPE × IMAGE × CODE' },
  secAbout: { zh: '02 / 关于', en: '02 / ABOUT' },
  secCommission: { zh: '03 / 委托', en: '03 / COMMISSION' },
  files: { zh: '项目档案', en: 'PROJECT FILES' },
  social: { zh: '社交媒体', en: 'SOCIAL MEDIA' },
  scroll: { zh: '向下滚动', en: 'SCROLL' },
} satisfies Record<string, Localized>

/** 马拉松 About 呈现：去掉行首 emoji，减轻堆叠感 */
function stripBioEmoji(text: string) {
  return text
    .split('\n')
    .map((line) => line.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '').trimEnd())
    .join('\n')
    .replace(/^\n+/, '')
}

/* 语言切换时的快速遮罩交换:key 重挂载触发 150ms 擦入 */
function Swap({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { lang } = useLang()
  return (
    <span key={lang} className={`${styles.mrSwap} ${className}`}>
      {children}
    </span>
  )
}

/* ---------------- 联系方式展开菜单 ---------------- */

function ContactLauncher({ inline = false }: { inline?: boolean }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={wrapRef}
      className={`${styles.mrContactLauncher} ${inline ? styles.mrContactLauncherInline : ''}`}
    >
      <button
        type="button"
        className={inline ? `${styles.mrBtn} ${styles.mrBtnAcid}` : styles.mrNavCta}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Swap>{t(MR.ctaCollab)}</Swap>
      </button>
      {open ? (
        <div id={menuId} className={styles.mrContactOptions} role="menu">
          {site.commission.channels.map((channel) => {
            const external = channel.href.startsWith('http')
            return (
              <a
                key={channel.label}
                className={styles.mrContactOption}
                href={channel.href}
                role="menuitem"
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={() => setOpen(false)}
              >
                <span>{channel.label}</span>
                <small>{channel.value}</small>
                <b aria-hidden>{'↗'}</b>
              </a>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

/* ---------------- 固定顶部导航 + 当前段高亮 ---------------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<SectionId | null>(null)
  const { t, lang, toggle } = useLang()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el,
    )
    if (!nodes.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (top?.target?.id && SECTION_IDS.includes(top.target.id as SectionId)) {
          setActive(top.target.id as SectionId)
        }
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0, 0.15, 0.35, 0.55] },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  const linkClass = (id: SectionId) =>
    `${styles.mrNavLink} ${active === id ? styles.mrNavLinkOn : ''}`

  return (
    <header className={`${styles.mrNav} ${scrolled ? styles.mrNavScrolled : ''}`}>
      <a className={styles.mrNavLogo} href="#mr-top">
        {'JUNK_DOGE'}
      </a>
      <nav className={styles.mrNavLinks}>
        <a className={linkClass('mr-works')} href="#mr-works">
          <LetterSwap label={t(ui.works)} />
        </a>
        <a className={linkClass('mr-about')} href="#mr-about">
          <LetterSwap label={t(ui.about)} />
        </a>
        <a className={linkClass('mr-commission')} href="#mr-commission">
          <LetterSwap label={t(ui.commission)} />
        </a>
        <button
          type="button"
          className={styles.mrNavLang}
          onClick={toggle}
          aria-label="语言切换 / Switch language"
        >
          <span className={lang === 'zh' ? styles.mrNavLangOn : undefined}>{'中'}</span>
          <span aria-hidden>{' / '}</span>
          <span className={lang === 'en' ? styles.mrNavLangOn : undefined}>{'EN'}</span>
        </button>
        <ContactLauncher />
      </nav>
    </header>
  )
}

/* ---------------- HERO: showreel 全 bleed + 自我介绍 ---------------- */

function Hero() {
  const { t } = useLang()
  const visualRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { src, poster } = site.showreel

  // 视差 + reduced-motion 时停视差并暂停自动播放
  useEffect(() => {
    const el = visualRef.current
    const video = videoRef.current
    if (!el) return
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncMotion = () => {
      if (mqReduce.matches) {
        el.style.transform = ''
        if (video) {
          video.pause()
          video.removeAttribute('autoplay')
        }
        return
      }
      if (video && video.paused) {
        video.play().catch(() => undefined)
      }
    }

    let raf = 0
    const update = () => {
      raf = 0
      if (mqReduce.matches) return
      const y = Math.min(window.scrollY, window.innerHeight)
      el.style.transform = `translate3d(0, ${Math.round(y * 0.22)}px, 0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    syncMotion()
    mqReduce.addEventListener('change', syncMotion)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      mqReduce.removeEventListener('change', syncMotion)
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section id="mr-top" className={styles.mrHero}>
      <div ref={visualRef} className={styles.mrHeroVisual}>
        <video
          ref={videoRef}
          className={styles.mrHeroVideo}
          src={src}
          poster={poster}
          muted
          playsInline
          loop
          autoPlay
          preload="metadata"
          aria-label="JUNK_DOGE showreel"
        />
      </div>

      <div className={styles.mrHeroContent}>
        <Reveal delay={90}>
          <h1 className={styles.mrHeroStatement}>
            <Swap>{t(MR.heroStatement)}</Swap>
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <a className={`${styles.mrBtn} ${styles.mrBtnAcid}`} href="#mr-works">
            <Swap>{t(MR.ctaWorks)}</Swap>
          </a>
        </Reveal>
      </div>

      <a className={styles.mrScrollCue} href="#mr-works" aria-label={t(MR.scroll)}>
        <span className={styles.mrScrollLabel}>
          <Swap>{t(MR.scroll)}</Swap>
        </span>
        <span className={styles.mrScrollLine} aria-hidden />
      </a>
    </section>
  )
}

/* ---------------- ABOUT: 02 编号 + 正文 + SPEC ---------------- */

const SPEC_ROWS: { k: string; v: Localized }[] = [
  { k: 'Designation // 身份', v: { zh: '动效设计师 · 创意开发者 · 开源爱好者', en: 'Motion designer · Creative developer · OSS enthusiast' } },
  { k: 'Focus // 领域', v: { zh: '视频制作 / 视觉设计 / 创意工具开发', en: 'Video / Visual design / Creative tooling' } },
  { k: 'Side Ops // 副业', v: { zh: 'AE 插件 · 视觉增强工具 · AI 工作流', en: 'AE plugins · Visual tools · AI workflows' } },
  { k: 'Status // 状态', v: { zh: '实习中 · OPEN FOR COMMISSION', en: 'Internship · OPEN FOR COMMISSION' } },
]

function About() {
  const { t, lang } = useLang()
  const bio = stripBioEmoji(t(site.about.bio))
  return (
    <section id="mr-about" className={styles.mrAbout}>
      <Reveal>
        <div className={styles.mrKicker}>
          <Swap>{t(MR.secAbout)}</Swap>
        </div>
      </Reveal>
      <Reveal delay={70}>
        <h2 className={styles.mrSecTitle}>
          <Swap>{t(MR.aboutTitle)}</Swap>
        </h2>
      </Reveal>

      <div className={styles.mrAboutGrid}>
        <Reveal delay={140}>
          <div>
            <p className={styles.mrBody} key={lang}>
              {bio}
            </p>
            <div className={styles.mrAboutLinks}>
              {site.about.links.map((l) => (
                <a
                  key={l.label}
                  className={`${styles.mrBtn} ${styles.mrBtnGhost}`}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {`${l.label} ↗`}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={210}>
          <div className={styles.mrSpec}>
            {SPEC_ROWS.map((r) => (
              <div key={r.k} className={styles.mrSpecRow}>
                <span className={styles.mrSpecKey}>{r.k}</span>
                <span className={styles.mrSpecVal}>
                  <Swap>{t(r.v)}</Swap>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------------- COMMISSION: 03 编号 + 白底反转 + 统一 CTA ---------------- */

function Commission() {
  const { t, lang } = useLang()
  return (
    <section id="mr-commission" className={styles.mrWhite}>
      <Reveal>
        <div className={styles.mrKicker}>
          <Swap>{t(MR.secCommission)}</Swap>
        </div>
      </Reveal>
      <Reveal delay={70}>
        <h2 className={styles.mrSecTitle}>
          {'委托'} <em>{'COMMISSION'}</em>
        </h2>
      </Reveal>

      {site.commission.lead ? (
        <Reveal delay={130}>
          <p className={styles.mrLead}>
            <Swap>{t(site.commission.lead)}</Swap>
          </p>
        </Reveal>
      ) : null}

      <div className={styles.mrTiers}>
        {site.commission.tiers.map((tier, i) => {
          const name = lang === 'zh' ? tier.k : tier.kEn ?? tier.k
          const sub = lang === 'zh' ? tier.kEn : tier.kEn ? tier.k : undefined
          const price = lang === 'zh' ? tier.zh : tier.en
          const priceSub = lang === 'zh' ? tier.en : tier.zh
          return (
            <Reveal key={tier.k} delay={i * 70}>
              <div className={styles.mrTier}>
                <span className={styles.mrTierNo}>{`T-${pad2(i + 1)}`}</span>
                <div>
                  <div className={styles.mrTierName}>
                    <Swap>{name}</Swap>
                  </div>
                  {sub ? <div className={styles.mrTierNameEn}>{sub}</div> : null}
                </div>
                <div className={styles.mrTierPrice}>
                  <div>
                    <Swap>{price}</Swap>
                  </div>
                  <div className={styles.mrTierPriceEn}>{priceSub}</div>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={140}>
        <div className={styles.mrContact}>
          <div>
            <small>{'CONTACT // 联系方式'}</small>
            {site.commission.contact}
          </div>
          <ContactLauncher inline />
        </div>
      </Reveal>
    </section>
  )
}

/* ---------------- FOOTER ---------------- */

function Footer({ today }: { today: string }) {
  const { t } = useLang()
  return (
    <footer className={styles.mrFooter}>
      <Reveal>
        <div className={styles.mrKicker}>
          <span>{`( ${pad2(WORKS.length)} ) // PROJECT FILES`}</span>
        </div>
      </Reveal>

      <div className={styles.mrFootGrid}>
        <div className={styles.mrFootCol}>
          <h3 className={styles.mrFootHead}>
            <Swap>{t(MR.files)}</Swap>
          </h3>
          {WORKS.map((p) => (
            <a key={p.slug} className={styles.mrFootLink} href="#mr-works">
              {`${p.title.zh} — ${p.title.en}`}
            </a>
          ))}
        </div>
        <div className={styles.mrFootCol}>
          <h3 className={styles.mrFootHead}>
            <Swap>{t(MR.social)}</Swap>
          </h3>
          {site.about.links.map((l) => (
            <a key={l.label} className={styles.mrFootLink} href={l.href} target="_blank" rel="noreferrer">
              {`${l.label} ↗`}
            </a>
          ))}
        </div>
        <p className={styles.mrFootMotto}>{site.misc.homeTagline}</p>
      </div>

      <div className={styles.mrFootMeta}>
        <span>{`© ${today ? today.slice(-4) : '────'} JUNK_DOGE — ALL SIGNALS RESERVED`}</span>
        <span>
          {'END OF TRANSMISSION '} <span className={styles.mrEndMark}>{'▮'}</span>
        </span>
      </div>
    </footer>
  )
}

/* ---------------- root ---------------- */

function useMarathonPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let autoScrolling = false
    let scrollRaf = 0
    let snapSuppressedUntil = 0
    let lastY = window.scrollY
    let lastScrollTime = performance.now()
    let scrollVelocity = 0
    let direction = 0

    const cancelAutoScroll = () => {
      const wasActive = autoScrolling || scrollRaf !== 0
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
      scrollRaf = 0
      autoScrolling = false
      if (wasActive) snapSuppressedUntil = performance.now() + 420
      lastY = window.scrollY
      lastScrollTime = performance.now()
    }

    const scrollToSection = (
      target: HTMLElement,
      hash?: string,
      kind: 'anchor' | 'snap' = 'anchor',
    ) => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
      autoScrolling = true
      if (hash && window.location.hash !== hash) {
        window.history.pushState(null, '', hash)
      }

      const startY = window.scrollY
      const targetTop = target.getBoundingClientRect().top + startY
      const scrollMargin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0
      const targetY = Math.max(0, targetTop - scrollMargin)
      const distance = targetY - startY

      if (reduceMotion.matches || Math.abs(distance) < 1) {
        window.scrollTo(0, targetY)
        autoScrolling = false
        lastY = window.scrollY
        return
      }

      // 自动吸附比导航更慢；Hermite 曲线将滚轮末速度接进动画，
      // 起点不顿、终点速度归零，形成逐渐收拢的“磁吸”。
      const duration =
        kind === 'snap'
          ? Math.min(720, 460 + Math.abs(distance) * 0.32)
          : Math.min(850, 560 + Math.abs(distance) * 0.14)
      const carriedVelocity = Math.sign(scrollVelocity) === Math.sign(distance) ? scrollVelocity : 0
      const startSlope = Math.min(
        2.35,
        Math.max(0.42, Math.abs(distance) > 1 ? Math.abs((carriedVelocity * duration) / distance) : 0.42),
      )
      const startedAt = performance.now()

      const tick = (now: number) => {
        const t = Math.min(1, (now - startedAt) / duration)
        const t2 = t * t
        const t3 = t2 * t
        const progress = -2 * t3 + 3 * t2 + startSlope * (t3 - 2 * t2 + t)
        window.scrollTo(0, startY + distance * progress)

        if (t < 1) {
          scrollRaf = requestAnimationFrame(tick)
          return
        }
        scrollRaf = 0
        window.scrollTo(0, targetY)
        autoScrolling = false
        lastY = window.scrollY
        lastScrollTime = performance.now()
        scrollVelocity = 0
      }

      scrollRaf = requestAnimationFrame(tick)
    }

    const onAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor || !root.contains(anchor)) return
      const hash = anchor.getAttribute('href')
      if (!hash || hash === '#') return
      const target = document.getElementById(hash.slice(1))
      if (!target) return
      event.preventDefault()
      scrollToSection(target, hash)
    }

    const evaluateSnap = () => {
      if (
        autoScrolling ||
        performance.now() < snapSuppressedUntil ||
        document.body.style.overflow === 'hidden'
      ) {
        return
      }
      const hero = document.getElementById('mr-top')
      const works = document.getElementById('mr-works')
      const about = document.getElementById('mr-about')
      if (!hero || !works || !about || direction === 0) return

      const y = window.scrollY
      const anchors = [hero, works, about]
      for (let i = 0; i < anchors.length - 1; i++) {
        const current = anchors[i]
        const next = anchors[i + 1]
        const currentTop = current.offsetTop
        const nextTop = next.offsetTop
        if (y <= currentTop + 2 || y >= nextTop - 2) continue

        const midpoint = currentTop + (nextTop - currentTop) / 2
        if (direction > 0 && y >= midpoint) {
          scrollToSection(next, undefined, 'snap')
        } else if (direction < 0 && y <= midpoint) {
          scrollToSection(current, undefined, 'snap')
        }
        break
      }
    }

    const onScroll = () => {
      const y = window.scrollY
      const now = performance.now()
      if (!autoScrolling && Math.abs(y - lastY) > 1) {
        direction = y > lastY ? 1 : -1
        const elapsed = Math.max(8, now - lastScrollTime)
        const instantVelocity = (y - lastY) / elapsed
        scrollVelocity = scrollVelocity * 0.55 + instantVelocity * 0.45
      }
      lastY = y
      lastScrollTime = now
      if (autoScrolling) return
      // 越过一半阈值的同一帧就接管，不等待“滚动停止”，
      // Hermite 起始斜率会直接续上刚刚测得的滚轮速度。
      evaluateSnap()
    }

    root.addEventListener('click', onAnchorClick)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', cancelAutoScroll, { passive: true })
    window.addEventListener('touchstart', cancelAutoScroll, { passive: true })
    return () => {
      root.removeEventListener('click', onAnchorClick)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', cancelAutoScroll)
      window.removeEventListener('touchstart', cancelAutoScroll)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
    }
  }, [rootRef])
}

function Page() {
  const today = useToday()
  const rootRef = useRef<HTMLElement>(null)
  useMarathonPageMotion(rootRef)

  return (
    <main ref={rootRef} className={`${styles.mrRoot} ${anton.variable}`}>
      <Nav />
      <Hero />
      <StickyWorks />
      <About />
      <Commission />
      <Footer today={today} />
    </main>
  )
}

export function Marathon() {
  return (
    <LangProvider>
      <Page />
    </LangProvider>
  )
}
