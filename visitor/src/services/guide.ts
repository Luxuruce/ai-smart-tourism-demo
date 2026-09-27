import { guideMeta, mockRequest, qaScenarios, scenarioOfSpot, spotScenarios } from '@qs/shared'
import { getQueueContent } from './queue'

export const getGuideMeta = () => mockRequest(guideMeta)

/** 全部对话场景：快捷问题场景 + 机位追问场景（后者只能通过 q 参数打开） */
export const getScenarios = () => mockRequest([...qaScenarios, ...spotScenarios], [])

/** 底部快捷问题只显示这些场景 */
export const chipScenarioIds = qaScenarios.map((s) => s.id)

/** 机位 → 追问场景（附录 C.1），同步查询 */
export { scenarioOfSpot }

/** 附近讲解条的迷你播放条：讲解内容与该机位排队页一致 */
export const getNearbyNarration = () => getQueueContent(guideMeta.nearby.spotId)

/** 原型阶段不接大模型：自由提问统一返回固定提示 */
export const askFreeText = (_question: string) => mockRequest(guideMeta.placeholderReply)
