# JUNK_DOGE 个人主页 v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a federicopian-structured, content-driven animated personal homepage for JUNK_DOGE (映像创作者 × 创意开发者): a fixed-viewport single-project carousel of 9 works, bilingual (中/EN), with preloader and GSAP transitions, plus /about and /commission pages.

**Architecture:** Next.js App Router + TypeScript. Pure logic (data selection, i18n, carousel index math, clock formatting) lives in `lib/` as unit-tested functions. Visual is composed from small client components; each carousel slide picks a *skin* by project type (影像 = blurred cover image + circle crop; dev = light background). Animation via GSAP, smooth scroll via Lenis. No WebGL/R3F in v1.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, GSAP, Lenis, `next/font` (Noto Sans SC), Vitest + React Testing Library (jsdom).

**Reference spec:** `docs/superpowers/specs/2026-06-17-junkdoge-homepage-design.md`

**Conventions:** Windows + PowerShell. Path alias `@/*` → project root. Commit after every task. Manual visual checks: `npm run dev` → open `http://localhost:3000`; an agent can verify with the `chrome-devtools` MCP (navigate + screenshot).

---

## Phase A — Foundation

### Task 1: Scaffold Next.js app + git

**Files:**
- Create: whole Next.js scaffold in `E:\Code\个人主页`
- Create: `.gitignore` (from scaffold)

- [ ] **Step 1: Scaffold into the current (empty) directory**

Run (in `E:\Code\个人主页`):
```powershell
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack
```
Answer prompts with defaults. Expected: `package.json`, `app/`, `tailwind` config, `tsconfig.json` created.

- [ ] **Step 2: Initialize git and make the first commit**

```powershell
git init
git add -A
git commit -m "chore: scaffold Next.js app"
```
Expected: commit succeeds.

- [ ] **Step 3: Add the brainstorm artifacts to .gitignore and verify dev server boots**

Append to `.gitignore`:
```
# brainstorming companion
.superpowers/
```
Run:
```powershell
npm run dev
```
Expected: server boots at `http://localhost:3000`. Stop it (Ctrl+C) after confirming.

- [ ] **Step 4: Commit**

```powershell
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm dir"
```

---

### Task 2: Install runtime deps + design tokens + font

**Files:**
- Modify: `package.json` (deps)
- Modify: `app/globals.css` (tokens)
- Modify: `app/layout.tsx` (font + lang)

- [ ] **Step 1: Install libraries**

```powershell
npm install gsap lenis clsx
```
Expected: added to `package.json` dependencies.

- [ ] **Step 2: Add CSS design tokens**

