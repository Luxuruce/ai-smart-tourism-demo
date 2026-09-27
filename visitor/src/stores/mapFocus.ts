import { defineStore } from 'pinia'

// switchTab 不能带参数：跳到地图前把要做的事放在这里，地图页 onShow 时取走
// - pending：要选中的景点或设施 id
// - nav：要开始的步行导航（from 为原机位，用于导航到替代机位）
export const useMapFocusStore = defineStore('mapFocus', {
  state: () => ({
    pending: null as string | null,
    nav: null as { target: string; from?: string } | null,
  }),
  actions: {
    request(id: string) {
      this.pending = id
    },
    take(): string | null {
      const id = this.pending
      this.pending = null
      return id
    },
    requestNav(target: string, from?: string) {
      this.nav = { target, from }
    },
    takeNav() {
      const n = this.nav
      this.nav = null
      return n
    },
  },
})
