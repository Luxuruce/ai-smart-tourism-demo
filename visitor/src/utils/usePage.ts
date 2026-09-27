import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useThemeStore } from '@/stores/theme'

/**
 * 每个页面都要调用：返回给 <page-meta> 用的主题样式，并在页面显示时同步原生外观
 * （tabBar 颜色 / 图标、状态栏文字颜色）。
 * lightHeader：页面顶部是主色页头时传 true（可以是函数，按页面状态变化）。
 */
export function usePage(lightHeader: boolean | (() => boolean) = false) {
  const theme = useThemeStore()
  const pageStyle = computed(() => theme.pageStyle)
  const isLight = () => (typeof lightHeader === 'function' ? lightHeader() : lightHeader)

  function sync() {
    const pages = getCurrentPages()
    const route = pages[pages.length - 1]?.route ?? ''
    theme.applyChrome(route, isLight())
  }

  onShow(sync)
  return { theme, pageStyle, sync }
}
