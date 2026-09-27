// 来源：Tickets.dc.html
import type { Ticket } from '../types'

export const ticketSummary = '今天 · 待受理 2 · 处理中 3 · 已解决 17 · 示例数据'

export const tickets: Ticket[] = [
  { id: '#1027', text: '石拱桥上人太多，有老人被挤到栏杆边', aiType: '安全 · 拥挤', area: '石拱桥', owner: '值班主管', status: 'processing', statusText: '处理中 · 已电话通知', elapsed: '4 分钟', isSafety: true },
  { id: '#1026', text: '戏台旁边的厕所没有纸了，地上也很湿', aiType: '卫生与设施', area: '古戏台', owner: '[保洁 A]', status: 'pending', statusText: '待受理', elapsed: '12 分钟' },
  { id: '#1024', text: '文昌阁排队没人管，有人插队', aiType: '排队与拥挤', area: '文昌阁', owner: '[安保 B]', status: 'overdue', statusText: '已超时 · 已升级', elapsed: '34 分钟' },
  { id: '#1021', text: '老街牌坊的指示牌方向指错了', aiType: '动线与指引', area: '老街', owner: '[运营 C]', status: 'resolved', statusText: '已解决 · 游客满意', elapsed: '27 分钟' },
  { id: '#1019', text: '讲解里说阁楼是明代的，门口牌子写清代？', aiType: '讲解与内容', area: '文昌阁', owner: '[运营 C]', status: 'processing', statusText: '处理中 · 已转知识库复核', elapsed: '1 小时' },
]

export const ticketRules = [
  { title: '分派规则', text: '类型 × 区域 → 责任人；30 分钟未受理，自动升级给值班主管' },
  { title: '安全类', text: '受伤、走失、拥挤踩踏风险：跳过普通队列，立即电话通知值班主管' },
  { title: '与口碑联动', text: '工单按标签汇入运营驾驶舱，与 OTA 差评对照，评估差评拦截效果' },
]
