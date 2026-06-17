# JUNK_DOGE 个人主页 — 设计文档

- 日期：2026-06-17
- 状态：待评审（draft）
- 对标：https://www.federicopian.com/
- 工作目录：`E:\Code\个人主页`

---

## 1. 目标与成功标准

为 **JUNK_DOGE / Joe**（GitHub `JUNKDOGE-JOE`）打造一个动效完备、设计优美的个人主页。承载其 **「映像创作者 × 创意开发者」** 双重身份，采用 federicopian 的**结构精致度**，但皮肤换成 **内容驱动 + 暗黑霓虹** 的个人 DNA。

成功标准：
1. 一眼传达双重身份（PV/VJ/映像 + dev 工具）。
2. federicopian 级的编辑式排版 + 流畅动效（目标 60fps，移动端不发烫）。
3. 内容易维护：新增作品 = 加一条数据 + 一张封面图。
4. 中英文可切换。

## 2. 对标分析（federicopian.com，已实测）

- 框架 **Nuxt(Vue) + Tailwind**；一层 **fixed 全屏画布**做流体渐变氛围（每项目换色）+ 每项目一个 3D 物体。
- **Safiro** 字体，巨型**斜体 grotesk** 标题。
- 结构 = **固定视口的单项目轮播**（非原生滚动；Prev/Next + 滚轮），**不是图片网格**。
- **圆形母题**贯穿（项目计数器 / 项目主视觉 / about 统计 / 肖像）。
- 角落家具：字标、当地实时钟、PROJECTS/ABOUT、换肤钮、portfolio 年份、scroll。预加载 0→100%。

**我们采纳「结构」，重做「皮肤」**：用 React/Next 自建，皮肤由内容类型驱动（见 §6）。

## 3. 信息架构

| 路由 | 说明 | 阶段 |
|---|---|---|
| `/` | 精选作品**轮播**（固定视口，← → / 滚轮 / 拖拽 / 键盘切换） | v1 |
| `/about` | 双重身份、头像、平台、（Awards/合作 可选） | v1 |
| `/commission` | 委托底价 & 须知 | v1 |
| `/works` | 完整作品集，分类 PV·映像 / VJ / 合作 / Dev | later |
| `/work/[slug]` | 项目详情：B站嵌入看全片 + 描述 + 外链 | later |

联系方式（QQ / 微信 / 邮箱 / B站）置于 `/about` 与 footer。

## 4. 内容数据模型（双语）

单一数据源 `content/projects.ts`（类型化）。首页用**封面图**，不在首页放自动播放视频。

```ts
type ProjectType = 'pv' | 'vj' | 'collab' | 'dev';

interface Project {
  slug: string;
  type: ProjectType;            // 决定皮肤：影像类=暗/封面驱动，dev=亮色
  featured: boolean;            // 是否进首页轮播
  order: number;                // 首页顺序（扶桑=1）
  year: string;
  title: { zh: string; en: string };
  role: { zh: string; en: string };   // 如 "PV · BOF21" / "Dev Tool · AE Automation"
  desc: { zh: string; en: string };
  cover: string;                // 首页封面图（/public/covers/*），影像类做模糊底+圆裁
  devVisual?: string;           // dev 类的圆形视觉（logo/截图/3D 渲染）
  accent?: string;              // 可选：从封面取的主色，用于 tint UI
  links: { bilibili?: string; github?: string; external?: string };
}
```

## 5. 首页轮播（核心交互）

- **固定视口**、单项聚焦；切换方式：← → 箭头 / 滚轮 / 拖拽 / 键盘方向键。
- **影像类（pv/vj/collab）皮肤**：
  - 背景 = `cover` 的**高斯模糊**（小尺寸放大 + 轻 CSS blur，省 GPU）。
  - 右下圆 = `cover` 的**清晰圆形裁切**（`clip-path`/`border-radius` + `object-fit:cover`）。
  - 配色自动来自封面（可选 `accent` tint 整个 UI）。
- **dev 类皮肤**：暖白渐变背景（federicopian A 款）+ 右下圆 = `devVisual`。
- **左下圆形计数器**：`PROJECT / 0X / NUMBER`，含 ← →。
- **角落家具**见 §6。

## 6. 视觉系统

- **色彩**：影像逐项 from cover；dev 统一暖白 `#efe9e3` + 深墨字 `#1c1a17`；暗色霓虹强调色（cyan `#36e6ff` / magenta `#ff2fd0`）。
- **字体**：**Noto Sans SC**（中英统一，免费）。展示用重字重（700/900）拉开层级；小标签用拉丁大写字距（WORKS / PROJECT / SCROLL）。
  - 备注：放弃了斜体 grotesk 展示味，惊艳感由色彩+动效承担；未来如需更强设计感可加一支拉丁展示斜体（如 Switzer）。
