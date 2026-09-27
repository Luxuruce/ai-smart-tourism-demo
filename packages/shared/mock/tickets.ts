// 来源：Tickets.dc.html + 开发交接文档 v1.1（13.4 5.2、13.6）
import type { Ticket, TicketStatus } from '../types'

/**
 * 页头统计 = 固定底数 + 列表中的状态变化（清单 9.1.2 选 B）。
 * 底数即原型页头的数字，已包含列表里这 5 张工单；「已超时」计入待受理（13.6）。
 */
export const ticketBaseCounts = { pending: 2, processing: 3, resolved: 17 }

/** 列表标题：列表只是今天最近的工单，不是全部 */
export const ticketListTitle = '今天最近的工单'

/** 时间线的 5 个阶段（13.4 5.2） */
export const TICKET_STAGES = ['提交', '受理', '处理中', '已解决', '已关闭'] as const

/** 状态 → 页头统计里的分组 */
export function ticketGroup(status: TicketStatus): 'pending' | 'processing' | 'resolved' {
  if (status === 'pending' || status === 'overdue') return 'pending'
  if (status === 'processing') return 'processing'
  return 'resolved'
}

export const ticketOwners = ['值班主管', '[保洁 A]', '[安保 B]', '[运营 C]', '[市场巡查 D]']

// 提交时间按演示时钟 14:18 减去「用时」推算；已处理完的工单不推算，只记录节点
export const tickets: Ticket[] = [
  {
    id: '#1027', text: '石拱桥上人太多，有老人被挤到栏杆边', aiType: '安全 · 拥挤', area: '石拱桥', owner: '值班主管',
    status: 'processing', statusText: '处理中 · 已电话通知', elapsed: '4 分钟', isSafety: true,
    history: [
      { label: '提交', time: '14:14' },
      { label: '受理', note: '安全类跳过普通队列' },
      { label: '处理中', note: '已电话通知值班主管' },
    ],
  },
  {
    id: '#1026', text: '戏台旁边的厕所没有纸了，地上也很湿', aiType: '卫生与设施', area: '古戏台', owner: '[保洁 A]',
    status: 'pending', statusText: '待受理', elapsed: '12 分钟',
    history: [{ label: '提交', time: '14:06' }],
  },
  {
    id: '#1024', text: '文昌阁排队没人管，有人插队', aiType: '排队与拥挤', area: '文昌阁', owner: '[安保 B]',
    status: 'overdue', statusText: '已超时 · 已升级', elapsed: '34 分钟',
    history: [
      { label: '提交', time: '13:44' },
      { label: '超时升级', time: '14:14', note: '30 分钟未受理，自动升级给值班主管' },
    ],
  },
  {
    id: '#1021', text: '老街牌坊的指示牌方向指错了', aiType: '动线与指引', area: '老街', owner: '[运营 C]',
    status: 'resolved', statusText: '已解决 · 游客满意', elapsed: '27 分钟',
    history: [
      { label: '提交' },
      { label: '受理' },
      { label: '处理中' },
      { label: '已解决', note: '已临时张贴正确指引；游客评价：满意' },
    ],
  },
  {
    id: '#1019', text: '讲解里说阁楼是明代的，门口牌子写清代？', aiType: '讲解与内容', area: '文昌阁', owner: '[运营 C]',
    status: 'processing', statusText: '处理中 · 已转知识库复核', elapsed: '1 小时',
    history: [
      { label: '提交', time: '13:18' },
      { label: '受理' },
      { label: '处理中', note: '已转知识库复核' },
    ],
  },
]

export const ticketRules = [
  { title: '分派规则', text: '类型 × 区域 → 责任人；30 分钟未受理，自动升级给值班主管' },
  { title: '安全类', text: '受伤、走失、拥挤踩踏风险：跳过普通队列，立即电话通知值班主管' },
  { title: '与口碑联动', text: '工单按标签汇入运营驾驶舱，与 OTA 差评对照，评估差评拦截效果' },
]
