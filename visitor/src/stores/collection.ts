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
    collect(stamp: string) {
      if (!this.stamps.includes(stamp)) this.stamps.push(stamp)
    },
    claimCoupon(key: string) {
      if (!this.coupons.includes(key)) this.coupons.push(key)
    },
  },
})
