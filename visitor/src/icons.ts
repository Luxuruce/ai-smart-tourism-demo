// 图标登记表：原型里用到的 24×24 线性图标。
// 小程序不支持内联 <svg>，所以由 scripts/gen-icons.ts 按「图标 × 颜色 token × 主题」
// 导出成 static/icons/{light|dark}/{name}--{color}.svg，页面用 <Icon> 组件以 <image> 引用。
// 新增图标或颜色组合后运行 `pnpm gen:icons`。
import type { TokenName } from '@qs/shared'

export interface IconDef {
  /** SVG 内部元素（24×24 坐标系） */
  body: string
  strokeWidth?: number
  /** 实心图标（如暂停键）用 fill 着色 */
  filled?: boolean
  colors: TokenName[]
}

const T: TokenName = 'text'

export const icons = {
  sun: { body: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>', colors: ['on-color'] },
  moon: { body: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>', colors: ['on-color'] },
  search: { body: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>', colors: ['on-primary-disabled'] },
  clock: { body: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', colors: ['warn-fg'] },
  pin: { body: '<path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>', colors: ['danger-fg', 'action-fg'] },
  'chat-dots': { body: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 20 12z"/><path d="M9 11h.01M12 11h.01M15 11h.01"/>', colors: ['ok-fg'] },
  route: { body: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>', colors: ['primary-fg'] },
  bus: { body: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M7 20v-3M17 20v-3"/>', colors: ['primary-fg'] },
  'shield-plus': { body: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 9v6M9 12h6"/>', colors: ['danger-fg'] },
  book: { body: '<path d="M4 19V6a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2z"/><path d="M9 8h5"/>', colors: ['warn-fg'] },
  report: { body: '<path d="M4 5h16v11H9l-5 4z"/><path d="M12 8v3M12 13.5v.5"/>', colors: [T] },
  scan: { body: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3"/>', colors: ['icon-disabled'] },
  globe: { body: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17M12 3.5c-2.5 2.5-2.5 14.5 0 17"/>', colors: ['icon-disabled'] },
  message: { body: '<path d="M4 5h16v11H9l-5 4z"/>', strokeWidth: 2, colors: ['on-color'] },
  layers: { body: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', colors: [T] },
  locate: { body: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>', colors: ['icon-disabled', T] },
  back: { body: '<path d="M15 18l-6-6 6-6"/>', strokeWidth: 2, colors: [T, 'on-color'] },
  star: { body: '<path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z"/>', colors: ['icon-disabled'] },
  image: { body: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>', strokeWidth: 1.5, colors: ['text-2'] },
  wave: { body: '<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>', strokeWidth: 2, colors: ['primary-fg'] },
  play: { body: '<path d="M8 5v14l11-7z"/>', filled: true, colors: ['on-color'] },
  pause: { body: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>', filled: true, colors: ['on-color'] },
  check: { body: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', strokeWidth: 2.2, colors: ['ok-fg'] },
  warning: { body: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>', strokeWidth: 2, colors: ['danger-fg'] },
  mic: { body: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', strokeWidth: 2, colors: [T, 'on-color', 'icon-disabled'] },
  camera: { body: '<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>', colors: [T, 'icon-disabled'] },
  // —— tabBar（导出为 PNG，见 tabBarIcons）——
  home: { body: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>', colors: [] },
  map: { body: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>', colors: [] },
  chat: { body: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 20 12z"/>', colors: [] },
  user: { body: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', colors: [] },
} satisfies Record<string, IconDef>

export type IconName = keyof typeof icons

/** tabBar 顺序与 pages.json 一致；未选中用 text-2，选中用 action-fg */
export const tabBarIcons: { file: string; icon: IconName }[] = [
  { file: 'home', icon: 'home' },
  { file: 'map', icon: 'map' },
  { file: 'trip', icon: 'route' },
  { file: 'guide', icon: 'chat' },
  { file: 'me', icon: 'user' },
]

export function iconSrc(name: IconName, color: TokenName, theme: 'light' | 'dark'): string {
  return `/static/icons/${theme}/${name}--${color}.svg`
}
