// 颜色 token：亮色 = 方案 A「青绿山水」，暗色 = 方案 D「夜游墨色」。
// 前半部分来自交接文档 4.3 节；「补充」部分是原型里出现、但文档表格未列出的颜色，
// 按 Xxx.dc.html → DkXxx.dc.html 的逐色替换关系整理。
// 页面里不允许直接写十六进制颜色，一律用 var(--token)。

export type ThemeName = 'light' | 'dark'

export const lightTokens = {
  'bg': '#F3F5F0',
  'surface': '#FFFFFC',
  'surface-muted': '#E7EEE8',
  'border': '#DDE5DF',
  'border-strong': '#BFCCC4',
  'text': '#1B2A33',
  'text-2': '#56636A',
  'text-disabled': '#68747A',
  'icon-disabled': '#8A969B',
  'primary': '#1F5E7A',
  'primary-fg': '#1F5E7A',
  'primary-deep': '#184B62',
  'primary-soft': '#E8F0F4',
  'on-primary-sub': '#D3E6EE',
  'action': '#26704F',
  'action-fg': '#26704F',
  'on-color': '#FFFFFF',
  'ink-chip': '#1B2A33',
  'ok-soft': '#DDEFE6',
  'ok-fg': '#1C5A43',
  'warn-soft': '#F6EACB',
  'warn-fg': '#775109',
  'danger-soft': '#FBEAE6',
  'danger-border': '#F1CFC6',
  'danger-fg': '#9B2F1F',
  'danger': '#9B2F1F',
  'heat-high-soft': '#F8DDD6',
  // —— 补充 ——
  /** 开关「开启」底色：亮色用主色，暗色用提亮后的主色（文档 4.3 注） */
  'switch-on': '#1F5E7A',
  /** 样片占位、地图道路 */
  'placeholder': '#D3DCCF',
  /** 缩略图占位 */
  'thumb': '#DCE6DF',
  /** 地图水系 */
  'river': '#A9CCD8',
  /** 页头上禁用态文字（搜索框占位） */
  'on-primary-disabled': '#BFD6E0',
  /** 页头上的虚线描边 */
  'on-primary-dashed': '#6F9DB2',
  /** 浮在图片上的虚线按钮描边 */
  'border-dashed-strong': '#9FB0A6',
  'heat-high-dot': '#9B2F1F',
  'heat-mid-dot': '#B8860B',
  'heat-low-dot': '#2F7D5B',
  /** 警示卡片里的次要文字 */
  'danger-fg-sub': '#7A3326',
  'link-hover': '#174A60',
  'shadow-sm': '0 2px 10px rgba(27,42,51,0.06)',
  'shadow-md': '0 4px 12px rgba(27,42,51,0.18)',
  'shadow-lg': '0 6px 20px rgba(27,42,51,0.16)',
  /** 弹窗、底部面板的遮罩 */
  'scrim': 'rgba(27,42,51,0.4)',
} as const

export type TokenName = keyof typeof lightTokens

export const darkTokens: Record<TokenName, string> = {
  'bg': '#121619',
  'surface': '#1C2227',
  'surface-muted': '#252C31',
  'border': '#2C343A',
  'border-strong': '#3E474E',
  'text': '#ECE7DD',
  'text-2': '#A3ABB0',
  'text-disabled': '#8C959A',
  'icon-disabled': '#6F787D',
  'primary': '#24484C',
  'primary-fg': '#7FC1BC',
  'primary-deep': '#1A3639',
  'primary-soft': '#1E3336',
  'on-primary-sub': '#BFD3D1',
  'action': '#B54A31',
  'action-fg': '#E9906F',
  'on-color': '#F4EFE6',
  'ink-chip': '#3B5E63',
  'ok-soft': '#1D3D33',
  'ok-fg': '#8FD4B5',
  'warn-soft': '#45381C',
  'warn-fg': '#EFC977',
  'danger-soft': '#3A201B',
  'danger-border': '#5A2E26',
  'danger-fg': '#F2A594',
  'danger': '#B54A31',
  'heat-high-soft': '#4A2620',
  'switch-on': '#7FC1BC',
  'placeholder': '#36403F',
  'thumb': '#2A3237',
  'river': '#22474A',
  'on-primary-disabled': '#9FB7B4',
  'on-primary-dashed': '#4F7773',
  'border-dashed-strong': '#5A646B',
  'heat-high-dot': '#F2A594',
  'heat-mid-dot': '#D6A437',
  'heat-low-dot': '#4FB58C',
  'danger-fg-sub': '#F2A594',
  'link-hover': '#A6D6D2',
  'shadow-sm': '0 2px 10px rgba(0,0,0,0.06)',
  'shadow-md': '0 4px 12px rgba(0,0,0,0.18)',
  'shadow-lg': '0 6px 20px rgba(0,0,0,0.16)',
  'scrim': 'rgba(0,0,0,0.55)',
}

export const themes: Record<ThemeName, Record<TokenName, string>> = {
  light: lightTokens,
  dark: darkTokens,
}

/** 后台（只有亮色）额外用到的侧栏颜色 */
export const adminTokens = {
  'sidebar-bg': '#1B2A33',
  'sidebar-text': '#DDE6EA',
  'sidebar-muted': '#B9C6CC',
  /** 合规「部分达标」图标 */
  'warn-icon': '#8C6410',
} as const

/** 把一组 token 拼成 CSS 变量声明：`--bg:#F3F5F0;--surface:…;` */
export function toCssVars(tokens: Record<string, string>): string {
  return Object.entries(tokens).map(([k, v]) => `--${k}:${v};`).join('')
}