Replace the `:root` / theme block near the top of `app/globals.css` with (keep Tailwind's `@import`/`@tailwind` lines already present above it):
```css
:root {
  --bone: #efe9e3;          /* light skin bg */
  --ink: #1c1a17;           /* light skin text */
  --night: #06060c;         /* dark skin bg */
  --paper-text: #f1eee8;    /* dark skin text */
  --cyan: #36e6ff;
  --magenta: #ff2fd0;
  --furniture: #7c756d;     /* corner labels on light */
  --furniture-dark: #9fb1c6;/* corner labels on dark */
}
html, body { height: 100%; }
body { background: var(--night); color: var(--paper-text); overflow: hidden; }
.ui-label { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; }
.display-italic { font-style: italic; }
```

- [ ] **Step 3: Load Noto Sans SC via next/font and set lang**

Replace `app/layout.tsx` with:
```tsx
import type { Metadata } from 'next'
import { Noto_Sans_SC } from 'next/font/google'
import './globals.css'

const noto = Noto_Sans_SC({ subsets: ['latin'], weight: ['400', '500', '700', '900'], variable: '--font-noto' })

export const metadata: Metadata = {
  title: 'JUNK_DOGE — 映像创作 × 创意开发',
  description: 'PV / VJ / 映像创作 and creative development by JUNK_DOGE.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className={noto.variable} style={{ fontFamily: 'var(--font-noto), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "chore: deps, design tokens, Noto Sans SC font"
```

---

### Task 3: Testing setup (Vitest + RTL)

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (scripts + devDeps)
- Test: `lib/smoke.test.ts`

- [ ] **Step 1: Install test deps**

```powershell
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], globals: true },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
})
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Add test script** to `package.json` `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test** `lib/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
describe('smoke', () => { it('runs', () => { expect(1 + 1).toBe(2) }) })
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "test: add vitest + RTL setup"
```

---

### Task 4: Content data model + home-project selection (TDD)

**Files:**
- Create: `content/projects.ts`
- Create: `lib/projects.ts`
- Test: `lib/projects.test.ts`

- [ ] **Step 1: Define the data model and the 9 projects** `content/projects.ts`:
```ts
export type ProjectType = 'pv' | 'vj' | 'collab' | 'dev'
export interface Localized { zh: string; en: string }
export interface ProjectLinks { bilibili?: string; github?: string; external?: string }
export interface Project {
  slug: string
  type: ProjectType
  featured: boolean
  order: number
  year: string
  title: Localized
  role: Localized
  desc: Localized
  cover: string            // path under /public, e.g. /covers/fusang.jpg
  devVisual?: string       // circle visual for dev projects
  accent?: string          // optional UI tint
  links: ProjectLinks
}

export const projects: Project[] = [
  { slug: 'fusang', type: 'pv', featured: true, order: 1, year: '2024',
    title: { zh: '扶桑', en: 'THE FUSOR ARBOR' }, role: { zh: 'PV · BOF21', en: 'PV · BOF21' },
    desc: { zh: '为 BOF21 制作的影像作品，文字与映像一体的视觉叙事。', en: 'A visual piece made for BOF21 — typography and motion as one narrative.' },
    cover: '/covers/fusang.jpg', links: { bilibili: 'https://www.bilibili.com/video/BV126WEz3EjX/' } },

  { slug: 'mirror-tower', type: 'pv', featured: true, order: 2, year: '2024',
    title: { zh: '镜之塔', en: 'Tales of Endless Tower' }, role: { zh: 'PV · 音游', en: 'PV · Rhythm Game' },
    desc: { zh: '音乐游戏《镜之塔》PV 第一部分。', en: 'Promo video for the rhythm game Mirror Tower, part one.' },
    cover: '/covers/mirror-tower.jpg', links: { bilibili: 'https://www.bilibili.com/video/BV1XhSXYKEyM/' } },

  { slug: 'centripetal-force', type: 'pv', featured: true, order: 3, year: '2023',
    title: { zh: 'Centripetal Force', en: 'Centripetal Force' }, role: { zh: 'PV · BOF:TT', en: 'PV · BOF:TT' },
    desc: { zh: '为 BOF:TT 制作的影像作品。', en: 'A visual piece made for BOF:TT.' },
    cover: '/covers/centripetal-force.jpg', links: { bilibili: '' } },

  { slug: 'pojin', type: 'pv', featured: true, order: 4, year: '2025',
    title: { zh: '破禁 先行PV', en: 'PoJin — Teaser PV' }, role: { zh: 'PV · 独立游戏', en: 'PV · Indie Game' },
    desc: { zh: '独立游戏《破禁》先行 PV。', en: 'Teaser PV for the indie game PoJin.' },
    cover: '/covers/pojin.jpg', links: { external: 'https://www.xiaohongshu.com/explore/68de4490000000000700e4f7' } },

  { slug: 'yu', type: 'pv', featured: true, order: 5, year: '2024',
    title: { zh: '融っ', en: '融っ / original song' }, role: { zh: 'PV · 原创曲', en: 'PV · Original Song' },
    desc: { zh: '原创曲《融っ》影像。', en: 'Visual for the original song “融っ”.' },
    cover: '/covers/yu.jpg', links: { bilibili: 'https://www.bilibili.com/video/BV1WktCzDEdT/' } },

  { slug: 'sonnet-29', type: 'pv', featured: true, order: 6, year: '2024',
    title: { zh: '二十九行诗', en: 'Sonnet 29' }, role: { zh: 'PV · 春日限原创曲', en: 'PV · Original Song' },
    desc: { zh: '春日限原创曲《二十九行诗》影像。', en: 'Visual for the original spring-themed song “Sonnet 29”.' },
    cover: '/covers/sonnet-29.jpg', links: { bilibili: 'https://www.bilibili.com/video/BV1yZKNecEp9/' } },

  { slug: 'lagtrain', type: 'pv', featured: true, order: 7, year: '2023',
    title: { zh: '延误列车', en: 'Lagtrain / ラグトレイン' }, role: { zh: '文字PV', en: 'Lyric / Kinetic PV' },
    desc: { zh: '《延误列车（ラグトレイン）》文字PV。', en: 'Kinetic-typography PV for “Lagtrain”.' },
    cover: '/covers/lagtrain.jpg', links: { bilibili: '' } },

  { slug: 'onpa', type: 'vj', featured: true, order: 8, year: '2024',
    title: { zh: '音波狂潮', en: 'Onpa Kyoushuu' }, role: { zh: 'VJ', en: 'VJ Set' },
    desc: { zh: '音波狂潮：荧光宇宙 & TANO*C TOUR 的 VJ 素材。', en: 'VJ visuals for Onpa Kyoushuu × TANO*C TOUR.' },
    cover: '/covers/onpa.jpg', links: { bilibili: 'https://www.bilibili.com/video/BV1jU411S7w3/' } },

  { slug: 'after-effects-mcp', type: 'dev', featured: true, order: 9, year: '2026',
    title: { zh: 'after-effects-mcp', en: 'after-effects-mcp' }, role: { zh: 'Dev · AE 自动化', en: 'Dev · AE Automation' },
    desc: { zh: 'Agent 驱动的 AE 自动化：MCP + CEP，让 AI 用 30+ 工具操控 After Effects。⭐22', en: 'Agent-driven After Effects automation: MCP + CEP plugin, 30+ ae.* tools. ⭐22' },
    cover: '/covers/aemcp.jpg', devVisual: '/covers/aemcp.jpg',
    links: { github: 'https://github.com/JUNKDOGE-JOE/after-effects-mcp' } },
]
```

- [ ] **Step 2: Write failing tests** `lib/projects.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { getHomeProjects, isImageSkin } from '@/lib/projects'
import type { Project } from '@/content/projects'

const mk = (slug: string, order: number, featured: boolean, type: Project['type'] = 'pv'): Project => ({
  slug, type, featured, order, year: '2024',
  title: { zh: slug, en: slug }, role: { zh: '', en: '' }, desc: { zh: '', en: '' },
  cover: `/covers/${slug}.jpg`, links: {},
})

describe('getHomeProjects', () => {
  it('returns only featured, sorted by order', () => {
    const input = [mk('b', 2, true), mk('z', 9, false), mk('a', 1, true)]
    expect(getHomeProjects(input).map(p => p.slug)).toEqual(['a', 'b'])
  })
})

describe('isImageSkin', () => {
  it('is true for pv/vj/collab, false for dev', () => {
    expect(isImageSkin(mk('x', 1, true, 'pv'))).toBe(true)
    expect(isImageSkin(mk('x', 1, true, 'vj'))).toBe(true)
    expect(isImageSkin(mk('x', 1, true, 'dev'))).toBe(false)
  })
})
```

- [ ] **Step 3: Run to verify failure**

Run: `npm test`
Expected: FAIL — `getHomeProjects`/`isImageSkin` not found.

- [ ] **Step 4: Implement** `lib/projects.ts`:
```ts
import { projects, type Project } from '@/content/projects'

export function getHomeProjects(all: Project[] = projects): Project[] {
  return all.filter((p) => p.featured).sort((a, b) => a.order - b.order)
}

export function isImageSkin(p: Project): boolean {
  return p.type !== 'dev'
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "feat: project data model + home selection (TDD)"
```

---

## Phase B — i18n + Carousel core

### Task 5: i18n provider (TDD)

**Files:**
- Create: `lib/i18n.tsx`
- Test: `lib/i18n.test.tsx`

- [ ] **Step 1: Write failing tests** `lib/i18n.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LangProvider, useLang } from '@/lib/i18n'

function Probe() {
  const { t, lang, toggle } = useLang()
  return (
    <div>
      <span data-testid="val">{t({ zh: '你好', en: 'hello' })}</span>
      <span data-testid="lang">{lang}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  )
}

describe('i18n', () => {
  it('defaults to zh and toggles to en', async () => {
    render(<LangProvider><Probe /></LangProvider>)
    expect(screen.getByTestId('val').textContent).toBe('你好')
    await userEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('lang').textContent).toBe('en')
    expect(screen.getByTestId('val').textContent).toBe('hello')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** `lib/i18n.tsx`:
```tsx
'use client'
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Localized } from '@/content/projects'

