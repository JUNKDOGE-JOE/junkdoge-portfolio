# Local Admin CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A local-only Node admin that edits the site's content (projects, about, commission, misc copy) and images, writing to `content/*.json` and `public/` — no git, no deploy, isolated from the static build.

**Architecture:** Migrate site data from TS code to `content/projects.json` + `content/site.json` (main site imports them, types unchanged). A standalone Express server in `admin/` reads/writes those JSON files and uploads images; a single CDN-React page is the UI. `npm run admin` runs it; the user previews with `npm run dev` and pushes manually.

**Tech Stack:** Node + Express + multer (admin), React + htm + Tailwind via CDN (admin UI, no build), Next.js static export (main site, unchanged).

---

## File Structure

| File | Responsibility |
|---|---|
| `content/projects.json` (new) | Source of truth for the 9 projects |
| `content/site.json` (new) | About bio/links, commission tiers/contact, misc copy |
| `content/projects.ts` (modify) | `import projects.json`, keep `Project` type |
| `lib/site.ts` (new) | Typed wrapper exporting `site.json` |
| `app/about/page.tsx` (modify) | Read bio/links from site |
| `app/commission/page.tsx` (modify) | Read tiers/contact from site |
| `components/furniture/CornerFurniture.tsx` (modify) | Read `homeTagline` from site |
| `app/layout.tsx` (modify) | Read `bannerText` from site |
| `admin/server.mjs` (new) | Express API + serves UI |
| `admin/ui.html` (new) | Single-page admin UI |
| `package.json` (modify) | `admin` script + express/multer devDeps |
| `.gitignore` (verify) | already ignores node_modules |

---

## Task 1: Migrate projects to JSON

**Files:**
- Create: `content/projects.json`
- Modify: `content/projects.ts`
- Test: `lib/projects.test.ts` (append)

- [ ] **Step 1: Create `content/projects.json`** with the exact current data:

