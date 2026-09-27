import { mockRequest, spots, type Spot } from '@qs/shared'

/** 替代机位最多 3 个，且只推荐热度低或中的（PRD 规则：人数上升的机位暂停推荐） */
const MAX_ALTS = 3

export function getSpot(id: string): Promise<Spot> {
  const spot = spots.find((s) => s.id === id)
  if (!spot) return Promise.reject(new Error('没有找到这个机位'))
  const alts = (spot.alts ?? []).filter((a) => a.heat !== 'high').slice(0, MAX_ALTS)
  return mockRequest({ ...spot, alts }, { ...spot, alts: [] })
}
