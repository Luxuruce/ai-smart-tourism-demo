import { busInfo, mockRequest, tripFollowNote, tripPlan } from '@qs/shared'

export const getTripPlan = () => mockRequest(tripPlan, { ...tripPlan, steps: [] })

export const getBusInfo = () => mockRequest(busInfo, { ...busInfo, slots: [] })

export const getFollowNote = () => mockRequest(tripFollowNote)

/** 预约观光车时段（只锁定时段，不涉及支付） */
export const bookBus = (slot: string) => mockRequest({ slot })
