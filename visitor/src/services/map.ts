import {
  HEAT_LABEL, SERVICE_TYPE_ORDER, SERVICE_TYPES, mapMeta, mockRequest, services, spots,
  type Heat, type ServicePoint,
} from '@qs/shared'

export const getSpots = () => mockRequest(spots, [])

export const getServicePoints = () => mockRequest(services, [])

export const getMapMeta = () => mockRequest(mapMeta)

/** 字典类数据是同步常量，不走假网络 */
export const serviceTypes = SERVICE_TYPES
export const serviceTypeOrder = SERVICE_TYPE_ORDER

export const heatLabel = (h: Heat) => HEAT_LABEL[h]

export const waitShort = (min: number) => (min === 0 ? '不用等' : `${min} 分`)

export const glyphOf = (s: ServicePoint) => s.glyph ?? SERVICE_TYPES[s.type].glyph

/** 「120 米」→ 120，用于按距离排序 */
export const distanceValue = (s: ServicePoint) => parseInt(s.distance, 10)

/** 地图聚焦用（同步）：判断 id 是景点还是设施，设施返回其类型 */
export function focusTarget(id: string): { layer: 'scenic' } | { layer: 'service'; type: ServicePoint['type'] } | null {
  if (spots.some((s) => s.id === id)) return { layer: 'scenic' }
  const svc = services.find((s) => s.id === id)
  return svc ? { layer: 'service', type: svc.type } : null
}