```json
[
  { "slug": "fusang", "type": "pv", "featured": true, "order": 1, "year": "2024",
    "title": { "zh": "扶桑", "en": "THE FUSOR ARBOR" },
    "role": { "zh": "PV · BOF21", "en": "PV · BOF21" },
    "desc": { "zh": "为 BOF21 制作的影像作品，文字与映像一体的视觉叙事。", "en": "A visual piece made for BOF21 — typography and motion as one narrative." },
    "cover": "/covers/fusang.jpg", "accent": "#3c5347",
    "links": { "bilibili": "https://www.bilibili.com/video/BV126WEz3EjX/" } },
  { "slug": "mirror-tower", "type": "pv", "featured": true, "order": 2, "year": "2024",
    "title": { "zh": "镜之塔", "en": "Tales of Endless Tower" },
    "role": { "zh": "PV · 音游", "en": "PV · Rhythm Game" },
    "desc": { "zh": "音乐游戏《镜之塔》PV 第一部分。", "en": "Promo video for the rhythm game Mirror Tower, part one." },
    "cover": "/covers/mirror-tower.jpg", "accent": "#534249",
    "links": { "bilibili": "https://www.bilibili.com/video/BV1XhSXYKEyM/" } },
  { "slug": "centripetal-force", "type": "pv", "featured": true, "order": 3, "year": "2023",
    "title": { "zh": "Centripetal Force", "en": "Centripetal Force" },
    "role": { "zh": "PV · BOF:TT", "en": "PV · BOF:TT" },
    "desc": { "zh": "为 BOF:TT 制作的影像作品。", "en": "A visual piece made for BOF:TT." },
    "cover": "/covers/centripetal-force.jpg", "accent": "#2c2a2f",
    "links": { "bilibili": "" } },
  { "slug": "pojin", "type": "pv", "featured": true, "order": 4, "year": "2025",
    "title": { "zh": "破禁 先行PV", "en": "PoJin — Teaser PV" },
    "role": { "zh": "PV · 独立游戏", "en": "PV · Indie Game" },
    "desc": { "zh": "独立游戏《破禁》先行 PV。", "en": "Teaser PV for the indie game PoJin." },
    "cover": "/covers/pojin.jpg", "accent": "#430215",
    "links": { "external": "https://www.xiaohongshu.com/explore/68de4490000000000700e4f7" } },
  { "slug": "yu", "type": "pv", "featured": true, "order": 5, "year": "2024",
    "title": { "zh": "融っ", "en": "融っ / original song" },
    "role": { "zh": "PV · 原创曲", "en": "PV · Original Song" },
    "desc": { "zh": "原创曲《融っ》影像。", "en": "Visual for the original song \"融っ\"." },
    "cover": "/covers/yu.jpg", "accent": "#2f3b47",
    "links": { "bilibili": "https://www.bilibili.com/video/BV1WktCzDEdT/" } },
  { "slug": "sonnet-29", "type": "pv", "featured": true, "order": 6, "year": "2024",
    "title": { "zh": "二十九行诗", "en": "Sonnet 29" },
    "role": { "zh": "PV · 春日限原创曲", "en": "PV · Original Song" },
    "desc": { "zh": "春日限原创曲《二十九行诗》影像。", "en": "Visual for the original spring-themed song \"Sonnet 29\"." },
    "cover": "/covers/sonnet-29.jpg", "accent": "#2e3233",
    "links": { "bilibili": "https://www.bilibili.com/video/BV1yZKNecEp9/" } },
  { "slug": "shoujo", "type": "pv", "featured": true, "order": 7, "year": "2024",
    "title": { "zh": "少女終幕", "en": "Aru Shoujo no Shimatsu" },
    "role": { "zh": "PV · 原创曲", "en": "PV · Original Song" },
    "desc": { "zh": "少女終幕｜ある少女の始末（原创曲）影像。", "en": "Visual for the original song \"Aru Shoujo no Shimatsu\"." },
    "cover": "/covers/shoujo.jpg", "accent": "#9e6d9d",
    "links": {} },
  { "slug": "fusheng", "type": "vj", "featured": true, "order": 8, "year": "2024",
    "title": { "zh": "浮生", "en": "Fusheng" },
    "role": { "zh": "VJ · 文字动画", "en": "VJ · Lyric Motion" },
    "desc": { "zh": "陈致逸作品音乐会 ——《浮生》文字动画。", "en": "Kinetic-lyric animation for the Chen Zhiyi concert — \"Fusheng\"." },
    "cover": "/covers/fusheng.jpg", "accent": "#999297",
    "links": { "bilibili": "https://www.bilibili.com/video/BV178k1YuEXo/" } },
  { "slug": "after-effects-mcp", "type": "dev", "featured": true, "order": 9, "year": "2026",
    "title": { "zh": "after-effects-mcp", "en": "after-effects-mcp" },
    "role": { "zh": "Dev · AE 自动化", "en": "Dev · AE Automation" },
    "desc": { "zh": "Agent 驱动的 AE 自动化：MCP + CEP，让 AI 用 30+ 工具操控 After Effects。⭐22", "en": "Agent-driven After Effects automation: MCP + CEP plugin, 30+ ae.* tools. ⭐22" },
    "cover": "/covers/aemcp.jpg", "devVisual": "/covers/aemcp.jpg", "accent": "#7b61ff",
    "links": { "github": "https://github.com/JUNKDOGE-JOE/after-effects-mcp" } }
]
```

- [ ] **Step 2: Rewrite `content/projects.ts`** to import the JSON, keeping the type:

```ts
import data from './projects.json'

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

export const projects: Project[] = data as Project[]
```

- [ ] **Step 3: Append an integrity test** to `lib/projects.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { projects } from '@/content/projects'

describe('projects.json migration', () => {
  it('loads 9 featured projects with required fields', () => {
    expect(projects).toHaveLength(9)
    for (const p of projects) {
      expect(p.slug).toBeTruthy()
      expect(p.title.zh).toBeTruthy()
      expect(p.cover.startsWith('/covers/')).toBe(true)
      expect(p.links).toBeDefined()
    }
  })
  it('keeps fusang as order 1', () => {
    expect(projects.find(p => p.slug === 'fusang')?.order).toBe(1)
  })
})
```

- [ ] **Step 4: Verify** — `npm test` (Expected: all pass incl. new test) and `npm run build` (Expected: 7 static pages, no error). Confirm `tsconfig.json` has `"resolveJsonModule": true` — Next 16 default is true; if the build errors on the JSON import, add it under `compilerOptions`.

