import {
  CHECKIN_MAX_WAIT, genericFill, mockRequest, queueCommon, spotFills, spots, type QueueContent,
} from '@qs/shared'

/**
 * 某个机位的等待填充内容。
 * - 有专属内容的 6 个机位用各自的数据；其他机位（荷塘廊桥、替代机位）用「通用古镇讲解」
 * - 等待不超过 2 分钟的机位为打卡模式
 */
export function getQueueContent(spotId: string): Promise<QueueContent> {
  const alts = spots.flatMap((s) => s.alts ?? [])
  const spot = spots.find((s) => s.id === spotId) ?? alts.find((a) => a.id === spotId)
  if (!spot) return Promise.reject(new Error('没有找到这个机位'))

  const mode = spot.waitMin <= CHECKIN_MAX_WAIT ? 'checkin' : 'queue'
  const fill = spotFills[spot.id] ?? {
    ...genericFill,
    // 通用内容没有排队数据：只显示预计等待
    elapsed: '00:00',
    ahead: '刚开始排队',
    remain: `预计还需 ${spot.waitMin} 分钟`,
    progress: 0,
  }
  const content: QueueContent = {
    ...queueCommon,
    ...fill,
    spotId: spot.id,
    spotName: spot.name,
    mode,
    doneTitle: mode === 'checkin' ? '打卡完成' : '拍到了！',
    // 打卡模式不写「已匿名更新机位热度」（13.3 3.2）
    doneTime: mode === 'checkin' ? '' : queueCommon.doneTime,
  }
  return mockRequest(content, { ...content, versions: [], quizzes: [], merchants: [] })
}