export type Lang = 'zh' | 'en'

export const ui = {
  works: { zh: '作品', en: 'WORKS' },
  about: { zh: '关于', en: 'ABOUT' },
  commission: { zh: '委托', en: 'COMMISSION' },
  project: { zh: '项目', en: 'PROJECT' },
  number: { zh: '编号', en: 'NUMBER' },
  scroll: { zh: '滚动', en: 'SCROLL' },
  view: { zh: '查看', en: 'VIEW' },
  watch: { zh: '观看', en: 'WATCH' },
} satisfies Record<string, Localized>

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; toggle: () => void; t: (s: Localized) => string }
const Ctx = createContext<LangCtx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh')
  const toggle = () => setLang((l) => (l === 'zh' ? 'en' : 'zh'))
  const t = (s: Localized) => s[lang]
  return <Ctx.Provider value={{ lang, setLang, toggle, t }}>{children}</Ctx.Provider>
}

export function useLang(): LangCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLang must be used within LangProvider')
  return v
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: bilingual i18n provider (TDD)"
```

---

### Task 6: Carousel index math (TDD)

**Files:**
- Create: `lib/carousel.ts`
- Test: `lib/carousel.test.ts`

- [ ] **Step 1: Write failing tests** `lib/carousel.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { nextIndex, prevIndex } from '@/lib/carousel'

