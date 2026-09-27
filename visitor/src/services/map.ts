import {
  CHECKIN_MAX_WAIT, HEAT_LABEL, SERVICE_TYPE_ORDER, SERVICE_TYPES, mapMeta, mockRequest, services, spots, waitText,
  type Heat, type ServicePoint,
} from '@qs/shared'

export const getSpots = () => mockRequest(spots, [])

export const getServicePoints = () => mockRequest(services, [])

export const getMapMeta = () => mockRequest(mapMeta)

/** 字典类数据是同步常量，不走假网络 */
export const serviceTypes = SERVICE_TYPES
export const serviceTypeOrder = SERVICE_TYPE_ORDER

export const heatLabel = (h: Heat) => HEAT_LABEL[h]

/** 等待时长：「X 分钟」，0 为「不用等」 */
export { waitText }

/** 等待不超过 2 分钟的机位，所有入口都叫「开始打卡」，进入打卡模式（13.6） */
export const isCheckin = (waitMin: number) => waitMin <= CHECKIN_MAX_WAIT

/** 设施距离：关闭定位后改为「距南门约 X 米」（13.4 4.3） */
export const distanceLabel = (s: ServicePoint, located: boolean) => (located ? `步行约 ${s.distance}` : `距南门约 ${s.distance}`)

export const glyphOf = (s: ServicePoint) => s.glyph ?? SERVICE_TYPES[s.type].glyph

/** 「120 米」→ 120，用于按距离排序 */
export const distanceValue = (s: ServicePoint) => parseInt(s.distance, 10)

/** 地图聚焦用（同步）：判断 id 是景点还是设施，设施返回其类型 */
export function focusTarget(id: string): { layer: 'scenic' } | { layer: 'service'; type: ServicePoint['type'] } | null {
  if (spots.some((s) => s.id === id)) return { layer: 'scenic' }
  const svc = services.find((s) => s.id === id)
  return svc ? { layer: 'service', type: svc.type } : null
}

/** 机位名称（含不在地图上的替代机位），同步查询 */
export function spotName(id: string): string | null {
  const all = [...spots, ...spots.flatMap((s) => s.alts ?? [])]
  return all.find((s) => s.id === id)?.name ?? null
}
