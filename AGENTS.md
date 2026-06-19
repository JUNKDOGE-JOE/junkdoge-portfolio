<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Content admin
Site content lives in `content/projects.json` + `content/site.json` (typed via `content/projects.ts` / `lib/site.ts`). Edit it with the local admin: `npm run admin` (http://localhost:4000) — it writes those JSON files + images under `public/`, never touches git. The static site imports the JSON; run `npm run dev` to preview, then commit + push to deploy. The admin is local-only (binds 127.0.0.1) and is never part of `next build`.
