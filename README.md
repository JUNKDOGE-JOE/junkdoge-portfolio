# JUNK_DOGE 个人主页

Federicopian-style bilingual (zh/en) portfolio carousel for a 映像创作者 + developer.

## Stack

- Next.js App Router (TypeScript)
- Tailwind CSS v4
- GSAP + Lenis (scroll / animation)
- Vitest (unit tests)

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build (also used as runtime check)
npm test         # Vitest unit tests
```

## Structure

```
app/             # Next.js routes (page, layout, globals)
components/      # UI components (Slide, Carousel, skins, …)
content/
  projects.ts    # single source of truth for all project data
lib/             # i18n, carousel logic, time helpers, selection logic
public/
  covers/        # cover images (one per project, <slug>.jpg)
```

## Add a project

1. Append an entry to `content/projects.ts` following the existing shape.
2. Drop a cover image at `public/covers/<slug>.jpg`.

## Notes

- `public/covers/*` are currently 1×1 placeholder images — replace with real cover frames.
- Two projects (`centripetal-force`, `lagtrain`) are missing real Bilibili `bvid`s; their visit links are hidden until filled in.

## Deferred (later)

- `/works` index page
- `/work/[slug]` detail pages with Bilibili embeds
- Magnetic cursor
- Optional WebGL upgrade
