import { defineStore } from 'pinia'
import { themes, toCssVars, type ThemeName } from '@qs/shared'
import { tabBarIcons } from '@/icons'

const STORAGE_KEY = 'qs-theme'
const TAB_PAGES = ['pages/home/index', 'pages/map/index', 'pages/trip/index', 'pages/guide/index', 'pages/me/index']

function readStored(): ThemeName {
  try {
    const v = uni.getStorageSync(STORAGE_KEY)
    return v === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({ name: readStored() as ThemeName }),
  getters: {
    isDark: (s) => s.name === 'dark',
    tokens: (s) => themes[s.name],
    /** 给 <page-meta :page-style> 用：把全部 token 挂到 page 上，并设置页面底色 */
    pageStyle(s): string {
      const t = themes[s.name]
      return `${toCssVars(t)}background-color:${t.bg};color:${t.text};`
    },
  },
  actions: {
    set(name: ThemeName) {
      this.name = name
      try {
        uni.setStorageSync(STORAGE_KEY, name)
      } catch {
        // 存储不可用时只影响下次启动，不阻塞切换
      }
      this.applyTabBar()
    },
    toggle() {
      this.set(this.name === 'dark' ? 'light' : 'dark')
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
