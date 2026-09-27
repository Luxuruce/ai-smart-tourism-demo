// 来源：Map.dc.html（景点、设施、坐标）、Spot.dc.html（替代机位）
import type { Heat, ServicePoint, ServiceType, ServiceTypeMeta, Spot } from '../types'

export const HEAT_LABEL: Record<Heat, string> = {
  high: '热度 高',
  mid: '热度 中',
  low: '热度 低',
}

export const spots: Spot[] = [
  {
    id: 'wc', name: '文昌阁飞檐', short: '文昌阁', heat: 'high', waitMin: 25, x: 90, y: 150, types: ['photo', 'story'],
    detail: '约 14 人排队 · 有 2 个同款但人少的替代机位 · 有讲解',
    queueCount: 14, bestLight: '15:00–16:30',
    alts: [
      { id: 'kx', name: '魁星楼侧檐', desc: '同样的飞檐 + 远山构图 · 步行 3 分钟', heat: 'low', waitMin: 2 },
      { id: 'yd', name: '文昌阁背面月洞门', desc: '框景构图，同一座阁楼 · 步行 2 分钟', heat: 'mid', waitMin: 8 },
    ],
  },
  { id: 'pf', name: '老街牌坊', short: '牌坊', heat: 'high', waitMin: 18, x: 250, y: 110, types: ['photo'], detail: '约 9 人排队 · 有 1 个同款替代机位', queueCount: 9 },
  { id: 'xt', name: '古戏台', short: '戏台', heat: 'mid', waitMin: 8, x: 170, y: 170, types: ['story'], detail: '14:30 有一场演出（示例）· 有讲解' },
  { id: 'zy', name: '状元祠', short: '状元祠', heat: 'mid', waitMin: 6, x: 60, y: 60, types: ['story'], detail: '适合亲子 · 有 2 个观察小任务' },
  { id: 'kx', name: '魁星楼侧檐', short: '魁星楼', heat: 'low', waitMin: 2, x: 300, y: 205, types: ['photo'], detail: '文昌阁的同款替代机位 · 飞檐 + 远山构图' },
  { id: 'gq', name: '石拱桥', short: '石拱桥', heat: 'low', waitMin: 0, x: 120, y: 300, types: ['photo'], detail: '几乎不用等 · 傍晚逆光更出片' },
  { id: 'ht', name: '荷塘廊桥', short: '廊桥', heat: 'low', waitMin: 3, x: 232, y: 318, types: ['photo'], detail: '约 3 分钟 · 适合拍人像' },
]

export const SERVICE_TYPES: Record<ServiceType, ServiceTypeMeta> = {
  wc: { label: '洗手间', glyph: 'WC', placeholder: '步行导航 · 即将上线' },
  bus: { label: '观光车', glyph: '车', placeholder: '在线购票 · 即将上线' },
  info: { label: '游客中心', glyph: 'i', placeholder: '步行导航 · 即将上线' },
  med: { label: '医务室', glyph: '+', placeholder: '一键呼叫 · 即将上线' },
  park: { label: '停车场', glyph: 'P', placeholder: '空位查询 · 即将上线' },
}

export const SERVICE_TYPE_ORDER: ServiceType[] = ['wc', 'bus', 'info', 'med', 'park']

export const services: ServicePoint[] = [
  { id: 'wc1', type: 'wc', name: '古戏台东侧洗手间', x: 206, y: 204, distance: '120 米', detail: '含无障碍厕位、母婴室 · 当前无需排队（示例）' },
  { id: 'wc2', type: 'wc', name: '状元祠北侧洗手间', x: 28, y: 112, distance: '380 米', detail: '含无障碍厕位' },
  { id: 'wc3', type: 'wc', name: '荷塘洗手间', x: 290, y: 282, distance: '260 米', detail: '当前约 3 人排队（示例）' },
  { id: 'bus1', type: 'bus', glyph: '票', name: '观光车售票点 · 南门', x: 118, y: 352, distance: '70 米', detail: '单程 [价格] · 首班 8:30 · 末班 17:00 · 下一班约 3 分钟（示例）' },
  { id: 'bus2', type: 'bus', name: '观光车站 · 文昌阁', x: 58, y: 196, distance: '300 米', detail: '可在此上下车 · 下一班约 8 分钟（示例）' },
  { id: 'bus3', type: 'bus', name: '观光车站 · 魁星楼', x: 322, y: 150, distance: '420 米', detail: '可在此上下车 · 线路终点' },
  { id: 'info', type: 'info', name: '游客中心', x: 222, y: 348, distance: '60 米', detail: '行李寄存、失物招领、轮椅与婴儿车租借' },
  { id: 'med', type: 'med', name: '医务室', x: 318, y: 336, distance: '150 米', detail: '位于游客中心东侧 · 开放时间 8:30–17:30（示例）' },
  { id: 'park', type: 'park', name: '南门停车场', x: 34, y: 352, distance: '200 米', detail: '小型车 [车位数] 个 · 收费标准 [待填写]' },
]

export const mapMeta = {
  updated: '热度更新于 3 分钟前 · 示例数据',
  /** 游客当前位置（地图上的蓝点） */
  me: { x: 175, y: 362 },
}
