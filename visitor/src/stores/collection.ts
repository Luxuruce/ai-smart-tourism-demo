import { defineStore } from 'pinia'
import { INITIAL_STAMPS, STAMP_ORDER, STAMP_SLOTS } from '@qs/shared'

// 今日收集（印章）与领到的优惠券；数据只保存在本次游览
export const useCollectionStore = defineStore('collection', {
  state: () => ({
    stamps: [...INITIAL_STAMPS] as string[],
    slots: STAMP_SLOTS,
    coupons: [] as string[],
  }),
  getters: {
    count: (s) => s.stamps.length,
    /** 按固定顺序展示（阁、桥……） */
    ordered: (s) => [...s.stamps].sort((a, b) => STAMP_ORDER.indexOf(a) - STAMP_ORDER.indexOf(b)),
  },
  actions: {
    /** 收入印章；返回是否为首次获得 */
    collect(stamp: string): boolean {
      if (this.stamps.includes(stamp)) return false
      this.stamps.push(stamp)
      return true
    },
    claimCoupon(key: string) {
      if (!this.coupons.includes(key)) this.coupons.push(key)
    },
  },
})
