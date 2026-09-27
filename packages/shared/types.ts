// 两端共用的实体类型。字段含义见《开发交接文档》5.2 节。

export type Heat = 'low' | 'mid' | 'high'

/** 游客端页面名，对应 pages/{name}/index */
export type PageName =
  | 'home' | 'map' | 'trip' | 'guide' | 'me'
  | 'spot' | 'queue' | 'feedback' | 'sos'

/**
 * 页面跳转目标。
 * - id：机位 id（spot / queue 页用）
 * - focus：跳到地图时要选中的景点或设施 id
 * - q：打开 AI 导游时直接显示的对话场景
 * - persona：跳转前先切换游览身份
 * - tripTab：打开行程页的哪个 tab
 * - query：普通页的其他参数（如反馈页的 from、spot）
 */
export interface Route {
  page: PageName
  id?: string
  focus?: string
  q?: QaScenarioId
  persona?: PersonaId
  tripTab?: 'plan' | 'bus'
  query?: Record<string, string>
}

export type SpotType = 'photo' | 'story'

/** 景点 / 打卡机位 */
export interface Spot {
  id: string
  name: string
  short: string
  heat: Heat
  /** 0 表示「不用等」 */
  waitMin: number
  /** 在 350×380 示意地图上的坐标 */
  x: number
  y: number
  types: SpotType[]
  detail: string
  /** 同款替代机位，最多 3 个，只推荐热度低或中的（由 service 过滤） */
  alts?: AltSpot[]
  bestLight?: string
  queueCount?: number
}

/**
 * 替代机位。与交接文档草案的 altIds 不同：替代机位的描述（步行距离、构图）
 * 是相对原机位而言的，且「文昌阁背面月洞门」不在地图上，所以单独建模。
 */
export interface AltSpot {
  id: string
  name: string
  desc: string
  heat: Heat
  waitMin: number
}

export type ServiceType = 'wc' | 'bus' | 'info' | 'med' | 'rest' | 'park'

/** 服务设施 */
export interface ServicePoint {
  id: string
  type: ServiceType
  name: string
  /** 不填时用类型默认字符 */
  glyph?: string
  x: number
  y: number
  distance: string
  detail: string
}

export interface ServiceTypeMeta {
  label: string
  glyph: string
  /** 非观光车 / 医务室设施卡片上的占位按钮文案 */
  placeholder: string
}

export type PersonaId = 'photo' | 'family' | 'elder' | 'night'

export interface Persona {
  id: PersonaId
  label: string
}

export interface Recommendation {
  personaId: PersonaId
  tag: string
  title: string
  desc: string
  link: Route
}

export type NarrationId = 'std' | 'kid' | 'deep' | 'quick'

export interface NarrationVersion {
  id: NarrationId
  label: string
  duration: string
  text: string
}

export interface QuizTask {
  question: string
  options: string[]
  /** 选项的量词，如「只」「层」；非数字选项不填 */
  unit?: string
  answer: string
  explain: string
  wrongHint: string
  /** 答对后收入「今日收集」的印章字 */
  stamp: string
}

export interface Merchant {
  name: string
  walk: string
  item: string
  coupon?: { label: string; claimed: boolean }
  placeholder?: string
}

/**
 * 排队页的「等待填充」内容。
 * 等待不超过 2 分钟的机位进入「打卡模式」：不显示排队计时、前方人数和进度。
 */
export interface QueueContent {
  spotId: string
  spotName: string
  mode: 'queue' | 'checkin'
  elapsed: string
  ahead: string
  remain: string
  progress: number
  storyTitle: string
  storyProgress: string
  versions: NarrationVersion[]
  source: string
  followUps: string[]
  /** 小任务，可为空（不显示小任务 tab） */
  quizzes: QuizTask[]
  /** 附近商户，可为空（不显示附近 tab） */
  merchants: Merchant[]
  doneTitle: string
  doneTime: string
  nextStop?: { name: string; desc: string; link: Route }
  timeLeft: string
}

export type ActionKind = 'action' | 'ok' | 'danger'

