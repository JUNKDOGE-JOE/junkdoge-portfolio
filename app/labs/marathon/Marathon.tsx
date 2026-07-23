'use client'
/* eslint-disable @next/next/no-img-element */
// MARATHON — 准上线候选：showreel 首屏 + 作品 / 关于 / 委托单页锚点
import { useEffect, useRef, useState, type ReactNode } from 'react'
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
    zh: '动效设计师 & 创意开发者 —— 以文字、映像与代码构建视觉。',
    en: 'Motion designer & creative developer — building visuals with type, image and code.',
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

  const email = site.about.links.find((l) => l.label === 'EMAIL')
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
        {email ? (
          <a className={styles.mrNavCta} href={email.href}>
            <Swap>{t(MR.ctaCollab)}</Swap>
          </a>
        ) : null}
      </nav>
    </header>
  )
}

/* ---------------- HERO: showreel 全 bleed + 贴底巨标 ---------------- */

function Hero() {
  const { t } = useLang()
  const visualRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const wordRef = useRef<HTMLHeadingElement>(null)
  const { src, poster } = site.showreel

  // 巨标精确拟合:实测 100px 基准字宽 → 换算 font-size,整词永远 ≤92vw
  useEffect(() => {
    const el = wordRef.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = '100px'
      const w = el.scrollWidth || 1
      const px = Math.min((window.innerWidth * 0.92 * 100) / w, window.innerHeight * 0.28)
      el.style.fontSize = `${px.toFixed(1)}px`
    }
    fit()
    window.addEventListener('resize', fit)
    document.fonts.ready.then(fit).catch(() => undefined)
    return () => window.removeEventListener('resize', fit)
  }, [])

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
          <p className={styles.mrHeroStatement}>
            <Swap>{t(MR.heroStatement)}</Swap>
          </p>
        </Reveal>
        <Reveal delay={180}>
          <a className={`${styles.mrBtn} ${styles.mrBtnAcid}`} href="#mr-works">
            <Swap>{t(MR.ctaWorks)}</Swap>
          </a>
        </Reveal>
      </div>

      <h1 ref={wordRef} className={styles.mrHeroWord}>
        {'JUNK_DOGE'}
      </h1>

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
  const email = site.about.links.find((l) => l.label === 'EMAIL')
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
          {email ? (
            <a className={`${styles.mrBtn} ${styles.mrBtnAcid}`} href={email.href}>
              <Swap>{t(MR.ctaCollab)}</Swap>
            </a>
          ) : null}
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

function Page() {
  const today = useToday()
  return (
    <main className={`${styles.mrRoot} ${anton.variable}`}>
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
