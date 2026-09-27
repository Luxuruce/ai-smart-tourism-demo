import {
  PUBLISHED_BASE, knowledgeEntries, knowledgeMeta, mockRequest, needsKeyReview, pendingQuestions,
} from '@qs/shared'

export const getPendingQuestions = () => mockRequest(pendingQuestions, [])
export const getKnowledgeEntries = () => mockRequest(knowledgeEntries, [])

export const publishedBase = PUBLISHED_BASE
export const meta = knowledgeMeta
export const isKeyReview = needsKeyReview

/** 补录、审核：原型阶段只模拟网络延迟 */
export const submitAnswer = (pendingId: string) => mockRequest({ pendingId })
export const reviewEntry = (id: string, action: 'approve' | 'reject') => mockRequest({ id, action })
