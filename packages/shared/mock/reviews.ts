// 来源：开发交接文档 v1.2 附录 C.3（r01–r08 即附录 B.8 的 8 条差评）
import type { ReviewItem } from '../types'
import { crowdReviews } from './dashboard'

/** 一级标签（清单 12.2.3：4.1 节原来的 8 个），URL 参数用英文 slug */
export const REVIEW_TAGS: { slug: string; label: string }[] = [
  { slug: 'content', label: '讲解与内容' },
  { slug: 'queue', label: '排队与拥挤' },
  { slug: 'route', label: '动线与指引' },
  { slug: 'hygiene', label: '卫生与设施' },
  { slug: 'service', label: '服务态度' },
  { slug: 'price', label: '价格与性价比' },
  { slug: 'commerce', label: '商业化' },
  { slug: 'other', label: '其他' },
]

/** 点位显示名：有机位 id 的用机位名，其余区域直接用名称（清单 12.2.4） */
export const REVIEW_SPOT_NAMES: Record<string, string> = {
  wc: '文昌阁飞檐',
  gq: '石拱桥',
  zy: '状元祠',
}

export const reviewsMeta = {
  title: '评论明细',
  subtitle: '近 30 天 · 携程商家授权、美团导出上传 · 示例数据',
  replyNote: '回复需在对应 OTA 商家后台发布，这里只记录回复内容',
}

export const reviewItems: ReviewItem[] = [
  ...crowdReviews.items.map((r, i) => ({
    ...r,
    id: `r${String(i + 1).padStart(2, '0')}`,
    spot: 'wc',
    tags: ['排队与拥挤'],
    replied: false,
  })),
  { id: 'r09', channel: '美团', score: 2, date: '09-19', spot: '古戏台', tags: ['卫生与设施'], replied: false, text: '戏台旁边的厕所没纸，地上还湿，老人差点滑倒。' },
  { id: 'r10', channel: '携程', score: 3, date: '09-16', spot: '古戏台', tags: ['卫生与设施'], replied: false, text: '厕所太少，演出散场后要排很久。' },
  { id: 'r11', channel: '美团', score: 3, date: '09-10', spot: '古戏台', tags: ['卫生与设施', '排队与拥挤'], replied: false, text: '演出结束后厕所门口全是人。' },
  { id: 'r12', channel: '携程', score: 3, date: '09-17', spot: 'wc', tags: ['讲解与内容'], replied: false, text: '讲解说文昌阁是明代的，门口牌子却写清代，到底哪个对？' },
  { id: 'r13', channel: '美团', score: 2, date: '09-11', spot: '老街', tags: ['动线与指引'], replied: true, text: '老街牌坊的指示牌指错方向，绕了一大圈。' },
  { id: 'r14', channel: '携程', score: 2, date: '09-20', spot: '阁前茶铺', tags: ['价格与性价比'], replied: false, text: '茶铺没标价，结账时才知道一杯要 38。' },
  { id: 'r15', channel: '携程', score: 5, date: '09-22', spot: 'gq', tags: [], replied: true, text: '傍晚的石拱桥太美了，人也不多，推荐！' },
  { id: 'r16', channel: '美团', score: 5, date: '09-18', spot: 'zy', tags: ['讲解与内容'], replied: false, text: '孩子很喜欢状元祠的小任务，讲解也听得懂。' },
]
