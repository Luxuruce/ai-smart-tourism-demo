import { defineStore } from 'pinia'

// 定位授权、同行人位置共享
export const usePrefsStore = defineStore('prefs', {
  state: () => ({
    location: true,
    // 13.2 2.7：默认关闭；绑定同行人后才开启
    share: false,
    companion: null as string | null,
  }),
})
