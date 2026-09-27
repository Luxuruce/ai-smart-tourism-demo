import type { PageName, Route } from '@qs/shared'
import { useGuideFocusStore } from '@/stores/guideFocus'
import { useMapFocusStore } from '@/stores/mapFocus'
import { usePersonaStore } from '@/stores/persona'
import { useTripStore } from '@/stores/trip'

const TAB_PAGES: PageName[] = ['home', 'map', 'trip', 'guide', 'me']
/** 小程序页面栈上限是 10 层，接近上限时改用 redirectTo */
const STACK_LIMIT = 9

export const isTabPage = (page: PageName) => TAB_PAGES.includes(page)

export function go(route: Route) {
  const path = `/pages/${route.page}/index`
  // tab 页不能带参数，先把要传的状态写进 store
  if (route.focus) useMapFocusStore().request(route.focus)
  if (route.q) useGuideFocusStore().request(route.q)
  if (route.persona) usePersonaStore().pick(route.persona)
  if (route.tripTab) useTripStore().openTab(route.tripTab)
  if (isTabPage(route.page)) {
    uni.switchTab({ url: path })
    return
  }
  const params = { ...(route.id ? { id: route.id } : {}), ...route.query }
  const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  const url = qs ? `${path}?${qs}` : path
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
