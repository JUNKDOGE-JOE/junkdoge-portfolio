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

// serve existing images so the UI can show current cover/gallery thumbnails
app.use('/covers', express.static(path.join(PUBLIC, 'covers')))
app.use('/gallery', express.static(path.join(PUBLIC, 'gallery')))

const readJson = async (f) => JSON.parse(await fs.readFile(path.join(CONTENT, f), 'utf8'))
const writeJson = async (f, data) => fs.writeFile(path.join(CONTENT, f), JSON.stringify(data, null, 2) + '\n', 'utf8')

// keep every write inside public/ — reject path escapes
const safePublic = (rel) => {
  const p = path.resolve(PUBLIC, rel.replace(/^\/+/, ''))
  if (p !== PUBLIC && !p.startsWith(PUBLIC + path.sep)) throw new Error('path escape')
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
    if (!req.file) return res.status(400).json({ error: 'no file' })
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
