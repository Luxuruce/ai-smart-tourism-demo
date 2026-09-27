import { homeInfo, mockRequest, personas, recommendations, type PersonaId } from '@qs/shared'

export const getHomeInfo = () => mockRequest(homeInfo)

export const getPersonas = () => mockRequest(personas, [])

export const getRecommendations = (personaId: PersonaId) =>
  mockRequest(recommendations.filter((r) => r.personaId === personaId), [])
