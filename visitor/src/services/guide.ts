import { guideMeta, mockRequest, qaScenarios } from '@qs/shared'

export const getGuideMeta = () => mockRequest(guideMeta)

export const getScenarios = () => mockRequest(qaScenarios, [])

/** 原型阶段不接大模型：自由提问统一返回固定提示 */
export const askFreeText = (_question: string) => mockRequest(guideMeta.placeholderReply)
