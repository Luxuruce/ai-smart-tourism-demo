import { busInfo, mockRequest, tripFollowNote, tripPlans, type PersonaId } from '@qs/shared'

export const getTripPlan = (persona: PersonaId) => {
  const plan = tripPlans[persona]
  return mockRequest(plan, { ...plan, steps: [] })
}

export const getBusInfo = () => mockRequest(busInfo, { ...busInfo, slots: [] })

export const getFollowNote = () => mockRequest(tripFollowNote)

/** 预约 / 改约观光车时段（只锁定时段，不涉及支付） */
export const bookBus = (slot: string, seats: number) => mockRequest({ slot, seats })

export const cancelBus = (slot: string) => mockRequest({ slot })

/** 余位标签：为 0「已约满」，低于 20%「余位紧张」，否则「余位充足」（13.2 2.6） */
export function seatLabel(remaining: number, capacity: number): string {
  if (remaining <= 0) return '已约满'
  return remaining < capacity * busInfo.tightRatio ? '余位紧张' : '余位充足'
}