- [ ] **Step 5: Commit**

```bash
git add content/projects.json content/projects.ts lib/projects.test.ts
git commit -m "refactor: projects data to content/projects.json"
```

---

## Task 2: site.json + lib/site.ts + wire about/commission

**Files:**
- Create: `content/site.json`, `lib/site.ts`
- Modify: `app/about/page.tsx`, `app/commission/page.tsx`

- [ ] **Step 1: Create `content/site.json`** with current content:

```json
{
  "about": {
    "bio": {
      "zh": "我是 JUNK_DOGE —— PV师 / VJ / 映像创作，同时做创意开发（after-effects-mcp 等工具）。",
      "en": "I'm JUNK_DOGE — PV / VJ / motion artist, and a creative developer (tools like after-effects-mcp)."
    },
    "links": [
      { "label": "BILIBILI", "href": "https://space.bilibili.com/73910418" },
      { "label": "GITHUB", "href": "https://github.com/JUNKDOGE-JOE" },
      { "label": "EMAIL", "href": "mailto:2814374544@qq.com" }
    ]
  },
  "commission": {
    "tiers": [
      { "k": "文字PV / Lyric", "zh": "按时长与复杂度报价", "en": "Priced by length & complexity" },
      { "k": "VJ 素材 / VJ Clips", "zh": "按场次与素材量报价", "en": "Priced by show & volume" },
      { "k": "PV / MV", "zh": "面议", "en": "By negotiation" }
    ],
    "contact": "QQ 2814374544 · WeChat weixinJUNKDOGE · 2814374544@qq.com"
  },
  "misc": {
    "homeTagline": "PV · VJ · 映像创作 × 创意开发",
    "bannerText": "装修中 · 持续完善"
  }
}
```

- [ ] **Step 2: Create `lib/site.ts`** (typed wrapper):

```ts
import data from '@/content/site.json'

export interface SiteData {
  about: { bio: { zh: string; en: string }; links: { label: string; href: string }[] }
  commission: { tiers: { k: string; zh: string; en: string }[]; contact: string }
  misc: { homeTagline: string; bannerText: string }
}

export const site = data as SiteData
```

- [ ] **Step 3: Modify `app/about/page.tsx`** — replace the inline `bio` const and the three hardcoded pill `<a>`s with site data. Replace the `bio` definition:

```tsx
import { site } from '@/lib/site'
// ...delete the local `const bio = {...}`; use site.about.bio
```
Change `{t(bio)}` → `{t(site.about.bio)}`. Replace the three `<RevealUp>...<a ...>BILIBILI ↗</a>...` blocks with a map:

```tsx
{site.about.links.map((l) => (
  <RevealUp key={l.label}>
    <TiltCard maxDeg={14}>
      <a className="inline-block rounded-full border border-current px-4 py-2" href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>
    </TiltCard>
  </RevealUp>
))}
```

- [ ] **Step 4: Modify `app/commission/page.tsx`** — replace the local `const tiers = [...]` and the footer text with site data:

```tsx
import { site } from '@/lib/site'
// delete local `const tiers`; use site.commission.tiers
```
Change `{tiers.map(...)}` → `{site.commission.tiers.map(...)}` and the footer text → `{site.commission.contact}`.

- [ ] **Step 5: Verify** — `npm run build` (Expected: no error), `npm run dev`, open `/about` and `/commission` (Expected: identical content to before).

- [ ] **Step 6: Commit**

```bash
git add content/site.json lib/site.ts app/about/page.tsx app/commission/page.tsx
git commit -m "refactor: about/commission content to content/site.json"
```

---

## Task 3: Wire misc copy (homeTagline, bannerText)

**Files:**
- Modify: `components/furniture/CornerFurniture.tsx`, `app/layout.tsx`

- [ ] **Step 1: CornerFurniture homeTagline** — in `components/furniture/CornerFurniture.tsx`, add `import { site } from '@/lib/site'` and replace the literal `PV · VJ · 映像创作 × 创意开发` inside the bottom tagline `<span>` with `{site.misc.homeTagline}`.

