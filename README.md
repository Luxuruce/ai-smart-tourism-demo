# 景区口碑与体验 MVP · 可运行前端原型

依据《开发交接文档》实现：游客端 9 屏（uni-app）+ 景区后台 3 页（Vue 3），数据全部来自本地 mock，不接后端和大模型。

在线演示（GitHub Pages）：<https://luxuruce.github.io/ai-smart-tourism-demo/>。推送到 `main` 后由 `.github/workflows/pages.yml` 自动打包发布。

## 运行

需要 Node 20+ 和 pnpm 9（`corepack enable` 后会按 `packageManager` 字段自动使用 pnpm 9.15.9）。

```bash
pnpm install
pnpm dev:visitor   # 游客端 H5 → http://localhost:5173
pnpm dev:admin     # 景区后台   → http://localhost:5174
```

- 游客端在桌面浏览器里会显示成 390 宽的手机画框；也可以用手机直接访问局域网地址。
- 小程序：`pnpm --filter visitor build:mp-weixin`（或 `build:mp-toutiao`），用微信 / 抖音开发者工具导入 `visitor/dist/build/mp-weixin`（或 `mp-toutiao`）。`manifest.json` 里的 appid 为空，需自行填写。
- 类型检查：`pnpm typecheck`。

### 演示空数据和异常

所有 services 都走 `packages/shared/delay.ts` 的 `mockRequest`（300ms 延迟）。在地址上加参数即可让全部接口返回空数据或报错：

| 端 | 空数据 | 异常 |
|-|-|-|
| 游客端 | `http://localhost:5173/?mock=empty#/` | `http://localhost:5173/?mock=error#/` |
| 后台 | `http://localhost:5174/?mock=empty#/` | `http://localhost:5174/?mock=error#/` |

小程序端在开发者工具的「启动参数」里填 `mock=empty` 或 `mock=error`。

## 目录

```
app/
├─ packages/shared/     类型（types.ts）、颜色 token（tokens.ts）、mock 数据（mock/*.ts）、假网络（delay.ts）
├─ visitor/             uni-app 游客端
│  ├─ src/pages/        9 个页面，路由见交接文档 4.1
│  ├─ src/components/   Icon、PlaceholderButton、SwitchToggle、HeatChip、StateView、FabFeedback
│  ├─ src/stores/       theme、persona、trip、feedback、collection、prefs、mapFocus
│  ├─ src/services/     假 API；页面只从这里取数据
│  ├─ src/icons.ts      图标登记表（路径 + 用到的颜色 token）
│  └─ scripts/gen-icons.mts  生成 static/ 下的图标 SVG、tabBar PNG、地图底图
└─ admin/               景区后台（views / components / services / stores）
```

### 主题怎么实现

- 颜色只在 `packages/shared/tokens.ts` 里定义。页面样式一律写 `var(--token)`，不写十六进制颜色。
- 游客端每个页面第一行是 `<page-meta :page-style="pageStyle">`，把当前主题的全部 token 作为 CSS 变量挂到 page 上（H5 和小程序通用）。
- 原生 tabBar 不认 CSS 变量，切换主题时由 `stores/theme.ts` 调 `uni.setTabBarStyle` / `uni.setTabBarItem` 换颜色和亮暗两套 PNG 图标。
- 小程序不支持内联 `<svg>`：图标按「图标 × 颜色 × 主题」导出成 SVG 文件，`<Icon name color>` 用 `<image>` 引用。新增图标或颜色组合时，在 `src/icons.ts` 登记后运行 `pnpm --filter visitor gen:icons`，生成的文件需要提交。
- 尺寸统一用 `r($px)`（定义在 `visitor/src/uni.scss`），按 390 设计宽换算成 rpx。

## 验收情况

交接文档第 10 节的演示脚本已用 Playwright 在 H5（390×844）和后台（1440×900）上逐步跑通，第 1–11 步全部通过，控制台无报错。`mp-weixin` 和 `mp-toutiao` 均编译通过；**尚未在微信 / 抖音开发者工具和真机里运行过**，小程序端的视觉和交互还需要在开发者工具里过一遍。

## 交付说明：与交接文档或原型的差异

需要确认或了解的地方：

1. **地图底图**用原型里的简单矢量线（水系 + 道路）占位，未做插画（交接文档第 12 节要求列出）。
2. **替代机位的数据结构**：没用草案里的 `altIds`，改为 `Spot.alts: AltSpot[]`。原因是替代机位的描述（步行几分钟、构图）是相对原机位的，而且「文昌阁背面月洞门」不在地图景点里。「只推荐热度低或中」在 `services/spot.ts` 里过滤。
3. **AI 回答的「依据」挂在每条 AI 回答上**，不是挂在整个对话场景上。「文昌阁的来历」里第二条（暂无考据）按原型不显示依据行，只显示「已记录为待补充问题」。
4. **排队页内容**：原型只写了文昌阁的讲解、小任务和商户，其他机位进入排队页时复用这套内容，只替换机位名。
5. **「我的 → 我的行程」**：预约前显示「还没有预约观光车 ›」（原型只画了已预约状态）。「我的优惠券」按排队页领券结果显示张数。
6. **后台「分派规则设置」**：原型是实线按钮，按交接文档第 7 节做成虚线占位。

在原型基础上补充的小功能（都是为了跨页跳转自然）：

- 跳到地图时可以直接选中目标，例如安全页「离你最近」、首页「厕所服务点」、AI 导游「在地图上看状元祠」、排队页「去看看 石拱桥」。
- 首页宫格「约观光车」和地图观光车卡片「预约观光车」会直接打开行程页的「观光车预约」tab。
- 排队页播放键可以在播放 / 暂停之间切换（原型只有暂停图标）。
- 小程序端标题字体用 `uni.loadFontFace` 从 jsDelivr 的 fontsource 加载，地址在 `visitor/src/App.vue`。正式上线前建议换成自己的 CDN 并做字体子集化。
