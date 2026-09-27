import { defineStore } from 'pinia'

// 定位授权、同行人位置共享
export const usePrefsStore = defineStore('prefs', {
  state: () => ({
    location: true,
    share: true,
  }),
})
