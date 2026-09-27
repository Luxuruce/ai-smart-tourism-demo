import { defineStore } from 'pinia'

// switchTab 不能带参数：跳到地图前把要选中的景点 / 设施 id 放在这里，地图页 onShow 时取走
export const useMapFocusStore = defineStore('mapFocus', {
  state: () => ({ pending: null as string | null }),
  actions: {
    request(id: string) {
      this.pending = id
    },
    take(): string | null {
      const id = this.pending
      this.pending = null
      return id
    },
  },
})