- [ ] **Step 2: layout bannerText** — in `app/layout.tsx`, add `import { site } from '@/lib/site'` and replace the literal `装修中 · 持续完善` text node with `{site.misc.bannerText}`.

- [ ] **Step 3: Verify** — `npm run build` (Expected: no error); `npm run dev`, home page shows the tagline + banner unchanged.

- [ ] **Step 4: Commit**

```bash
git add components/furniture/CornerFurniture.tsx app/layout.tsx
git commit -m "refactor: home tagline + banner text to site.json"
```

---

## Task 4: Admin dependencies + script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dev deps**

Run: `npm install -D express@^4 multer@^1`
Expected: added to `devDependencies`.

- [ ] **Step 2: Add script** — in `package.json` `"scripts"`, add:

```json
"admin": "node admin/server.mjs"
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add express+multer + admin script"
```

---

## Task 5: Admin server

**Files:**
- Create: `admin/server.mjs`

- [ ] **Step 1: Write `admin/server.mjs`** (complete):

```js
import express from 'express'
import multer from 'multer'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CONTENT = path.join(ROOT, 'content')
const PUBLIC = path.join(ROOT, 'public')
const PORT = 4000

const app = express()
app.use(express.json({ limit: '2mb' }))

const readJson = async (f) => JSON.parse(await fs.readFile(path.join(CONTENT, f), 'utf8'))
const writeJson = async (f, data) => fs.writeFile(path.join(CONTENT, f), JSON.stringify(data, null, 2) + '\n', 'utf8')

// keep every write inside public/ — reject path escapes
const safePublic = (rel) => {
  const p = path.resolve(PUBLIC, rel.replace(/^\/+/, ''))
  if (!p.startsWith(PUBLIC + path.sep)) throw new Error('path escape')
  return p
}

app.get('/api/data', async (_req, res) => {
  res.json({ projects: await readJson('projects.json'), site: await readJson('site.json') })
})

app.put('/api/projects', async (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'expected array' })
  await writeJson('projects.json', req.body)
  res.json({ ok: true })
})

app.put('/api/site', async (req, res) => {
  await writeJson('site.json', req.body)
  res.json({ ok: true })
})

app.delete('/api/projects/:slug', async (req, res) => {
  const all = await readJson('projects.json')
  await writeJson('projects.json', all.filter((p) => p.slug !== req.params.slug))
  res.json({ ok: true })
})

// upload: client sends `target` = public-relative path, e.g. "covers/yu.jpg" or "gallery/yu/2.jpg"
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } })
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const target = String(req.body.target || '')
    if (!/^(covers|gallery)\//.test(target)) return res.status(400).json({ error: 'bad target' })
    const dest = safePublic(target)
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.writeFile(dest, req.file.buffer)
    res.json({ ok: true, path: '/' + target })
  } catch (e) {
    res.status(400).json({ error: String(e.message || e) })
  }
})

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'ui.html')))

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  admin → http://localhost:${PORT}\n  (edit content, then run \`npm run dev\` to preview, and git push to publish)\n`)
})
```

- [ ] **Step 2: Verify endpoints** — start the server, then curl the read endpoint:

Run:
```bash
node admin/server.mjs &
sleep 1
curl -s http://localhost:4000/api/data | head -c 120
kill %1
```
Expected: JSON starting with `{"projects":[{"slug":"fusang"`.

- [ ] **Step 3: Commit**

```bash
git add admin/server.mjs
git commit -m "feat: admin server (read/write content json + image upload)"
```

---

## Task 6: Admin UI

**Files:**
- Create: `admin/ui.html`

- [ ] **Step 1: Write `admin/ui.html`** (complete single-page UI — React + htm + Tailwind via CDN):

```html
<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>JUNK_DOGE · 内容后台</title>
<script src="https://cdn.tailwindcss.com"></script>
<style> body { background:#0c0c0f; color:#e8e6e1; font-family: ui-sans-serif, system-ui, "Noto Sans SC", sans-serif } input,textarea,select{ background:#17171c; border:1px solid #2a2a32; border-radius:6px; padding:.4rem .6rem; color:#e8e6e1; width:100% } label{ font-size:.7rem; letter-spacing:.04em; color:#9a9aa2 } .btn{ border:1px solid #3a3a44; border-radius:999px; padding:.4rem .9rem; font-size:.8rem } .btn:hover{ background:#1e1e24 } </style>
</head>
<body class="p-6">
<div id="app" class="mx-auto max-w-5xl"></div>
<script type="module">
import { h, render } from 'https://esm.sh/preact@10.23.2'
import { useState, useEffect } from 'https://esm.sh/preact@10.23.2/hooks'
import htm from 'https://esm.sh/htm@3.1.1'
const html = htm.bind(h)

const api = {
  load: () => fetch('/api/data').then(r => r.json()),
  saveProjects: (p) => fetch('/api/projects', { method:'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify(p) }),
  saveSite: (s) => fetch('/api/site', { method:'PUT', headers:{'content-type':'application/json'}, body: JSON.stringify(s) }),
  upload: (file, target) => { const fd = new FormData(); fd.append('file', file); fd.append('target', target); return fetch('/api/upload', { method:'POST', body: fd }).then(r=>r.json()) },
}

function Img({ src, target, onDone }) {
  const [busy, setBusy] = useState(false)
  const pick = async (e) => { const f = e.target.files[0]; if(!f) return; setBusy(true); const r = await api.upload(f, target); setBusy(false); if(r.path) onDone(r.path + '?t=' + Date.now()) }
  return html`<div class="flex items-center gap-3">
    <div class="h-16 w-16 overflow-hidden rounded border border-[#2a2a32] bg-black">${src && html`<img src=${src} class="h-full w-full object-cover" />`}</div>
    <label class="btn cursor-pointer">${busy?'上传中…':'换图'}<input type="file" accept="image/*" class="hidden" onChange=${pick} /></label>
    <span class="text-xs text-[#65656e]">${target}</span>
  </div>`
}

function ProjectRow({ p, onChange, onDelete }) {
  const set = (path, v) => { const c = structuredClone(p); let o = c; const ks = path.split('.'); while(ks.length>1) o = o[ks.shift()]; o[ks[0]] = v; onChange(c) }
  const galleryCount = p.type === 'dev' ? 5 : 4
  return html`<details class="rounded-lg border border-[#26262e] p-4">
    <summary class="cursor-pointer text-sm"><b>N.${String(p.order).padStart(2,'0')}</b> · ${p.title.zh} <span class="text-[#65656e]">/${p.slug}</span></summary>
    <div class="mt-4 grid grid-cols-2 gap-3">
      <div><label>名字 (中)</label><input value=${p.title.zh} onInput=${e=>set('title.zh',e.target.value)} /></div>
      <div><label>名字 (英)</label><input value=${p.title.en} onInput=${e=>set('title.en',e.target.value)} /></div>
      <div><label>角色 (中)</label><input value=${p.role.zh} onInput=${e=>set('role.zh',e.target.value)} /></div>
      <div><label>角色 (英)</label><input value=${p.role.en} onInput=${e=>set('role.en',e.target.value)} /></div>
      <div class="col-span-2"><label>简介 (中)</label><textarea rows="2" onInput=${e=>set('desc.zh',e.target.value)}>${p.desc.zh}</textarea></div>
      <div class="col-span-2"><label>简介 (英)</label><textarea rows="2" onInput=${e=>set('desc.en',e.target.value)}>${p.desc.en}</textarea></div>
      <div><label>年份</label><input value=${p.year} onInput=${e=>set('year',e.target.value)} /></div>
      <div><label>类型</label><select onChange=${e=>set('type',e.target.value)}>${['pv','vj','collab','dev'].map(t=>html`<option value=${t} selected=${p.type===t}>${t}</option>`)}</select></div>
      <div><label>排序 order</label><input type="number" value=${p.order} onInput=${e=>set('order',Number(e.target.value))} /></div>
      <div class="flex items-end gap-2"><label class="mb-1">主题色</label><input type="color" value=${p.accent||'#888888'} onInput=${e=>set('accent',e.target.value)} class="h-9 w-12 p-0" /><input value=${p.accent||''} onInput=${e=>set('accent',e.target.value)} /></div>
      <div><label>B站</label><input value=${p.links.bilibili||''} onInput=${e=>set('links.bilibili',e.target.value)} /></div>
      <div><label>GitHub</label><input value=${p.links.github||''} onInput=${e=>set('links.github',e.target.value)} /></div>
      <div class="col-span-2"><label>外链 external</label><input value=${p.links.external||''} onInput=${e=>set('links.external',e.target.value)} /></div>
      <div class="col-span-2 mt-2"><label>封面</label><${Img} src=${p.cover} target=${'covers/'+p.slug+'.jpg'} onDone=${v=>set('cover','/covers/'+p.slug+'.jpg')} /></div>
      <div class="col-span-2"><label>画廊图 (${galleryCount} 张)</label><div class="flex flex-wrap gap-3">
        ${Array.from({length:galleryCount},(_,i)=>html`<${Img} key=${i} src=${'/gallery/'+p.slug+'/'+(i+1)+'.jpg'} target=${'gallery/'+p.slug+'/'+(i+1)+'.jpg'} onDone=${()=>{}} />`)}
      </div></div>
      <div class="col-span-2 mt-2"><button class="btn text-red-300" onClick=${()=>onDelete(p.slug)}>删除作品</button></div>
    </div>
  </details>`
}

function App() {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('projects')
  const [msg, setMsg] = useState('')
  useEffect(()=>{ api.load().then(setData) }, [])
  if (!data) return html`<p>加载中…</p>`
  const setProjects = (ps) => setData({ ...data, projects: ps })
  const setSite = (s) => setData({ ...data, site: s })
  const save = async () => { await api.saveProjects(data.projects); await api.saveSite(data.site); setMsg('已写入 — 开着 npm run dev 预览，满意后自己 git push'); setTimeout(()=>setMsg(''), 6000) }
  const addProject = () => setProjects([...data.projects, { slug:'new-'+Date.now(), type:'pv', featured:true, order:data.projects.length+1, year:'2026', title:{zh:'新作品',en:'New'}, role:{zh:'',en:''}, desc:{zh:'',en:''}, cover:'', accent:'#888888', links:{} }])
  const s = data.site
  const setMisc = (k,v)=> setSite({ ...s, misc:{ ...s.misc, [k]:v } })
  return html`<div>
    <header class="mb-6 flex items-center justify-between">
      <h1 class="text-lg font-bold">JUNK_DOGE · 内容后台</h1>
      <div class="flex items-center gap-3">${msg && html`<span class="text-xs text-green-300">${msg}</span>`}<button class="btn bg-[#1e1e24]" onClick=${save}>保存全部</button></div>
    </header>
    <nav class="mb-5 flex gap-2 text-sm">${[['projects','作品'],['about','关于'],['commission','委托'],['misc','杂项']].map(([k,t])=>html`<button class=${'btn '+(tab===k?'bg-[#1e1e24]':'')} onClick=${()=>setTab(k)}>${t}</button>`)}</nav>

    ${tab==='projects' && html`<div class="space-y-3"><button class="btn" onClick=${addProject}>+ 新作品</button>
      ${data.projects.map(p=>html`<${ProjectRow} key=${p.slug} p=${p} onChange=${np=>setProjects(data.projects.map(x=>x.slug===p.slug?np:x))} onDelete=${slug=>setProjects(data.projects.filter(x=>x.slug!==slug))} />`)}</div>`}

    ${tab==='about' && html`<div class="grid gap-3">
      <div><label>自我介绍 (中)</label><textarea rows="3" onInput=${e=>setSite({...s,about:{...s.about,bio:{...s.about.bio,zh:e.target.value}}})}>${s.about.bio.zh}</textarea></div>
      <div><label>自我介绍 (英)</label><textarea rows="3" onInput=${e=>setSite({...s,about:{...s.about,bio:{...s.about.bio,en:e.target.value}}})}>${s.about.bio.en}</textarea></div>
      <label>社交链接</label>
      ${s.about.links.map((l,i)=>html`<div class="flex gap-2"><input value=${l.label} onInput=${e=>{const links=[...s.about.links];links[i]={...l,label:e.target.value};setSite({...s,about:{...s.about,links}})}} /><input value=${l.href} onInput=${e=>{const links=[...s.about.links];links[i]={...l,href:e.target.value};setSite({...s,about:{...s.about,links}})}} /></div>`)}
    </div>`}

    ${tab==='commission' && html`<div class="grid gap-3">
      <label>服务报价</label>
      ${s.commission.tiers.map((row,i)=>html`<div class="grid grid-cols-3 gap-2"><input value=${row.k} onInput=${e=>{const tiers=[...s.commission.tiers];tiers[i]={...row,k:e.target.value};setSite({...s,commission:{...s.commission,tiers}})}} /><input value=${row.zh} onInput=${e=>{const tiers=[...s.commission.tiers];tiers[i]={...row,zh:e.target.value};setSite({...s,commission:{...s.commission,tiers}})}} /><input value=${row.en} onInput=${e=>{const tiers=[...s.commission.tiers];tiers[i]={...row,en:e.target.value};setSite({...s,commission:{...s.commission,tiers}})}} /></div>`)}
      <div><label>联系方式</label><input value=${s.commission.contact} onInput=${e=>setSite({...s,commission:{...s.commission,contact:e.target.value}})} /></div>
    </div>`}

    ${tab==='misc' && html`<div class="grid gap-3">
      <div><label>首页副标语</label><input value=${s.misc.homeTagline} onInput=${e=>setMisc('homeTagline',e.target.value)} /></div>
      <div><label>装修中提示</label><input value=${s.misc.bannerText} onInput=${e=>setMisc('bannerText',e.target.value)} /></div>
    </div>`}
  </div>`
}
render(html`<${App} />`, document.getElementById('app'))
</script>
</body>
</html>
```

- [ ] **Step 2: Verify UI** — `npm run admin`, open `http://localhost:4000`. Expected: four tabs; Projects lists 9 items; expanding one shows the form with color picker + cover thumbnail.

- [ ] **Step 3: Commit**

```bash
git add admin/ui.html
git commit -m "feat: admin UI (projects/about/commission/misc editors)"
```

---

## Task 7: End-to-end verification + docs note

**Files:**
- Modify: `AGENTS.md` (append a short note)

- [ ] **Step 1: Round-trip test** — with `npm run admin` running: edit a project's 中文名, click 保存全部. Confirm `content/projects.json` changed on disk (`git diff content/projects.json`). Then `npm run dev` and confirm the change shows on the site. Revert the test edit (`git checkout content/projects.json`).

- [ ] **Step 2: Image upload test** — in admin, change one project's 封面 via 换图 (pick any local image). Confirm the file landed in `public/covers/<slug>.jpg` (`git status`). Revert (`git checkout public/covers`).

- [ ] **Step 3: Static build still clean** — `npm run build`. Expected: 7 static pages, no error (admin/ is not scanned by Next).

- [ ] **Step 4: Append to `AGENTS.md`:**

```markdown

## Content admin
Site content lives in `content/projects.json` + `content/site.json` (typed via `content/projects.ts` / `lib/site.ts`). Edit it with the local admin: `npm run admin` (http://localhost:4000) — it writes those JSON files + images under `public/`, never touches git. The static site imports the JSON; run `npm run dev` to preview, then commit + push to deploy.
```

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md
git commit -m "docs: note content admin workflow in AGENTS.md"
```

---

## Self-Review

- **Spec coverage:** projects edit/add/delete/color/images (Task 1,5,6) ✓ · about (Task 2) ✓ · commission (Task 2) ✓ · misc copy (Task 3) ✓ · independent local Node server, no git/deploy (Task 4,5) ✓ · JSON migration with main site importing (Task 1,2) ✓ · workflow admin+dev+manual push (Task 7 + AGENTS) ✓.
- **Placeholders:** none — full JSON, full server, full UI provided.
- **Type consistency:** `Project` fields match projects.ts; `SiteData` (about.links `{label,href}[]`, commission.tiers `{k,zh,en}[]`, contact string, misc `{homeTagline,bannerText}`) matches site.json and the wiring in Tasks 2–3 and the UI in Task 6.
- **Scope note:** misc is limited to homeTagline + bannerText (the two clearly-static copy bits); brand "J / D", city, and "滚动" stay in code/i18n (YAGNI — add later the same way if needed).
- **Risk:** Task 1 must keep projects identical — the integrity test + `git diff` guard this. JSON import needs `resolveJsonModule` (Next 16 default on); Step 4 of Task 1 checks.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
