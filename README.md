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

### 字体

H5 和后台都内嵌了裁剪过的 Noto Sans SC / Noto Serif SC（约 260 KB + 320 KB，woff2），不依赖 Google Fonts，国内网络也能正常显示。

- 字体只包含源码里出现过的字（约 980 个汉字）加常用标点。游客在输入框里打的字如果不在其中，会回退系统字体。
- 新增文案出现新汉字后，重新运行 `python scripts/subset-fonts.py <字体源文件目录>`，脚本开头写了依赖和字体下载地址。生成的文件需要提交。
- 游客端字体放在 `visitor/src/static/web/`，这个目录只打包进 H5，不进小程序包。
- 字体按 SIL Open Font License 1.1 授权，授权文本见 `packages/shared/fonts/OFL.txt`。

### 主题怎么实现

- 颜色只在 `packages/shared/tokens.ts` 里定义。页面样式一律写 `var(--token)`，不写十六进制颜色。
- 游客端每个页面第一行是 `<page-meta :page-style="pageStyle">`，把当前主题的全部 token 作为 CSS 变量挂到 page 上（H5 和小程序通用）。
- 原生 tabBar 不认 CSS 变量，切换主题时由 `stores/theme.ts` 调 `uni.setTabBarStyle` / `uni.setTabBarItem` 换颜色和亮暗两套 PNG 图标。
- 小程序不支持内联 `<svg>`：图标按「图标 × 颜色 × 主题」导出成 SVG 文件，`<Icon name color>` 用 `<image>` 引用。新增图标或颜色组合时，在 `src/icons.ts` 登记后运行 `pnpm --filter visitor gen:icons`，生成的文件需要提交。
- 尺寸统一用 `r($px)`（定义在 `visitor/src/uni.scss`），按 390 设计宽换算成 rpx。

## 验收情况

按《开发交接文档》v1.1 第 13.5 节的演示脚本（13 步），用 Playwright 在 H5（390×844）和后台（1440×900）上逐步跑通，全部通过，控制台无报错；所有虚线占位按钮点击后页面不变。`mp-weixin` 和 `mp-toutiao` 均编译通过；**尚未在微信 / 抖音开发者工具和真机里运行过**，小程序端的视觉和交互还需要在开发者工具里过一遍。

## 交付说明：与交接文档或原型的差异

需要确认或了解的地方：

1. **地图底图**用原型里的简单矢量线（水系 + 道路）占位，未做插画（交接文档第 12 节要求列出）。
2. **替代机位的数据结构**：没用草案里的 `altIds`，改为 `Spot.alts: AltSpot[]`。原因是替代机位的描述（步行几分钟、构图）是相对原机位的，而且「文昌阁背面月洞门」不在地图景点里。「只推荐热度低或中」在 `services/spot.ts` 里过滤。
3. **AI 回答的「依据」挂在每条 AI 回答上**，不是挂在整个对话场景上。所有 AI 回答都有依据行；自由提问的固定演示提示不算 AI 回答，不加依据行（清单 9.2.9）。
4. **「我的 → 我的行程」**：预约前显示「还没有预约观光车 ›」（原型只画了已预约状态）。「我的优惠券」按排队页领券结果显示张数。
5. **后台「分派规则设置」**：原型是实线按钮，按交接文档第 7 节做成虚线占位。

v1.1 开发中按判断处理、交接文档没有写到的细节：

1. **地图坐标微调**（清单 9.2.7）：休息点「荷塘边长椅」由 (160, 255) 改为 (170, 245)，否则会被石拱桥的图钉气泡盖住。另外，等待时长改为「X 分钟」后文昌阁的气泡变宽，会盖住「状元祠北侧洗手间」的图标，所以把这个图标左移 8px（x 由 28 改为 20）。后者不在 9.2.7 的范围内，但原因相同，请产品知悉。
2. **没有专属内容的机位**（荷塘廊桥、文昌阁背面月洞门）进入排队页时，没有排队数据可用：计时显示 00:00，页头写「刚开始排队 / 预计还需 X 分钟」，X 取该机位的等待时间。
3. **打卡模式的文案**：页头右侧为「回到地图」（排队模式是「不排了」）；拍完页评价标题为「这次打卡体验怎么样？」；机位详情底部说明为「打卡时可以听讲解、做观察小任务」；「打卡完成」下面不显示副标题。
4. **小任务选项加量词**：数字选项显示为「3 只」「3 层」「3 个」，与题目的问法一致。
5. **观光车**：改约弹窗为「改约为 16:30？原 16:00 的预约会自动取消」；取消预约弹窗为「取消后，16:30 班次的 2 个座位会释放给其他游客」；底部「取消预约」链接写明时段和座位数。
6. **一键求助**：按钮内加一行小字「按住 2 秒」。
7. **同行人绑定**：H5 和小程序都用模拟方式，点「分享给同行人」即视为绑定成功。小程序真实分享需要用 `<button open-type="share">`，正式开发时再接。
8. **派单**：弹窗底部说明「确认后生成工单 #1028，并通知责任人」；派单后预警卡片上的链接变为「查看工单」。工单详情「处理结果」输入框的提示文字为「例如：已补充厕纸并拖干地面」。

在原型基础上补充的小功能（都是为了跨页跳转自然）：

- 跳到地图时可以直接选中目标，例如安全页「离你最近」、首页「厕所服务点」、AI 导游「在地图上看状元祠」、排队页「去看看 石拱桥」。
- 首页宫格「约观光车」和地图观光车卡片「预约观光车」会直接打开行程页的「观光车预约」tab。
- 排队页播放键可以在播放 / 暂停之间切换（原型只有暂停图标）。
- 小程序端标题字体用 `uni.loadFontFace` 从 jsDelivr 的 fontsource 远程加载（约 1.5 MB），地址在 `visitor/src/App.vue`；加载失败时回退系统字体。正式上线前建议把上文「字体」一节的裁剪字体放到自己的 CDN，并在小程序后台配置 downloadFile 合法域名。
