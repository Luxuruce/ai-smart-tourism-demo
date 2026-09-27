import { defineStore } from 'pinia'
import { busInfo } from '@qs/shared'
import { usePartyStore } from './party'

export interface Booking {
  slot: string
  seats: number
}

export const useTripStore = defineStore('trip', {
  state: () => ({
    /** 行程页当前 tab；从「约观光车」入口进来时直接打开预约 */
    tab: 'plan' as 'plan' | 'bus',
    /** 当前选中的观光车时段 key，如 16:00 */
    slot: busInfo.defaultSlot,
    /** 座位数；游客没改过时跟随同行人数（13.2 2.6） */
    seatsOverride: null as number | null,
    booking: null as Booking | null,
  }),
  getters: {
    seats(s): number {
      return s.seatsOverride ?? usePartyStore().size
    },
    /** 已预约的时段，给「我的 → 我的行程」用 */
    bookedSlot: (s) => s.booking?.slot ?? null,
    confirmed: (s) => s.booking !== null && s.booking.slot === s.slot,
  },
  actions: {
    openTab(tab: 'plan' | 'bus') {
      this.tab = tab
    },
    pick(key: string) {
      this.slot = key
    },
    setSeats(n: number) {
      this.seatsOverride = Math.min(busInfo.maxSeats, Math.max(1, n))
    },
    /** 预约或改约：原预约自动取消，座位退回 */
    book(slot: string, seats: number) {
      this.slot = slot
      this.booking = { slot, seats }
    },
    cancel() {
      this.booking = null
    },
  },
})
