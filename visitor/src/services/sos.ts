import { SERVICE_TYPES, mockRequest, services, sosInfo } from '@qs/shared'

export function getSosInfo() {
  const nearest = sosInfo.nearest.map((n) => {
    const s = services.find((x) => x.id === n.id)!
    return { ...n, glyph: s.glyph ?? SERVICE_TYPES[s.type].glyph, distance: s.distance }
  })
  return mockRequest({ ...sosInfo, nearest }, { ...sosInfo, nearest: [] })
}

export const sendSos = () => mockRequest({ ok: true })

export const cancelSos = () => mockRequest({ ok: true })

export const startSeeking = () => mockRequest({ ok: true })
