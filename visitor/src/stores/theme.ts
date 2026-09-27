import { defineStore } from 'pinia'
import { themes, toCssVars, type ThemeName } from '@qs/shared'
import { tabBarIcons } from '@/icons'

const STORAGE_KEY = 'qs-theme'
const TAB_PAGES = ['pages/home/index', 'pages/map/index', 'pages/trip/index', 'pages/guide/index', 'pages/me/index']

/** 亮色 / 暗色 / 跟随系统（14.2 11.1.15） */
export type ThemeMode = ThemeName | 'system'

function readStored(): ThemeMode {
  try {
    const v = uni.getStorageSync(STORAGE_KEY)
    return v === 'dark' || v === 'system' ? v : 'light'
  } catch {
    return 'light'
  }
}

/** 读取系统当前的深浅色 */
function systemIsDark(): boolean {
  // #ifdef H5
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  // #endif
  // #ifndef H5
  try {
    return uni.getSystemInfoSync().theme === 'dark'
  } catch {
    return false
  }
  // #endif
}

export const useThemeStore = defineStore('theme', {
  state: () => ({ mode: readStored() as ThemeMode, systemDark: systemIsDark(), listening: false }),
  getters: {
    /** 实际生效的主题 */
    name: (s): ThemeName => (s.mode === 'system' ? (s.systemDark ? 'dark' : 'light') : s.mode),
    isDark(): boolean {
      return this.name === 'dark'
    },
    tokens(): Record<string, string> {
      return themes[this.name]
    },
    /** 给 <page-meta :page-style> 用：把全部 token 挂到 page 上，并设置页面底色 */
    pageStyle(): string {
      const t = themes[this.name]
      return `${toCssVars(t)}background-color:${t.bg};color:${t.text};`
    },
  },
  actions: {
    /** 手动选亮色 / 暗色 / 跟随系统；手动选亮暗会退出跟随系统 */
    set(mode: ThemeMode) {
      this.mode = mode
      if (mode === 'system') this.systemDark = systemIsDark()
      try {
        uni.setStorageSync(STORAGE_KEY, mode)
      } catch {
        // 存储不可用时只影响下次启动，不阻塞切换
      }
      this.applyTabBar()
    },
    /** 首页太阳 / 月亮按钮：切到与当前相反的主题，并退出跟随系统 */
    toggle() {
      this.set(this.name === 'dark' ? 'light' : 'dark')
    },
    /** 监听系统深浅色变化，只注册一次；跟随系统时实时切换 */
    listenSystem() {
      if (this.listening) return
      this.listening = true
      const update = (dark: boolean) => {
        this.systemDark = dark
        if (this.mode === 'system') this.applyTabBar()
      }
      // #ifdef H5
      if (typeof matchMedia === 'function') {
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => update(e.matches))
      }
      // #endif
      // #ifndef H5
      uni.onThemeChange?.((r) => update(r.theme === 'dark'))
      // #endif
    },
    /** 原生 tabBar 不吃 CSS 变量，需要用 API 改颜色和图标。只在 tab 页调用才生效。 */
    applyTabBar() {
      const t = themes[this.name]
      const noop = () => {}
      let border: string = t.border
      // #ifdef MP
      border = this.name === 'dark' ? 'black' : 'white'
      // #endif
      uni.setTabBarStyle({
        color: t['text-2'],
        selectedColor: t['action-fg'],
        backgroundColor: t.surface,
        borderStyle: border as 'black' | 'white',
        fail: noop,
      })
      tabBarIcons.forEach((tab, index) => {
        uni.setTabBarItem({
          index,
          iconPath: `/static/tabbar/${this.name}/${tab.file}.png`,
          selectedIconPath: `/static/tabbar/${this.name}/${tab.file}-active.png`,
          fail: noop,
        })
      })
    },
    /**
     * 页面 onShow 时调用：同步 tabBar（仅 tab 页）和状态栏文字颜色。
     * lightHeader：页面顶部是主色页头（首页、行程、排队中），状态栏用白字。
     */
    applyChrome(route: string, lightHeader = false) {
      if (TAB_PAGES.includes(route)) this.applyTabBar()
      const t = themes[this.name]
      const white = lightHeader || this.name === 'dark'
      uni.setNavigationBarColor({
        frontColor: white ? '#ffffff' : '#000000',
        backgroundColor: lightHeader ? t.primary : t.bg,
        fail: () => {},
      })
    },
  },
})
