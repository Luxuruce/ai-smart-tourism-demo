import { defineStore } from 'pinia'

/** 同行人数（13.3 3.4）：默认 1，在行程页页头选择 1–6 */
export const usePartyStore = defineStore('party', {
  state: () => ({ size: 1 }),
  getters: {
    /** 1 人显示「独自游览」，其余「{n} 人同行」 */
    label: (s) => (s.size === 1 ? '独自游览' : `${s.size} 人同行`),
  },
  actions: {
    set(n: number) {
      this.size = Math.min(6, Math.max(1, n))
    },
  },
})
