import { mockRequest, queueContent, spots, type QueueContent } from '@qs/shared'

/** 原型只有文昌阁的等待填充内容，其他机位复用同一套讲解和任务，只换机位名 */
export function getQueueContent(spotId: string): Promise<QueueContent> {
  // 替代机位（如「文昌阁背面月洞门」）不在地图景点里，也要能查到名字
  const alts = spots.flatMap((s) => s.alts ?? [])
  const spot = spots.find((s) => s.id === spotId) ?? alts.find((a) => a.id === spotId)
  const content = spot ? { ...queueContent, spotId: spot.id, spotName: spot.name } : queueContent
  return mockRequest(content, { ...content, versions: [], merchants: [] })
}
