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
    cover: '/covers/fusang.jpg', accent: '#3c5347', links: { bilibili: 'https://www.bilibili.com/video/BV126WEz3EjX/' } },

  { slug: 'mirror-tower', type: 'pv', featured: true, order: 2, year: '2024',
    title: { zh: '镜之塔', en: 'Tales of Endless Tower' }, role: { zh: 'PV · 音游', en: 'PV · Rhythm Game' },
    desc: { zh: '音乐游戏《镜之塔》PV 第一部分。', en: 'Promo video for the rhythm game Mirror Tower, part one.' },
    cover: '/covers/mirror-tower.jpg', accent: '#534249', links: { bilibili: 'https://www.bilibili.com/video/BV1XhSXYKEyM/' } },

  { slug: 'centripetal-force', type: 'pv', featured: true, order: 3, year: '2023',
    title: { zh: 'Centripetal Force', en: 'Centripetal Force' }, role: { zh: 'PV · BOF:TT', en: 'PV · BOF:TT' },
    desc: { zh: '为 BOF:TT 制作的影像作品。', en: 'A visual piece made for BOF:TT.' },
    cover: '/covers/centripetal-force.jpg', accent: '#2c2a2f', links: { bilibili: '' } },

  { slug: 'pojin', type: 'pv', featured: true, order: 4, year: '2025',
    title: { zh: '破禁 先行PV', en: 'PoJin — Teaser PV' }, role: { zh: 'PV · 独立游戏', en: 'PV · Indie Game' },
    desc: { zh: '独立游戏《破禁》先行 PV。', en: 'Teaser PV for the indie game PoJin.' },
    cover: '/covers/pojin.jpg', accent: '#430215', links: { external: 'https://www.xiaohongshu.com/explore/68de4490000000000700e4f7' } },

  { slug: 'yu', type: 'pv', featured: true, order: 5, year: '2024',
    title: { zh: '融っ', en: '融っ / original song' }, role: { zh: 'PV · 原创曲', en: 'PV · Original Song' },
    desc: { zh: '原创曲《融っ》影像。', en: 'Visual for the original song "融っ".' },
    cover: '/covers/yu.jpg', accent: '#2f3b47', links: { bilibili: 'https://www.bilibili.com/video/BV1WktCzDEdT/' } },

  { slug: 'sonnet-29', type: 'pv', featured: true, order: 6, year: '2024',
    title: { zh: '二十九行诗', en: 'Sonnet 29' }, role: { zh: 'PV · 春日限原创曲', en: 'PV · Original Song' },
    desc: { zh: '春日限原创曲《二十九行诗》影像。', en: 'Visual for the original spring-themed song "Sonnet 29".' },
    cover: '/covers/sonnet-29.jpg', accent: '#2e3233', links: { bilibili: 'https://www.bilibili.com/video/BV1yZKNecEp9/' } },

  { slug: 'shoujo', type: 'pv', featured: true, order: 7, year: '2024',
    title: { zh: '少女終幕', en: 'Aru Shoujo no Shimatsu' }, role: { zh: 'PV · 原创曲', en: 'PV · Original Song' },
    desc: { zh: '少女終幕｜ある少女の始末（原创曲）影像。', en: 'Visual for the original song "Aru Shoujo no Shimatsu".' },
    cover: '/covers/shoujo.jpg', accent: '#9e6d9d', links: {} },

  { slug: 'fusheng', type: 'vj', featured: true, order: 8, year: '2024',
    title: { zh: '浮生', en: 'Fusheng' }, role: { zh: 'VJ · 文字动画', en: 'VJ · Lyric Motion' },
    desc: { zh: '陈致逸作品音乐会 ——《浮生》文字动画。', en: 'Kinetic-lyric animation for the Chen Zhiyi concert — "Fusheng".' },
    cover: '/covers/fusheng.jpg', accent: '#999297', links: { bilibili: 'https://www.bilibili.com/video/BV178k1YuEXo/' } },

  { slug: 'after-effects-mcp', type: 'dev', featured: true, order: 9, year: '2026',
    title: { zh: 'after-effects-mcp', en: 'after-effects-mcp' }, role: { zh: 'Dev · AE 自动化', en: 'Dev · AE Automation' },
    desc: { zh: 'Agent 驱动的 AE 自动化：MCP + CEP，让 AI 用 30+ 工具操控 After Effects。⭐22', en: 'Agent-driven After Effects automation: MCP + CEP plugin, 30+ ae.* tools. ⭐22' },
    cover: '/covers/aemcp.jpg', devVisual: '/covers/aemcp.jpg', accent: '#7b61ff',
    links: { github: 'https://github.com/JUNKDOGE-JOE/after-effects-mcp' } },
]