describe('carousel index', () => {
  it('wraps forward', () => {
    expect(nextIndex(0, 3)).toBe(1)
    expect(nextIndex(2, 3)).toBe(0)
  })
  it('wraps backward', () => {
    expect(prevIndex(0, 3)).toBe(2)
    expect(prevIndex(1, 3)).toBe(0)
  })
  it('is safe for empty', () => {
    expect(nextIndex(0, 0)).toBe(0)
    expect(prevIndex(0, 0)).toBe(0)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement** `lib/carousel.ts`:
```ts
export function nextIndex(current: number, length: number): number {
  return length === 0 ? 0 : (current + 1) % length
}
export function prevIndex(current: number, length: number): number {
  return length === 0 ? 0 : (current - 1 + length) % length
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.

- [ ] **Step 5: Commit**
```powershell
git add -A
git commit -m "feat: carousel index math (TDD)"
```

---

### Task 7: Skins + CircleCrop (render tests)

**Files:**
- Create: `components/CircleCrop.tsx`
- Create: `components/skins/MediaImageSkin.tsx`
- Create: `components/skins/DevSkin.tsx`
- Test: `components/skins/skins.test.tsx`

- [ ] **Step 1: Implement `components/CircleCrop.tsx`**
```tsx
import Image from 'next/image'

export function CircleCrop({ src, alt, size = 150 }: { src: string; alt: string; size?: number }) {
  return (
    <div className="relative overflow-hidden rounded-full border border-white/40" style={{ width: size, height: size }}>
      <Image src={src} alt={alt} fill sizes="150px" className="object-cover" />
    </div>
  )
}
```

- [ ] **Step 2: Implement `components/skins/MediaImageSkin.tsx`**
```tsx
import Image from 'next/image'
import type { Project } from '@/content/projects'

/** 影像作品皮肤：封面图放大模糊作底，暗角压边。 */
export function MediaImageSkin({ project }: { project: Project }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[var(--night)]" data-testid="media-skin">
      <Image src={project.cover} alt="" fill priority sizes="100vw"
        className="scale-125 object-cover opacity-80 blur-2xl saturate-150" />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(70% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))' }} />
    </div>
  )
}
```

- [ ] **Step 3: Implement `components/skins/DevSkin.tsx`**
```tsx
import type { Project } from '@/content/projects'

/** dev 项目皮肤：暖白底 + 柔和渐变。 */
export function DevSkin(_props: { project: Project }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[var(--bone)]" data-testid="dev-skin">
      <div className="absolute -inset-1/3"
        style={{ background: 'radial-gradient(32% 40% at 30% 30%, #ffd1bd, transparent 62%), radial-gradient(34% 42% at 72% 42%, #ffc0d6, transparent 62%), radial-gradient(40% 50% at 50% 84%, #f6b6a4, transparent 62%)', filter: 'blur(38px)' }} />
    </div>
  )
}
```

- [ ] **Step 4: Write render tests** `components/skins/skins.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MediaImageSkin } from './MediaImageSkin'
import { DevSkin } from './DevSkin'
import type { Project } from '@/content/projects'

vi.mock('next/image', () => ({ default: (p: Record<string, unknown>) => <img alt={(p.alt as string) ?? ''} /> }))

const base: Project = { slug: 'x', type: 'pv', featured: true, order: 1, year: '2024',
  title: { zh: '', en: '' }, role: { zh: '', en: '' }, desc: { zh: '', en: '' }, cover: '/covers/x.jpg', links: {} }

