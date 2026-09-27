import type { PageName, Route } from '@qs/shared'
import { useMapFocusStore } from '@/stores/mapFocus'

const TAB_PAGES: PageName[] = ['home', 'map', 'trip', 'guide', 'me']
/** 小程序页面栈上限是 10 层，接近上限时改用 redirectTo */
const STACK_LIMIT = 9

export const isTabPage = (page: PageName) => TAB_PAGES.includes(page)

export function go(route: Route) {
  const path = `/pages/${route.page}/index`
  if (route.focus) useMapFocusStore().request(route.focus)
  if (isTabPage(route.page)) {
    uni.switchTab({ url: path })
    return
  }
  const url = route.id ? `${path}?id=${encodeURIComponent(route.id)}` : path
  if (getCurrentPages().length >= STACK_LIMIT) uni.redirectTo({ url })
  else uni.navigateTo({ url })
}

/** 返回上一页；直接打开（没有上一页）时去 fallback */
export function back(fallback: Route) {
  if (getCurrentPages().length > 1) uni.navigateBack()
  else go(fallback)
}

/** 拨打电话：H5 用 tel: 链接，小程序用 makePhoneCall */
export function call(phone: string) {
  // #ifdef H5
  const a = document.createElement('a')
  a.href = `tel:${phone}`
  a.click()
  // #endif
  // #ifndef H5
  uni.makePhoneCall({ phoneNumber: phone, fail: () => {} })
  // #endif
}
