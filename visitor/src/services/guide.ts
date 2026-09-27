import { guideMeta, mockRequest, qaScenarios } from '@qs/shared'
import { getQueueContent } from './queue'

export const getGuideMeta = () => mockRequest(guideMeta)

export const getScenarios = () => mockRequest(qaScenarios, [])

/** 附近讲解条的迷你播放条：讲解内容与该机位排队页一致 */
export const getNearbyNarration = () => getQueueContent(guideMeta.nearby.spotId)

/** 原型阶段不接大模型：自由提问统一返回固定提示 */
export const askFreeText = (_question: string) => mockRequest(guideMeta.placeholderReply)