describe('skins', () => {
  it('renders media skin for image works', () => {
    render(<MediaImageSkin project={base} />)
    expect(screen.getByTestId('media-skin')).toBeInTheDocument()
  })
  it('renders dev skin', () => {
    render(<DevSkin project={{ ...base, type: 'dev' }} />)
    expect(screen.getByTestId('dev-skin')).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run tests** — `npm test` → PASS.

- [ ] **Step 6: Commit**
```powershell
git add -A
git commit -m "feat: media/dev skins + CircleCrop"
```

---

### Task 8: Slide composition

**Files:**
- Create: `components/Slide.tsx`
- Test: `components/Slide.test.tsx`

- [ ] **Step 1: Implement `components/Slide.tsx`**
```tsx
'use client'
import type { Project } from '@/content/projects'
import { isImageSkin } from '@/lib/projects'
import { useLang } from '@/lib/i18n'
import { MediaImageSkin } from './skins/MediaImageSkin'
import { DevSkin } from './skins/DevSkin'
import { CircleCrop } from './CircleCrop'

function visitHref(p: Project): string {
  return p.links.bilibili || p.links.github || p.links.external || '#'
}

export function Slide({ project }: { project: Project }) {
  const { t, lang } = useLang()
  const image = isImageSkin(project)
  const dark = image
  const circleSrc = project.devVisual ?? project.cover
  const verb = project.type === 'dev' ? t({ zh: '查看', en: 'VIEW' }) : t({ zh: '观看', en: 'WATCH' })

  return (
    <div data-testid="slide" className={dark ? 'text-[var(--paper-text)]' : 'text-[var(--ink)]'}>
      {image ? <MediaImageSkin project={project} /> : <DevSkin project={project} />}
      <div className="absolute left-1/2 top-[42%] w-[88%] max-w-3xl -translate-x-1/2 -translate-y-1/2 text-center">
        <h2 className="display-italic text-5xl font-medium leading-[0.95] md:text-7xl">{t(project.title)}</h2>
        <p className="ui-label mt-3 opacity-80">{t(project.role)} / {project.year}</p>
        <div className="mt-4 flex items-start justify-center gap-8">
          <p className="max-w-[15rem] text-left text-sm leading-relaxed opacity-90">{t(project.desc)}</p>
          <a href={visitHref(project)} target="_blank" rel="noreferrer"
            className="whitespace-nowrap rounded-full border px-4 py-1.5 text-xs tracking-wider"
            style={{ borderColor: dark ? '#fff' : 'var(--ink)' }}>
            {verb} ↗
          </a>
        </div>
      </div>
      <div className="absolute bottom-4 right-4">
        <CircleCrop src={circleSrc} alt={t(project.title)} size={140} />
      </div>
      <span className="sr-only">{lang}</span>
    </div>
  )
}
```

- [ ] **Step 2: Write test** `components/Slide.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Slide } from './Slide'
import { LangProvider } from '@/lib/i18n'
import type { Project } from '@/content/projects'

vi.mock('next/image', () => ({ default: (p: Record<string, unknown>) => <img alt={(p.alt as string) ?? ''} /> }))

const pv: Project = { slug: 'fusang', type: 'pv', featured: true, order: 1, year: '2024',
  title: { zh: '扶桑', en: 'THE FUSOR ARBOR' }, role: { zh: 'PV', en: 'PV' }, desc: { zh: '描述', en: 'desc' },
  cover: '/covers/fusang.jpg', links: { bilibili: 'https://b.example/x' } }

describe('Slide', () => {
  it('renders zh title and a working visit link', () => {
    render(<LangProvider><Slide project={pv} /></LangProvider>)
    expect(screen.getByRole('heading', { name: '扶桑' })).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://b.example/x')
  })
})
```

- [ ] **Step 3: Run tests** — `npm test` → PASS.

- [ ] **Step 4: Commit**
```powershell
git add -A
git commit -m "feat: Slide composition with per-type skin"
```

---

### Task 9: CarouselRoot (state + keyboard/wheel/drag)

**Files:**
- Create: `components/CarouselRoot.tsx`
- Test: `components/CarouselRoot.test.tsx`

- [ ] **Step 1: Implement `components/CarouselRoot.tsx`**
```tsx
'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Project } from '@/content/projects'
import { nextIndex, prevIndex } from '@/lib/carousel'
import { Slide } from './Slide'
import { ProjectCounter } from './ProjectCounter'

export function CarouselRoot({ projects }: { projects: Project[] }) {
  const [index, setIndex] = useState(0)
  const lock = useRef(false)
  const dragX = useRef<number | null>(null)
  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => (dir === 1 ? nextIndex(i, projects.length) : prevIndex(i, projects.length)))
  }, [projects.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    const onWheel = (e: WheelEvent) => {
      if (lock.current) return
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(d) < 12) return
      lock.current = true
      go(d > 0 ? 1 : -1)
      setTimeout(() => { lock.current = false }, 700)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('wheel', onWheel) }
  }, [go])

  const onPointerDown = (e: React.PointerEvent) => { dragX.current = e.clientX }
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragX.current === null) return
    const dx = e.clientX - dragX.current
    dragX.current = null
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  }

  const current = projects[index]
  return (
    <section aria-roledescription="carousel" className="relative h-screen w-screen touch-pan-y overflow-hidden"
      onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <Slide key={current.slug} project={current} />
      <ProjectCounter index={index} total={projects.length}
        onPrev={() => go(-1)} onNext={() => go(1)} />
    </section>
  )
}
```

- [ ] **Step 2: Write keyboard test** `components/CarouselRoot.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CarouselRoot } from './CarouselRoot'
import { LangProvider } from '@/lib/i18n'
import type { Project } from '@/content/projects'

vi.mock('next/image', () => ({ default: (p: Record<string, unknown>) => <img alt={(p.alt as string) ?? ''} /> }))

const mk = (slug: string, order: number): Project => ({ slug, type: 'pv', featured: true, order, year: '2024',
  title: { zh: slug, en: slug }, role: { zh: '', en: '' }, desc: { zh: '', en: '' }, cover: `/c/${slug}.jpg`, links: {} })

describe('CarouselRoot', () => {
  it('advances on ArrowRight and wraps', async () => {
    render(<LangProvider><CarouselRoot projects={[mk('a', 1), mk('b', 2)]} /></LangProvider>)
    expect(screen.getByRole('heading')).toHaveTextContent('a')
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('heading')).toHaveTextContent('b')
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('heading')).toHaveTextContent('a')
  })
})
```

- [ ] **Step 3: Run tests** — `npm test` → PASS (depends on Task 10 ProjectCounter; create a temporary minimal version first if running this task in isolation — see Task 10).

> Note for executor: Tasks 9 and 10 are mutually referencing (CarouselRoot renders ProjectCounter). Implement Task 10's `ProjectCounter` before running Task 9's test, or stub it. Recommended order: do Step 1 of Task 10 first, then Task 9.

- [ ] **Step 4: Commit**
```powershell
git add -A
git commit -m "feat: CarouselRoot with keyboard/wheel navigation"
```

---

## Phase C — Furniture, counter, preloader, motion

### Task 10: ProjectCounter

**Files:**
- Create: `components/ProjectCounter.tsx`
- Test: `components/ProjectCounter.test.tsx`

- [ ] **Step 1: Implement `components/ProjectCounter.tsx`**
```tsx
'use client'
import { useLang, ui } from '@/lib/i18n'

export function ProjectCounter({ index, total, onPrev, onNext }: {
  index: number; total: number; onPrev: () => void; onNext: () => void
}) {
  const { t } = useLang()
  const n = String(index + 1).padStart(2, '0')
  return (
    <div className="absolute bottom-5 left-5 flex h-32 w-32 flex-col items-center justify-center rounded-full border border-current/40 text-center">
      <span className="ui-label text-[0.6rem] opacity-70">{t(ui.project)}</span>
      <span className="text-3xl font-medium leading-none">{n}</span>
      <span className="ui-label text-[0.6rem] opacity-70">{t(ui.number)}</span>
      <button aria-label="previous" onClick={onPrev} className="absolute -left-2 top-1/2 -translate-y-1/2 p-2">←</button>
      <button aria-label="next" onClick={onNext} className="absolute -right-2 top-1/2 -translate-y-1/2 p-2">→</button>
    </div>
  )
}
```

- [ ] **Step 2: Write test** `components/ProjectCounter.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectCounter } from './ProjectCounter'
import { LangProvider } from '@/lib/i18n'

describe('ProjectCounter', () => {
  it('shows padded number and fires callbacks', async () => {
    const onNext = vi.fn(); const onPrev = vi.fn()
    render(<LangProvider><ProjectCounter index={0} total={9} onPrev={onPrev} onNext={onNext} /></LangProvider>)
    expect(screen.getByText('01')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('next'))
    expect(onNext).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 3: Run tests** — `npm test` → PASS.

- [ ] **Step 4: Commit**
```powershell
git add -A
git commit -m "feat: ProjectCounter circle control"
```

---

### Task 11: Corner furniture (Clock TDD + Nav + LangToggle)

**Files:**
- Create: `lib/time.ts`
- Test: `lib/time.test.ts`
- Create: `components/furniture/Clock.tsx`
- Create: `components/furniture/CornerFurniture.tsx`

- [ ] **Step 1: Write failing clock test** `lib/time.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatClock } from '@/lib/time'

describe('formatClock', () => {
  it('prefixes the uppercased city and includes a HH:MM time', () => {
    const out = formatClock(new Date('2024-01-01T08:30:00Z'), 'Asia/Shanghai', 'Beijing')
    expect(out.startsWith('BEIJING, ')).toBe(true)
    expect(out).toMatch(/\d{1,2}:\d{2}/)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `npm test` → FAIL.

- [ ] **Step 3: Implement `lib/time.ts`**
```ts
export function formatClock(date: Date, timeZone: string, city: string): string {
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone, timeZoneName: 'short',
  }).format(date)
  return `${city.toUpperCase()}, ${time}`
}
```

- [ ] **Step 4: Run to verify pass** — `npm test` → PASS.

- [ ] **Step 5: Implement `components/furniture/Clock.tsx`**
```tsx
'use client'
import { useEffect, useState } from 'react'
import { formatClock } from '@/lib/time'

export function Clock({ city = 'Hangzhou', timeZone = 'Asia/Shanghai' }: { city?: string; timeZone?: string }) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(id)
  }, [])
  return <span className="ui-label" suppressHydrationWarning>{now ? formatClock(now, timeZone, city) : ''}</span>
}
```

- [ ] **Step 6: Implement `components/furniture/CornerFurniture.tsx`**
```tsx
'use client'
import Link from 'next/link'
import { useLang, ui } from '@/lib/i18n'
import { Clock } from './Clock'

export function CornerFurniture() {
  const { lang, toggle, t } = useLang()
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="pointer-events-auto absolute left-5 top-4 flex items-center gap-3">
        <Link href="/" className="text-sm font-bold tracking-[0.18em]">J / D</Link>
        <Clock />
      </div>
      <nav className="pointer-events-auto absolute right-5 top-4 flex items-center gap-3 ui-label">
        <Link href="/about">{t(ui.about)}</Link>
        <span>/</span>
        <Link href="/commission">{t(ui.commission)}</Link>
        <button onClick={toggle} aria-label="toggle language"
          className="ml-1 rounded-full border border-current px-2 py-0.5">{lang === 'zh' ? 'EN' : '中'}</button>
      </nav>
      <span className="absolute left-5 top-1/2 -translate-y-1/2 ui-label opacity-70">portfolio 2026</span>
      <span className="absolute right-5 top-1/2 -translate-y-1/2 ui-label opacity-70">{t(ui.scroll)}</span>
      <span className="absolute bottom-6 left-[9.5rem] max-w-[12rem] ui-label leading-relaxed opacity-70">
        PV · VJ · 映像创作 × 创意开发
      </span>
    </div>
  )
}
```

- [ ] **Step 7: Commit**
```powershell
git add -A
git commit -m "feat: corner furniture (clock TDD, nav, lang toggle)"
```

---

### Task 12: Preloader + GSAP slide transition + Lenis

**Files:**
- Create: `components/Preloader.tsx`
- Modify: `components/Slide.tsx` (entrance animation)
- Create: `components/SmoothScroll.tsx`

- [ ] **Step 1: Implement `components/Preloader.tsx`** (0→100 then fades out)
```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export function Preloader() {
  const [pct, setPct] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obj = { v: 0 }
    gsap.to(obj, { v: 100, duration: 1.6, ease: 'power2.out',
      onUpdate: () => setPct(Math.round(obj.v)),
      onComplete: () => gsap.to(root.current, { autoAlpha: 0, duration: 0.6, delay: 0.1,
        onComplete: () => root.current && (root.current.style.display = 'none') }),
    })
  }, [])
  return (
    <div ref={root} className="fixed inset-0 z-50 flex items-end justify-end bg-[var(--night)] p-8">
      <span className="text-6xl font-bold tabular-nums">{pct}%</span>
    </div>
  )
}
```

- [ ] **Step 2: Add a GSAP entrance to `components/Slide.tsx`** — add near the top of the component body, and wrap the root in a ref:

Add import: `import { useRef, useEffect } from 'react'` and `import gsap from 'gsap'`. Add inside `Slide`:
```tsx
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="title"]', { yPercent: 12, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
      gsap.from('[data-anim="meta"]', { autoAlpha: 0, y: 8, duration: 0.6, delay: 0.1 })
    }, rootRef)
    return () => ctx.revert()
  }, [project.slug])
```
Then set `ref={rootRef}` on the `data-testid="slide"` div, add `data-anim="title"` to the `<h2>`, and `data-anim="meta"` to the role `<p>`.

- [ ] **Step 3: Implement `components/SmoothScroll.tsx`** (used by sub-pages that scroll)
```tsx
'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis()
    let raf = 0
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])
  return null
}
```

- [ ] **Step 4: Verify tests still pass** — `npm test` → PASS (Slide test unaffected; gsap runs in jsdom harmlessly).

- [ ] **Step 5: Commit**
```powershell
git add -A
git commit -m "feat: preloader, GSAP slide entrance, Lenis smooth scroll"
```

---

## Phase D — Pages, wiring, polish

### Task 13: Home page wiring + providers

**Files:**
- Create: `components/Providers.tsx`
- Modify: `app/layout.tsx` (wrap with Providers)
- Replace: `app/page.tsx`
- Create: placeholder covers in `public/covers/` (so images resolve during dev)

- [ ] **Step 1: Create `components/Providers.tsx`**
```tsx
'use client'
import { LangProvider } from '@/lib/i18n'
export function Providers({ children }: { children: React.ReactNode }) {
  return <LangProvider>{children}</LangProvider>
}
```

- [ ] **Step 2: Wrap body in `app/layout.tsx`** — change the body children to `<Providers>{children}</Providers>` and import `{ Providers }` from `@/components/Providers`.

- [ ] **Step 3: Replace `app/page.tsx`**
```tsx
import { CarouselRoot } from '@/components/CarouselRoot'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { Preloader } from '@/components/Preloader'
import { getHomeProjects } from '@/lib/projects'

export default function Home() {
  const projects = getHomeProjects()
  return (
    <main>
      <Preloader />
      <CarouselRoot projects={projects} />
      <CornerFurniture />
    </main>
  )
}
```

- [ ] **Step 4: Add placeholder covers** so `<Image>` resolves. Create `public/covers/` and add 9 files named exactly as in `content/projects.ts` (`fusang.jpg`, `mirror-tower.jpg`, `centripetal-force.jpg`, `pojin.jpg`, `yu.jpg`, `sonnet-29.jpg`, `lagtrain.jpg`, `onpa.jpg`, `aemcp.jpg`). For now copy any placeholder image into each name. (Real covers come from the asset list in the spec §11.)

- [ ] **Step 5: Manual verify**

Run: `npm run dev`, open `http://localhost:3000`.
Expected: preloader counts 0→100 then fades; 扶桑 slide shows with blurred bg + circle; ArrowRight / wheel / counter arrows change projects; EN toggle switches labels.
(Agent: verify via chrome-devtools — navigate + screenshot + click counter "next".)

- [ ] **Step 6: Commit**
```powershell
git add -A
git commit -m "feat: wire home page (carousel + furniture + preloader)"
```

---

### Task 14: /about page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Implement `app/about/page.tsx`** (bilingual via a small client wrapper)
```tsx
'use client'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang } from '@/lib/i18n'

export default function About() {
  const { t } = useLang()
  const bio = { zh: '我是 JUNK_DOGE —— PV师 / VJ / 映像创作，同时做创意开发（after-effects-mcp 等工具）。',
                en: "I'm JUNK_DOGE — PV / VJ / motion artist, and a creative developer (tools like after-effects-mcp)." }
  return (
    <main className="relative min-h-screen bg-[var(--bone)] text-[var(--ink)]">
      <SmoothScroll />
      <CornerFurniture />
      <section className="mx-auto max-w-4xl px-6 pt-32">
        <h1 className="display-italic text-6xl font-bold md:text-8xl">{t({ zh: '关于', en: 'About' })}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed">{t(bio)}</p>
        <div className="mt-10 flex flex-wrap gap-3 ui-label">
          <a className="rounded-full border border-current px-4 py-2" href="https://space.bilibili.com/73910418" target="_blank" rel="noreferrer">BILIBILI ↗</a>
          <a className="rounded-full border border-current px-4 py-2" href="https://github.com/JUNKDOGE-JOE" target="_blank" rel="noreferrer">GITHUB ↗</a>
          <a className="rounded-full border border-current px-4 py-2" href="mailto:2814374544@qq.com">EMAIL ↗</a>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Manual verify** — `/about` renders, lang toggle works, links open. Commit:
```powershell
git add -A
git commit -m "feat: about page"
```

---

### Task 15: /commission page + contact footer

**Files:**
- Create: `app/commission/page.tsx`

- [ ] **Step 1: Implement `app/commission/page.tsx`**
```tsx
'use client'
import { SmoothScroll } from '@/components/SmoothScroll'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { useLang } from '@/lib/i18n'

const tiers = [
  { k: '文字PV / Lyric', zh: '按时长与复杂度报价', en: 'Priced by length & complexity' },
  { k: 'VJ 素材 / VJ Clips', zh: '按场次与素材量报价', en: 'Priced by show & volume' },
  { k: 'PV / MV', zh: '面议', en: 'By negotiation' },
]

export default function Commission() {
  const { t } = useLang()
  return (
    <main className="relative min-h-screen bg-[var(--night)] text-[var(--paper-text)]">
      <SmoothScroll />
      <CornerFurniture />
      <section className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <h1 className="display-italic text-6xl font-bold md:text-8xl">{t({ zh: '委托', en: 'Commission' })}</h1>
        <ul className="mt-10 divide-y divide-white/15">
          {tiers.map((x) => (
            <li key={x.k} className="flex items-center justify-between py-5">
              <span className="text-xl">{x.k}</span>
              <span className="opacity-80">{t({ zh: x.zh, en: x.en })}</span>
            </li>
          ))}
        </ul>
        <footer className="mt-16 ui-label opacity-70">
          QQ 2814374544 · WeChat weixinJUNKDOGE · 2814374544@qq.com
        </footer>
      </section>
    </main>
  )
}
```

- [ ] **Step 2: Manual verify + commit**
```powershell
git add -A
git commit -m "feat: commission page + contact footer"
```

---

### Task 16: Responsive + a11y + reduced-motion pass

**Files:**
- Modify: `components/Slide.tsx`, `components/furniture/CornerFurniture.tsx`, `app/globals.css`

- [ ] **Step 1: Add reduced-motion guard** to `app/globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}
```

- [ ] **Step 2: Mobile type/layout** — in `Slide.tsx`, keep the title responsive (`text-5xl md:text-7xl`). Make the bottom-right circle slightly smaller on phones: change its wrapper div from `className="absolute bottom-4 right-4"` to `className="absolute bottom-3 right-3 scale-90 sm:scale-100"`.

- [ ] **Step 3: a11y** — ensure counter arrows have `aria-label` (done in Task 10), nav links have text, lang button has `aria-label` (done). Add `aria-live="polite"` to the slide title container so screen readers announce project changes: add `aria-live="polite"` to the centered `<div>` in `Slide.tsx`.

- [ ] **Step 4: Manual verify across breakpoints**

Run `npm run dev`; using chrome-devtools MCP, emulate a mobile viewport and screenshot `/`, `/about`, `/commission`. Confirm no overflow, furniture readable, reduced-motion disables the preloader count jump.

- [ ] **Step 5: Full test + build**

Run: `npm test` → PASS. Then `npm run build` → succeeds with no type errors.

- [ ] **Step 6: Commit**
```powershell
git add -A
git commit -m "chore: responsive, a11y, reduced-motion pass"
```

---

## Done = v1

A working bilingual animated homepage: 9-project carousel (扶桑 first, dev last), per-type skins, circle motif, corner furniture with live clock + language toggle, preloader, GSAP entrance, plus /about and /commission. `npm test` and `npm run build` both green.

**Deferred to later plans:** `/works` full index, `/work/[slug]` detail pages with Bilibili embeds, Awards/collab section, magnetic cursor, optional WebGL (cover liquid-distortion / dev 3D), per-cover accent-color extraction, real asset integration.
