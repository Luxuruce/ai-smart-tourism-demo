// 来源：Trip.dc.html
import type { BusInfo, TripPlan } from '../types'

export const tripPlan: TripPlan = {
  meta: '今天 · 2 人同行 · 青年打卡',
  title: '半日出片路线',
  stats: [
    { label: '机位', value: '6 个' },
    { label: '步行', value: '约 2.4 公里' },
    { label: '预计少排队', value: '35 分钟' },
  ],
  steps: [
    { time: '14:20', place: '状元祠', tip: '现在人少，先听状元故事，顺手做 2 个观察小任务。' },
    { time: '14:50', place: '古戏台', tip: '14:30 场正在演，能赶上后半段；东侧就是洗手间。' },
    { time: '15:30', place: '文昌阁飞檐', tip: '高峰过后预计约等 10 分钟，15:00–16:30 光线最好。', adjusted: true },
    { time: '16:00', place: '观光车 · 文昌阁站', tip: '坐到魁星楼站，省下 15 分钟步行。' },
    { time: '16:20', place: '魁星楼侧檐', tip: '飞檐 + 远山构图，几乎不用等。' },
    { time: '17:00', place: '石拱桥', tip: '傍晚逆光最出片，17:30 闭园前从南门出。' },
  ],
}

export const busInfo: BusInfo = {
  line: '观光车 · 文昌阁站 → 魁星楼站',
  rule: '每 30 分钟一班 · 单程 [价格] · 末班 17:00',
  aiTip: 'AI 推荐 16:00 班次：拍完文昌阁正好赶上，比步行过去省 15 分钟（示例）。',
  // PRD 规则 R1-3：不设付费优先，必须显示
  fairness: '预约只锁定乘车时段，所有人同价，不设付费优先。',
  defaultSlot: '16:00',
  slots: [
    { key: '15:00', range: '15:00–15:30', note: '余位紧张' },
    { key: '15:30', range: '15:30–16:00', note: '已约满', full: true },
    { key: '16:00', range: '16:00–16:30', note: '推荐 · 余位充足' },
    { key: '16:30', range: '16:30–17:00', note: '末班 · 余位充足' },
  ],
}

export const tripFollowNote = {
  bold: 'AI 会一直跟着这份行程：',
  text: '文昌阁排队变长或突然下雨时，会问你要不要调整顺序；离闭园 30 分钟时提醒你往南门走。',
}