/** AI 回答的结构化片段 */
export type AnswerBlock =
  | { type: 'text'; text: string }
  /** 左侧短标签 + 右侧内容的行，如「路线 / 时间 / 天气」 */
  | { type: 'rows'; rows: { k: string; v: string }[] }
  /** 带粗体引导语的条目；bold 可为空 */
  | { type: 'items'; items: { bold?: string; text: string }[] }
  /** 提醒框 */
  | { type: 'notice'; text: string }
  /** 0–2 个跳转按钮 */
  | { type: 'actions'; items: { label: string; kind: ActionKind; link: Route }[] }
  /** 行内文字链接 */
  | { type: 'link'; label: string; link: Route }
  /** 小号灰字说明（如「已记录为待补充」） */
  | { type: 'meta'; text: string }

export interface QaTurn {
  role: 'user' | 'ai'
  /** user 轮只用第一个 text 块 */
  blocks: AnswerBlock[]
  /** 「依据：……」行，不含前缀 */
  basis?: string
}

export type QaScenarioId = 'history' | 'zhuangyuan' | 'photo' | 'night' | 'elder' | 'shop'

export interface QaScenario {
  id: QaScenarioId
  /** 底部快捷问题文字 */
  chip: string
  turns: QaTurn[]
}

export interface TripStep {
  time: string
  place: string
  tip: string
  adjusted?: boolean
}

export interface TripPlan {
  meta: string
  title: string
  stats: { label: string; value: string }[]
  steps: TripStep[]
}

export interface BusSlot {
  key: string
  range: string
  /** 标签前缀，如「推荐」「末班」 */
  tag?: string
  capacity: number
  /** 剩余座位（未计入本次演示中的预约） */
  remaining: number
}

export interface BusInfo {
  line: string
  rule: string
  /** 按身份的 AI 推荐说明；夜游没有 */
  aiTips: Partial<Record<PersonaId, string>>
  fairness: string
  /** 夜游行程下观光车 tab 的停运说明 */
  nightNotice: string
  phone: string
  defaultSlot: string
  maxSeats: number
  /** 余位低于这个比例显示「余位紧张」 */
  tightRatio: number
  slots: BusSlot[]
}

export type FeedbackStatus = 'pending' | 'resolved'

/** 游客端「我的反馈」里的一条 */
export interface VisitorFeedback {
  id: string
  /** 列表标题：AI 生成的摘要（原型按首句截取） */
  title: string
  text: string
  status: FeedbackStatus
  note: string
  /** 已解决的工单，游客评价结果 */
  rating?: 'good' | 'bad'
}

export type TicketStatus = 'pending' | 'processing' | 'overdue' | 'resolved' | 'closed'

export interface TicketEvent {
  label: string
  /** 演示中发生的事件带时间；原有工单的历史节点可以没有 */
  time?: string
  note?: string
}

export interface Ticket {
  id: string
  text: string
  aiType: string
  area: string
  owner: string
  status: TicketStatus
  statusText: string
  elapsed: string
  isSafety?: boolean
  history: TicketEvent[]
}

export interface Kpi {
  label: string
  value: string
  sub: string
  trend?: 'good' | 'neutral'
}

export interface Alert {
  id: string
  level: 'high' | 'mid'
  category: string
  title: string
  desc: string
  basis: string
  action: 'push' | 'dispatch'
  /** push 类预警：预计触达人数、推送后结果、冷却时长 */
  reach?: number
  pushedText?: string
  cooldownMin?: number
  /** dispatch 类预警：派单弹窗的预填内容 */
  dispatch?: DispatchDraft
}

export interface DispatchDraft {
  aiType: string
  area: string
  owner: string
  desc: string
  ticketId: string
}

export interface Review {
  channel: string
  score: number
  date: string
  text: string
}

export interface TopQuestion {
  rank: number
  text: string
  count: number
  flag?: { text: string; kind: 'gap' | 'biz' }
}

export interface TrendPoint {
  month: string
  rate: number
}

export interface ComplaintShare {
  label: string
  percent: number
}

export type ComplianceResult = 'pass' | 'partial' | 'fail' | 'na'

export interface ComplianceItem {
  clause: string
  requirement: string
  result: ComplianceResult
  evidence: string
  gap: string
}

export interface ComplianceSummary {
  standard: string
  subtitle: string
  counts: Record<ComplianceResult, number>
  items: ComplianceItem[]
  disclaimer: string
}
