import {
  FIRST_TICKET_NO, RATE_TEXT, feedbackDraft, feedbackProgress, initialFeedbacks, mockRequest, submittedNote,
  type VisitorFeedback,
} from '@qs/shared'

let nextNo = FIRST_TICKET_NO

export const getDraft = () => mockRequest(feedbackDraft)

export const getProgress = () => mockRequest(feedbackProgress, [])

export const getMyFeedbacks = () => mockRequest(initialFeedbacks, [])

export const rateText = RATE_TEXT

/** 提交反馈，返回新工单（第一条固定为 #1026，与后台工单对应） */
export function submitFeedback(text: string): Promise<VisitorFeedback> {
  const item: VisitorFeedback = { id: String(nextNo++), text, status: 'pending', note: submittedNote }
  return mockRequest(item)
}

export const rateFeedback = (id: string, rating: 'good' | 'bad') => mockRequest({ id, rating })
