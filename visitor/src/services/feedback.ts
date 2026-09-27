import {
  FEEDBACK_CATEGORIES, FIRST_TICKET_NO, NEXT_TICKET_NO, PROGRESS_STEPS, PROGRESS_TIMING, RATE_TEXT, REOPENED_NOTE,
  SAFETY_CATEGORY, classifyFeedback, feedbackForm, initialFeedbacks, mockRequest, progressTextOf, submittedNote,
  summarizeFeedback,
  type VisitorFeedback,
} from '@qs/shared'

let submitted = 0

export const getForm = () => mockRequest(feedbackForm)

/** 处理进度：步骤名、计时、按 AI 类型的文案（14.2 11.2.3、清单 12.3） */
export const progressSteps = PROGRESS_STEPS
export const progressTiming = PROGRESS_TIMING
export const progressTextFor = progressTextOf
export const reopenedNote = REOPENED_NOTE

export const getMyFeedbacks = () => mockRequest(initialFeedbacks, [])

export const rateText = RATE_TEXT

/** 字典与本地规则是同步的，不走假网络 */
export const categories = FEEDBACK_CATEGORIES
export const safetyCategory = SAFETY_CATEGORY
/** AI 识别（原型用关键词规则模拟） */
export const classify = classifyFeedback

/** 提交反馈，返回新工单（第一条固定为 #1026，与后台工单对应） */
export function submitFeedback(text: string, category: string): Promise<VisitorFeedback> {
  // 第一条 #1026，第二条起从 #1030 递增（清单 10.3）
  const no = submitted === 0 ? FIRST_TICKET_NO : NEXT_TICKET_NO + submitted - 1
  submitted += 1
  const item: VisitorFeedback = { id: String(no), title: summarizeFeedback(text), text, status: 'pending', note: submittedNote, category }
  return mockRequest(item)
}

export const rateFeedback = (id: string, rating: 'good' | 'bad') => mockRequest({ id, rating })
