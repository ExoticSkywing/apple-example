# apple-iphone17-action-button-clone · 克隆笔记

## 源信息
- 原站 URL: https://www.apple.com/iphone-17/
- 研究范围: 只研究并独立重建 `Action button` 这一段的“功能标签 → 硬件定位 → 长按 → 屏幕响应”交互契约。
- 明确不复刻: Ceramic Shield、Colors、Display、Camera Control、Dynamic Island 等其他产品浏览器条目；全站导航、购买路径及其余营销内容。
- 原作者: Apple
- 法务结论（2026-08-09 检查）: Apple 网站使用条款只允许将站内资料下载到单台电脑、仅供个人非商业用途，并禁止复制、转载、公开展示/执行、编码、翻译、传播或分发。官方图片/视频仅存 `RECON/reference-only/` 供内部视觉研究，不进入生产 `public/` 或 `dist/`。交付采用独立 HTML/CSS/SVG/TypeScript 绘制，不发布 Apple 官方媒体或商标。
- 条款: https://www.apple.com/legal/internet-services/terms/site.html

## 在画页面前的任务审查
- 用户最终想得到什么？理解“实体 Action button 可以自定义”，并亲手完成一次长按，看到所选功能立即启动。
- 用户为什么可能在开始前就放弃？不知道哪里可按、不知道要长按、误以为静态广告、手机物理按钮太小、一次短按失败后无恢复提示。
- 哪些步骤可以删除？删除全站导航、购买、规格切换和不相关浏览器条目；只保留选择功能与长按两步。
- 哪些步骤可以自动化？页面自动选中最具演示性的音乐识别模式；自动让手机入场并通过连线定位按钮；成功状态自动留在屏幕上。
- 哪些步骤可通过 Deep Link / 一键复制缩短？本原型无需外部 App 或复制内容，Deep Link 不适用；URL 直接打开即进入唯一任务。
- 每一步完成后如何知道做对？选中项黑底高亮；按住时出现进度与“Keep holding”；成功后动态岛展开、波形运动、状态改为 `Listening for music`，操作说明明确写 `Launched`。
- 页面不一样怎么办？桌面为横向硬件讲解，移动端自动重排为“文字 → 卡片 → 模式 → 手机”，不依赖固定绝对视口。
- 切换 App 后如何回来？任务状态保留在当前页；不跳出网页，也不自动重置。
- 中断后如何继续？短按会显示 `Released early — press and hold again`；Replay 或 Escape 可回到起点。
- 最终完成证据是什么？动态岛展开、状态文字、波形和绿色完成点共同出现。
- 截图是否可转化成直接交互的模型原型？可以；本项目已把截图中的空间映射重建成真实可长按、可切换模式、可失败恢复的交互模型，而不是静态图片。

## 技术栈
- Vite 7 + TypeScript 5 + 原生 HTML/CSS/SVG；没有 3D、框架或运行时依赖。
- 复用已存在的 `apple-lotus-study` Node/Vite/Playwright 项目依赖；没有为新项目重复安装 npm 依赖树。
- 运行 QA 时发现共享缓存缺少当前 Playwright 版本对应的 Firefox 二进制，因此只补装了一次 Firefox 153 到共享缓存；没有安装项目私有浏览器副本。
- Node 22.22.3 / npm 10.9.8。

## 复刻前预判
- 复杂度等级: L4
- 推荐模式: restore（交互契约重建，不复制整站）
- 可高保真的部分: 423×156 半透明圆角卡片、实体按钮定位连线、右侧裁切手机、长按映射、动态岛展开确认。
- 独立替代的部分: 官方 endframe 和视频不公开复用；手机、壁纸、图标、动态岛全部由 CSS/SVG 独立绘制。
- 主要风险: Apple 原站在 Firefox 当前环境中的 MP4 元数据加载报错，参考截图展示的是官方 endframe；本项目不依赖该媒体格式。

## 跑起来
```bash
cd /root/.hermes/profiles/frontend/home/projects/website-clones/apple-iphone17-action-button-clone
npm run dev
```

构建与预览：
```bash
npm run check
npm run build
npm run dev -- --port 4173
```

## 原站 vs 克隆站
| 模块 | 原站表现 | 克隆实现 | 差异 / 取舍 | 证据 |
|---|---|---|---|---|
| Action button 卡片 | 423×156、28px 圆角、`rgba(232,232,237,.72)` | 相同核心几何与扁平无阴影风格 | 增加明确的可折叠按钮与任务提示 | `RECON/screenshots/original-action-expanded-1366x627.png` |
| 硬件指向 | Shazam 图标和细线指向物理按钮 | 独立 SVG 图标 + CSS 连接线 + 真正可操作按钮 | 保留教学映射，不用官方位图 | QA 截图 |
| 长按 | 官方视频演示 | 用户实际 pointer long-press 720ms | 从观看升级为可验证交互 | `scripts/qa.ts` |
| 错误恢复 | 原页主要是营销浏览器 | 短按明确提示重新长按，Replay/Escape 重置 | 优先服务非技术用户完成率 | QA 自动回归 |
| 响应式 | 原站有桌面/移动断点 | 1366×768 与 390×844 两套构图 | 不复制其他产品条目 | QA 截图 |

## 替换地图
- 所有文字与交互状态: `src/main.ts`
- 所有视觉、手机、壁纸和响应式布局: `src/style.css`
- QA: `scripts/qa.ts`
- 官方参考（内部、不得部署）: `RECON/reference-only/`

## 本轮纠偏（用户真机基线）
- 用户真机指出首版与 Apple 原版是两个东西；判断成立。首版把 Product Viewer 错做成了自创教程首屏。
- 已整段删除首版的 Hero 标题、Replay、自创教程卡、横向五图标和绿色提示。
- 当前实现范围改为用户指定的完整横向 Product Viewer：localnav、手机近景、Action button 功能轨、灵动岛状态、右上关闭按钮、底部展开药丸说明卡、左右切换箭头及滑动/点击状态切换。
- `RECON/user-baselines/apple-official-mobile-target.jpg` 是用户提供的 Apple 真机截图，优先级高于自动视觉描述。

## 验证
- [x] `npm run check`：ESLint、TypeScript、Vite build 全部通过
- [x] `npm run qa`：Chromium + Firefox，`1366×768`、`390×720`、`390×844`；左右切换 → 关闭收起 → 重新展开 → 自动回到 Action button；console/page error 都为 0
- [x] 药丸卡在 Chromium/Gecko 均固定 `316×178`（390px 视口），不存在 Gecko 多 25px 的折行漂移
- [x] 已生成新候选截图证据（`RECON/screenshots/clone-v2-*`）
- [x] 最终结构门禁：与用户基线属于同一种 Product Viewer；首版自创教程元素已消失
- 待重新上线到用户已批准的远程测试端口 `44120`；上线前先保持旧错误版本离线。
- 人类最终视觉批准仍由用户完成，代理不自行宣布“完美复刻”。
