// 来源：Trip.dc.html（青年打卡）+ 开发交接文档 v1.1 附录 B.1（其他身份）、13.6（座位数据）
import type { BusInfo, PersonaId, TripPlan } from '../types'

/** meta 只写身份部分；「今天 · {n} 人同行」由页面按同行人数拼接 */
export const tripPlan: TripPlan = {
  meta: '青年打卡',
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

export const tripPlans: Record<PersonaId, TripPlan> = {
  photo: tripPlan,
  elder: {
    meta: '带老人',
    title: '少走路路线：观光车 + 短步行',
    stats: [
      { label: '步行', value: '约 1.2 公里' },
      { label: '乘车', value: '2 段' },
      { label: '休息点', value: '3 个' },
    ],
    steps: [
      { time: '14:20', place: '古戏台 · 座位区', tip: '14:30 场演出，提前 10 分钟入座前排；东侧有无障碍洗手间。' },
      { time: '15:05', place: '状元祠', tip: '步行约 6 分钟，全程平路；祠内有座位，听状元故事约 15 分钟。' },
      { time: '15:40', place: '老街中段休息亭', tip: '歇一歇再上车，旁边有茶铺。' },
      { time: '16:00', place: '观光车 · 文昌阁站', tip: '15:30 班次已约满，已改约 16:00；坐到魁星楼站，省去最长的一段坡路。', adjusted: true },
      { time: '16:20', place: '魁星楼', tip: '几乎不用等，看飞檐和远山；楼下就是观光车站。' },
      { time: '16:50', place: '观光车 · 魁星楼站', tip: '坐 17:00 末班车回南门，17:30 闭园前出园。' },
    ],
  },
  family: {
    meta: '亲子研学',
    title: '亲子研学路线',
    stats: [
      // 按 13.3 3.5 的配题，路线上 5 个机位共 8 题（清单 9.2.3）
      { label: '小任务', value: '8 个' },
      { label: '步行', value: '约 2 公里' },
      { label: '可集印章', value: '5 枚' },
    ],
    steps: [
      { time: '14:20', place: '状元祠', tip: '听「讲给孩子」版状元故事，完成 2 个观察小任务，集「祠」章。' },
      { time: '15:00', place: '古戏台', tip: '在戏台上找一找对联，集「台」章；东侧有母婴室。' },
      { time: '15:30', place: '文昌阁飞檐', tip: '高峰过后预计约等 10 分钟；排队时做飞檐小任务，集「阁」章。', adjusted: true },
      { time: '16:00', place: '观光车 · 文昌阁站', tip: '坐到魁星楼站，孩子不用走长坡。' },
      { time: '16:20', place: '魁星楼', tip: '听魁星点斗的故事，集「楼」章。' },
      { time: '17:00', place: '石拱桥', tip: '数一数桥有几个拱，集「桥」章；17:30 闭园前从南门出。' },
    ],
  },
  night: {
    meta: '夜游古镇',
    title: '夜游古镇 · 18:30 亮灯',
    stats: [
      { label: '时长', value: '约 2 小时' },
      { label: '步行', value: '约 1.8 公里' },
      { label: '夜场演出', value: '19:30' },
    ],
    steps: [
      { time: '18:10', place: '南门', tip: '夜游开放时间、是否另购票以景区公告为准 [待景区确认]。' },
      { time: '18:30', place: '老街 · 亮灯', tip: '灯笼从牌坊开始依次点亮，站在牌坊下看得最完整。' },
      { time: '19:00', place: '老街牌坊', tip: '亮灯时人最多，AI 建议 19:00 再拍，预计约等 10 分钟。', adjusted: true },
      { time: '19:30', place: '古戏台 · 夜场演出', tip: '约 40 分钟（示例），提前 10 分钟入场。' },
      { time: '20:15', place: '荷塘廊桥', tip: '灯影倒映在荷塘里；19:00 后栈道湿滑，走廊桥，不走栈道。' },
      { time: '20:40', place: '石拱桥', tip: '20:00 后可能有小雨，带好伞；看完从南门出。' },
    ],
  },
}

export const busInfo: BusInfo = {
  line: '观光车 · 文昌阁站 → 魁星楼站',
  rule: '每 30 分钟一班 · 单程 [价格] · 末班 17:00',
  aiTips: {
    photo: 'AI 推荐 16:00 班次：拍完文昌阁正好赶上，比步行过去省 15 分钟（示例）。',
    // 清单 9.2.5
    elder: 'AI 推荐 16:00 班次：15:30 已约满，16:00 班次不赶时间，可在古戏台多坐一会儿（示例）。',
    family: 'AI 推荐 16:00 班次：集完「阁」章正好赶上 16:00 班次，孩子不用走长坡（示例）。',
  },
  // PRD 规则 R1-3：不设付费优先，必须显示
  fairness: '预约只锁定乘车时段，所有人同价，不设付费优先。',
  nightNotice: '观光车 17:00 后停运，夜游请步行游览。',
  phone: '138****0000 [示例]',
  defaultSlot: '16:00',
  maxSeats: 6,
  tightRatio: 0.2,
  // 清单 9.3：每班 40 座
  slots: [
    { key: '15:00', range: '15:00–15:30', capacity: 40, remaining: 6 },
    { key: '15:30', range: '15:30–16:00', capacity: 40, remaining: 0 },
    { key: '16:00', range: '16:00–16:30', tag: '推荐', capacity: 40, remaining: 24 },
    { key: '16:30', range: '16:30–17:00', tag: '末班', capacity: 40, remaining: 30 },
  ],
}

export const tripFollowNote = {
  bold: 'AI 会一直跟着这份行程：',
  text: '文昌阁排队变长或突然下雨时，会问你要不要调整顺序；离闭园 30 分钟时提醒你往南门走。',
}
