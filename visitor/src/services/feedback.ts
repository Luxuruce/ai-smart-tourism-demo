import {
  FEEDBACK_CATEGORIES, FIRST_TICKET_NO, RATE_TEXT, SAFETY_CATEGORY, classifyFeedback, feedbackForm, feedbackProgress,
  initialFeedbacks, mockRequest, submittedNote, summarizeFeedback,
  type VisitorFeedback,
} from '@qs/shared'

let nextNo = FIRST_TICKET_NO

export const getForm = () => mockRequest(feedbackForm)

export const getProgress = () => mockRequest(feedbackProgress, [])

export const getMyFeedbacks = () => mockRequest(initialFeedbacks, [])

export const rateText = RATE_TEXT

/** 字典与本地规则是同步的，不走假网络 */
export const categories = FEEDBACK_CATEGORIES
export const safetyCategory = SAFETY_CATEGORY
/** AI 识别（原型用关键词规则模拟） */
export const classify = classifyFeedback

/** 提交反馈，返回新工单（第一条固定为 #1026，与后台工单对应） */
export function submitFeedback(text: string): Promise<VisitorFeedback> {
  const item: VisitorFeedback = { id: String(nextNo++), title: summarizeFeedback(text), text, status: 'pending', note: submittedNote }
  return mockRequest(item)
}

export const rateFeedback = (id: string, rating: 'good' | 'bad') => mockRequest({ id, rating })
