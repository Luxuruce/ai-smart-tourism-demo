import { defineStore } from 'pinia'

// 预警的处置结果；切换页面后回到驾驶舱仍保持
export const useAlertStore = defineStore('alerts', {
  state: () => ({
    /** 已推送的预警 id（推送后 60 分钟内不能再推，演示时钟不走，所以一直处于冷却中） */
    pushed: [] as string[],
    /** 已派单的预警 id → 工单号 */
    dispatched: {} as Record<string, string>,
  }),
  getters: {
    handled: (s) => (id: string) => s.pushed.includes(id) || id in s.dispatched,
  },
  actions: {
    markPushed(id: string) {
      if (!this.pushed.includes(id)) this.pushed.push(id)
    },
    markDispatched(id: string, ticketId: string) {
      this.dispatched[id] = ticketId
    },
  },
})
