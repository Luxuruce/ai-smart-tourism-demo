import {
  alerts, badRateTrend, complaintShares, dataSources, kpis, mockRequest, topQuestions,
} from '@qs/shared'

export const getDataSources = () => mockRequest(dataSources, [])
export const getKpis = () => mockRequest(kpis, [])
export const getBadRateTrend = () => mockRequest(badRateTrend, { ...badRateTrend, points: [] })
export const getTopQuestions = () => mockRequest(topQuestions, [])
export const getAlerts = () => mockRequest(alerts, [])
export const getComplaintShares = () => mockRequest(complaintShares, [])

/** 推送错峰建议：必须由运营人员二次确认后才调用（AI 只给建议，不自动执行） */
export const pushAdvice = (alertId: string) => mockRequest({ alertId, ok: true })