- **圆形母题**贯穿：左下计数器 · 右下作品圆 · about 统计/头像。
- **角落家具**：`J / D` 字标 · 当地实时钟 · WORKS/ABOUT 导航 · **中 / EN 语言切换** · portfolio 年份 · scroll 提示。

## 7. 动效系统

- **预加载器** 0→100%（首屏资源就绪前）。
- **切项目转场**：GSAP —— 标题/封面做 mask·scale·交叉淡入，背景色平滑过渡。
- **Lenis** 平滑滚动（用于 about / commission / 后续 works·详情页）。
- **自定义磁吸光标**（hover 按钮/箭头吸附）—— 可选，可后置。
- **降级**：`prefers-reduced-motion` 下关闭大动效；移动端用更小封面、简化转场。

## 8. 技术架构

- **栈**：Next.js(App Router) + TypeScript + Tailwind + GSAP + Lenis。**不上 R3F/WebGL**（v1）。
- **i18n（v1 定案）**：轻量自建 —— `content` 内中英两套文案 + 一个全局 `LangContext` + `中/EN` 切换钮，切换即时、不走 locale 路由前缀（站点小、无需 per-locale URL）。未来若要 SEO 分语言 URL 再迁 `next-intl`。
- **内容**：`content/projects.ts` + `/public/covers/*`（封面图，`next/image` 优化）+ B站 `bvid`（详情页）。
- **组件分解（各司其职、可独立测试）**：
  - `<Preloader>` · `<CarouselRoot>`（管 index/手势/键盘）· `<Slide>` · `<MediaImageSkin>`（影像：模糊底+圆裁）· `<DevSkin>`（亮色）· `<CircleCrop>` · `<ProjectCounter>` · `<CornerFurniture>`（`<Clock>` `<Nav>` `<LangToggle>`）· `<MagneticCursor>`(可选) · `<AppShell>`(layout)。
- **状态**：当前 index、语言、(可选主题)。轮播状态用一个 reducer/store（zustand 或 context）。
- **性能**：封面 `next/image` 懒加载 + 相邻预载；只渲染当前及相邻 slide；blur 用降采样而非大半径滤镜。

## 9. v1 范围 & 内容清单

**v1 交付**：首页轮播（9 项，静态封面）+ `/about` + `/commission` + 联系 + 中英切换 + 预加载 + 转场。

**首页内容（顺序可微调）**：

| # | 作品 | 类型 | 全片链接 |
|---|---|---|---|
| 01 | 扶桑 / THE FUSOR ARBOR | pv（置顶）| Bilibili |
| 02 | 镜之塔 / Tales of Endless Tower | pv（音游）| Bilibili |
| 03 | Centripetal Force | pv（BOF:TT）| Bilibili |
| 04 | 破禁 先行PV | pv（独立游戏）| 小红书（`links.external`）|
| 05 | 融っ / original song | pv（原创曲）| Bilibili |
| 06 | 二十九行诗 / 春日限原创曲 | pv（原创曲）| Bilibili |
| 07 | 延误列车 / ラグトレイン | pv（文字PV）| Bilibili |
| 08 | 音波狂潮 | vj | Bilibili |
| 09 | after-effects-mcp ⭐22 | dev（殿后）| GitHub |

> 规则：扶桑置顶、视频作品优先、dev 殿后。**不进首页**：无尽夏变奏曲、无人区玫瑰。

**later 阶段**：`/works` 全索引 + `/work/[slug]` 详情（B站全片）+ Awards/合作板块 + 自定义光标 + 可选 WebGL（封面液态扭曲 / dev 3D 视觉）升级。

## 10. 可访问性 & 兼容

- 轮播键盘可操作（方向键 + focus 可见 + `aria-label`）。
- `prefers-reduced-motion` 降级；语言切换更新 `lang` 属性。
- 移动端触摸切换 + 更小资产。

## 11. 需你提供的资产

- 各作品**封面图**（视频截一帧，建议长边 ≥1600px）。
- **头像**。
- 各作品 **B站 bvid** / GitHub 链接。
- **bio**（中英）、**委托底价**文案（中英）、当地城市（实时钟用）。

## 12. 待定 / 未来

- 主色自动提取（从封面）可后置。
- 部署目标待确认（默认 Vercel）。
- `换肤(亮/暗)` 全局开关：本设计背景已由内容驱动，此钮可省或仅切 UI 强调色 —— v1 暂不做。

---

*下一步：评审本文档 → `writing-plans` 生成实施计划 → 实现 v1。*
