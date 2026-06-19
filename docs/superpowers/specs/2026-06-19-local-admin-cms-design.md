# 本地内容管理后台 (Local Admin CMS) — 设计

**日期:** 2026-06-19
**项目:** junkdoge-portfolio (个人主页)
**状态:** 已批准设计,待实现

## 目标

给这个静态导出的个人主页配一个**只在本地运行**的内容管理后台,让非代码方式维护站点内容:

- 作品:改中英名字、简介、角色、年份、类型;改主题渐变色;换封面图、画廊图;增加 / 删除作品
- 关于页:自我介绍(bio)、社交链接(B站 / GitHub / 邮箱)
- 委托页:服务报价表、联系方式
- 站点杂项文案:首页副标语、装修中提示、顶部 J/D、城市、滚动提示等

## 约束与非目标

**约束**
- 主站是 Next.js **静态导出** (`output: 'export'`),没有运行时后端 → admin 必须是独立的本地工具,不能跟随站点部署。
- 单人、本机使用,信任环境 → **不做登录 / 认证 / 多用户**。
- 上线方式:admin 只改本地文件,用户**自己** `git push`,Cloudflare 自动重建。admin **不碰 git、不部署**。

**非目标**
- 不集成 git / 一键发布
- 不做撤销 / 版本历史(git 本身就是历史)
- 不做权限、协作、审计
- admin UI 不做国际化(界面用中文即可)

## 架构

独立本地 Node 服务(方案 1),与主站完全隔离,不进入静态 build。

```
个人主页/
  admin/
    server.mjs        Express 服务: 读写 content JSON + public 图片
    ui.html           单页前端 (React + Tailwind 走 CDN, 免构建)
  content/
    projects.json     ← 作品数据 (新, 数据源)
    site.json         ← 关于/委托/杂项文案 (新, 数据源)
    projects.ts       ← 改为 import projects.json (主站照常 import)
  public/covers, public/gallery   ← 图片, admin 写入目标
```

- `npm run admin` → 启动 Express(如 `localhost:4000`),serve `ui.html` + API。
- 改内容时同时开 `npm run dev`(`localhost:3000`),Next 热更新实时预览。
- 新依赖(devDependencies): `express`, `multer`(图片上传)。

## 数据模型

### content/projects.json
作品数组,字段沿用现有 `Project` 类型(`content/projects.ts`):
```json
[
  { "slug": "fusang", "type": "pv", "featured": true, "order": 1, "year": "2024",
    "title": { "zh": "扶桑", "en": "THE FUSOR ARBOR" },
    "role":  { "zh": "PV · BOF21", "en": "PV · BOF21" },
    "desc":  { "zh": "...", "en": "..." },
    "cover": "/covers/fusang.jpg",
    "accent": "#3c5347",
    "links": { "bilibili": "https://..." } }
]
```
- `devVisual?` 仅 dev 作品;画廊图按现有约定 `/gallery/<slug>/<n>.jpg`(由 `galleryFor()` 派生,不存 JSON,admin 上传时按此命名)。

### content/site.json
```json
{
  "about": {
    "bio": { "zh": "...", "en": "..." },
    "links": { "bilibili": "...", "github": "...", "email": "..." }
  },
  "commission": {
    "services": [ { "name": { "zh": "文字PV / Lyric", "en": "..." }, "price": { "zh": "按时长与复杂度报价", "en": "..." } } ],
    "contact": { "qq": "...", "wechat": "...", "email": "..." }
  },
  "misc": {
    "brand": "J / D",
    "location": "HANGZHOU",
    "homeTagline": { "zh": "PV · VJ · 映像创作 × 创意开发", "en": "..." },
    "bannerText": { "zh": "装修中 · 持续完善", "en": "..." },
    "scrollHint": { "zh": "滚动", "en": "scroll" }
  }
}
```

### content/projects.ts (改造)
```ts
import data from './projects.json'
export const projects: Project[] = data as Project[]
// 类型定义保留
```
关于 / 委托 / layout / CornerFurniture 等组件改为读 `site.json`(经一个 `lib/site.ts` 包装导出,类型化)。

## admin 服务 API (admin/server.mjs)

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/api/data` | 返回 `{ projects, site }` |
| PUT | `/api/projects` | 全量保存作品数组 → `projects.json` |
| PUT | `/api/site` | 保存 `site.json` |
| POST | `/api/upload` | `multipart`: 图片存入 `public/covers/<slug>.jpg` 或 `public/gallery/<slug>/<n>.jpg`,返回相对路径 |
| DELETE | `/api/projects/:slug` | 从数组删除该作品(可选连带删其图片) |

- 写 JSON 用 2-space 缩进、保持字段顺序,便于 git diff。
- 仅监听 `127.0.0.1`,只读写项目内 `content/`、`public/` 路径(防越界)。
- 增 / 删作品在前端改数组后整体 `PUT /api/projects` 即可(无需单独 add 接口)。

## admin 界面 (admin/ui.html)

单页,Express 直接 serve;React + Tailwind 走 CDN(esm.sh + htm,免构建步骤)。左侧标签切换四个区:

- **作品** — 卡片/行列表;每项可展开表单:中英 title/role/desc、year、type 下拉、`featured`/`order`、**accent 颜色选择器**(色块 + hex 输入,实时预览)、links;**封面 + 画廊图**:缩略图 + 点击/拖拽上传替换(传 `/api/upload`,回填路径);顶部「+ 新作品」、每项「删除」。
- **关于** — bio(中英多行)、社交链接。
- **委托** — 服务表(增删行,每行中英名 + 报价)、联系方式。
- **杂项文案** — misc 各字段。
- 顶部「保存」:`PUT /api/projects` + `PUT /api/site`;保存后提示「已写入,记得开着 dev 预览,满意后自己 git push」。

## 工作流

1. `npm run admin`(localhost:4000)改内容 + 传图
2. 另开 `npm run dev`(localhost:3000)实时预览
3. 满意 → `git add . && git commit -m "content: ..." && git push` → Cloudflare 重建上线

## 受影响文件

**新建:** `content/projects.json`、`content/site.json`、`lib/site.ts`、`admin/server.mjs`、`admin/ui.html`
**修改:** `content/projects.ts`(import json)、`app/about/page.tsx`、`app/commission/page.tsx`、`components/furniture/CornerFurniture.tsx`、`app/layout.tsx`(banner)、首页 tagline 所在组件、`package.json`(script `admin` + devDeps)
**注意:** 静态 build 不读 `admin/`;`admin/` 下不放任何被 Next 扫描的路由。

🤖 Generated with [Claude Code](https://claude.com/claude-code)
