# JUNK_DOGE — Kinetic Portfolio System

暗色霓虹 × 映像创作的动效组件系统。federicopian 结构 / 中英双语 / GSAP + Lenis 驱动。
这是 `个人主页` 站点抽出的可复用组件库,每个组件一张**自包含 HTML 预览卡**,
可直接浏览器打开,也可经 DesignSync 整体推到 claude.ai/design。

打开 [`index.html`](./index.html) 看整面组件墙。

## 结构

```
design-system/
  index.html                 总览组件墙(iframe 网格)
  foundations/  colors · typography · motion
  boot/         preloader
  navigation/   project-counter · corner-furniture
  motion/       reveal · tilt-card · letter-swap
  showcase/     slide · gallery · scrolling-circles
  skins/        media-image-skin · dev-skin · mouse-gradient
```

## Design Tokens

```css
:root{
  --night:#0a0a0c; --ink:#101015; --bone:#ece8e1; --paper:#f4f2ee;
  --muted:#9a9aa2; --line:#26262e;
  --accent:#7b61ff;   /* dev 紫,作品页随封面主题色 */
  --green:#4ade80;    /* 终端启动屏绿 on #000 */
  --mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  --sc:'Noto Sans SC',system-ui,sans-serif;
}
```

- **Type** — `Noto Sans SC` 正文 / `display-italic` 斜体大标题 / `ui-label` 等宽小标(letter-spacing .2em, uppercase)
- **Motion** — `power3.out` 蒙版上移 · `cubic-bezier(0.4,0,0.25,1)` 缓入 · friction `0.94` 惯性滚动

## 卡片规范

- 首行 `<!-- @dsCard group="..." name="..." subtitle="..." -->`(DesignSync 据此建卡片索引)
- 自包含:内联 CSS/JS,唯一外部依赖是 Google Fonts 的 Noto Sans SC
- 骨架沿用 [`boot/preloader.html`](./boot/preloader.html):左上 `.ds-tag` 组标 · `.ds-head` 标题+描述 · 中间组件 stage · 底部 `.specs` 参数 chip

## 推到 Claude Design

需在带 design scope 的 claude.ai 登录会话(普通终端 `claude` + `/login` 选 Claude account)里:
`DesignSync finalize_plan`(writes: `design-system/**`)→ `write_files`。一次一组,增量推。

🤖 Generated with [Claude Code](https://claude.com/claude-code)
