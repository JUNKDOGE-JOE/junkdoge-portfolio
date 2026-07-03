# JUNK_DOGE 个人主页

Bilingual (zh/en) portfolio for a 映像创作者 + developer — full-screen project carousel, dual skins (dark media / light dev), synthesized UI sound effects.

## Stack

- Next.js App Router (TypeScript, static export)
- Tailwind CSS v4
- GSAP + Framer Motion + Lenis (animation / scroll)
- Web Audio API (runtime-synthesized SFX, no audio assets)
- Vitest (unit tests)

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build (static export to out/)
npm test         # Vitest unit tests
npm run admin    # local content CMS → http://localhost:4000
```

## Structure

```
app/             # Next.js routes (/, /projects, /about, /commission)
components/      # UI components (Slide, Carousel, skins, furniture, …)
content/
  projects.json  # project data (edited via admin)
  site.json      # site copy: bio, links, commission tiers, misc
lib/             # i18n, carousel logic, sound engine, hooks
admin/           # local-only Express CMS (never part of next build)
public/
  covers/        # cover images (one per project, <slug>.jpg)
  gallery/       # per-project gallery images (<slug>/1..N.jpg)
design-system/   # static HTML design reference (non-runtime)
```

## Content workflow

1. `npm run admin` → edit projects / copy / images at http://localhost:4000 (writes `content/*.json` + `public/`).
2. `npm run dev` to preview.
3. Commit + push to deploy.
