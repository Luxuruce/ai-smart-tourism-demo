import { defineStore } from 'pinia'

// 已推送的预警 id；切换页面后回到驾驶舱仍保持「已推送」
export const useAlertStore = defineStore('alerts', {
  state: () => ({ pushed: [] as string[] }),
  actions: {
    markPushed(id: string) {
      if (!this.pushed.includes(id)) this.pushed.push(id)
    },
  },
})
