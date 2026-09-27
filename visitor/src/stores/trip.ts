import { defineStore } from 'pinia'
import { busInfo } from '@qs/shared'

export const useTripStore = defineStore('trip', {
  state: () => ({
    /** 行程页当前 tab；从「约观光车」入口进来时直接打开预约 */
    tab: 'plan' as 'plan' | 'bus',
    /** 当前选中的观光车时段 key，如 16:00 */
    slot: busInfo.defaultSlot,
    /** 已确认预约的时段；改选时段后清空 */
    bookedSlot: null as string | null,
  }),
  getters: {
    confirmed: (s) => s.bookedSlot !== null && s.bookedSlot === s.slot,
  },
  actions: {
    openTab(tab: 'plan' | 'bus') {
      this.tab = tab
    },
    pick(key: string) {
      this.slot = key
      this.bookedSlot = null
    },
    confirm() {
      this.bookedSlot = this.slot
    },
  },
})
