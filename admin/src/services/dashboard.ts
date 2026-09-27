import {
  alerts, badRateTrend, complaintShares, crowdReviews, dataSources, kpis, mockRequest, pushConfirm, topQuestions,
  type DispatchDraft,
} from '@qs/shared'

export const getDataSources = () => mockRequest(dataSources, [])
export const getKpis = () => mockRequest(kpis, [])
export const getBadRateTrend = () => mockRequest(badRateTrend, { ...badRateTrend, points: [] })
export const getTopQuestions = () => mockRequest(topQuestions, [])
export const getAlerts = () => mockRequest(alerts, [])
export const getComplaintShares = () => mockRequest(complaintShares, [])

/** 「依据 8 条差评」弹窗 */
export const getCrowdReviews = () => mockRequest(crowdReviews, { ...crowdReviews, items: [] })

/** 推送确认弹窗文案是字典，同步取 */
export const pushCopy = pushConfirm

/** 推送错峰建议：必须由运营人员二次确认后才调用（AI 只给建议，不自动执行） */
export const pushAdvice = (alertId: string) => mockRequest({ alertId, ok: true })

/** 派单：人工确认后生成工单 */
export const dispatchTicket = (draft: DispatchDraft) => mockRequest(draft)
