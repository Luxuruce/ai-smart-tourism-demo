// 来源：Dashboard.dc.html
import type { Alert, ComplaintShare, Kpi, TopQuestion, TrendPoint } from '../types'

export const dataSources = [
  { label: '携程 · 商家授权', enabled: true },
  { label: '美团 · 导出上传', enabled: true },
  { label: '小红书 / 抖音 · 舆情加购（未开通）', enabled: false },
]

export const kpis: Kpi[] = [
  { label: '差评率（≤3 分）· 主指标', value: '7.8%', sub: '较上线前 3 个月均值 −2.8 个百分点', trend: 'good' },
  { label: 'OTA 综合评分', value: '4.4', sub: '较上线前 +0.2', trend: 'good' },
  { label: '游中反馈 30 分钟受理率', value: '92%', sub: '本月 146 单，拦截后转差评 3 单', trend: 'neutral' },
  { label: 'AI 导游问题一次解决率', value: '89%', sub: '今日 1,380 问 · 答不上 42 问已记录', trend: 'neutral' },
]

export const badRateTrend = {
  note: '本月新增差评 23 条，其中排队与拥挤 8 条',
  /** 产品上线的位置：第 4 个点（7 月）之后 */
  launchAfterIndex: 3,
  points: [
    { month: '4 月', rate: 11.2 },
    { month: '5 月', rate: 10.8 },
    { month: '6 月', rate: 11.5 },
    { month: '7 月', rate: 9.6 },
    { month: '8 月', rate: 8.7 },
    { month: '9 月', rate: 7.8 },
  ] as TrendPoint[],
}

export const topQuestions: TopQuestion[] = [
  { rank: 1, text: '观光车在哪坐、几点有车', count: 312 },
  { rank: 2, text: '文昌阁要排多久', count: 268 },
  { rank: 3, text: '夜游几点开始、要不要另买票', count: 205, flag: { text: '缺官方口径 · 待补', kind: 'gap' } },
  { rank: 4, text: '哪里有母婴室', count: 146 },
  { rank: 5, text: '古戏台今天几点演出', count: 131, flag: { text: '缺演出排期 · 待补', kind: 'gap' } },
  { rank: 6, text: '附近哪里吃饭', count: 118, flag: { text: '可接入商户券', kind: 'biz' } },
]

export const alerts: Alert[] = [
  {
    id: 'crowd-wc', level: 'high', category: '客流', action: 'push',
    title: '文昌阁飞檐 14:00–16:00 预计排队超 30 分钟',
    desc: '建议向正前往的 420 人推送替代机位和「15:30 再来」，预计削峰 25%。',
    basis: '依据 8 条差评',
    reach: 420,
    pushedText: '已推送 420 人 · 136 人改去替代机位',
  },
  {
    id: 'wc-supply', level: 'mid', category: '卫生与设施', action: 'dispatch',
    title: '古戏台东侧卫生间补给不及时',
    desc: '5 条评论 + 6 张工单指向同一处，建议午高峰加巡检。',
    basis: '去派单',
  },
  {
    id: 'price-tag', level: 'mid', category: '商业秩序', action: 'dispatch',
    title: '阁前茶铺：3 条「价格没标清」反馈',
    desc: '来自 AI 导游对话与反馈，已归并并附定位。',
    basis: '派单巡查',
  },
]

export const complaintShares: ComplaintShare[] = [
  { label: '排队与拥挤', percent: 34 },
  { label: '卫生与设施', percent: 18 },
  { label: '讲解与内容', percent: 15 },
  { label: '动线与指引', percent: 13 },
  { label: '价格与性价比', percent: 11 },
  { label: '其他', percent: 9 },
]
