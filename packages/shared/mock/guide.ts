// 来源：Guide.dc.html
import type { QaScenario } from '../types'

export const guideMeta = {
  subtitle: '只根据景区审核过的资料回答，每条都注明依据',
  nearby: { spot: '文昌阁', story: '听「飞檐为什么翘起来」· 1:15 ›' },
  companions: '2 人同行 · 今天',
  placeholderReply: '（原型演示）请点击下方快捷问题体验',
}

const user = (text: string) => ({ role: 'user' as const, blocks: [{ type: 'text' as const, text }] })

export const qaScenarios: QaScenario[] = [
  {
    id: 'history',
    chip: '文昌阁的来历',
    turns: [
      user('文昌阁是哪年修的？'),
      {
        role: 'ai',
        blocks: [{ type: 'text', text: '[示例回答] 据镇志记载，文昌阁始建于[年代]，[朝代]年间重修……' }],
        basis: '[《XX 镇志》第 X 页]（已审核）',
      },
      user('阁里住过什么名人吗？'),
      {
        // 「不乱答」：资料里没有的，明确说暂无考据，并记为待补充问题
        role: 'ai',
        blocks: [
          { type: 'text', text: '这个问题景区资料里暂无考据，我不乱说。你可以去状元祠看看，那里有本镇历代读书人的故事。' },
          { type: 'link', label: '在地图上看状元祠 ›', link: { page: 'map', focus: 'zy' } },
          { type: 'meta', text: '已记录为「待补充」问题，景区补充资料后会更新' },
        ],
      },
    ],
  },
  {
    id: 'photo',
    chip: '附近哪里好拍',
    turns: [
      user('文昌阁人太多，附近哪里能拍同款？'),
      {
        role: 'ai',
        blocks: [
          { type: 'text', text: '文昌阁现在约等 25 分钟。这两个机位能拍到相近的画面：' },
          { type: 'items', items: [
            { bold: '魁星楼侧檐', text: ' · 约等 2 分钟 · 同样的飞檐 + 远山构图，步行 3 分钟' },
            { bold: '文昌阁背面月洞门', text: ' · 约等 8 分钟 · 框景构图，步行 2 分钟' },
          ] },
          { type: 'actions', items: [
            { label: '看替代机位', kind: 'action', link: { page: 'spot', id: 'wc' } },
            { label: '15:30 再来', kind: 'ok', link: { page: 'trip' } },
          ] },
        ],
        basis: '机位热度（游客匿名上报）· 机位库（踏勘拍摄）',
      },
    ],
  },
  {
    id: 'night',
    chip: '夜游怎么安排',
    turns: [
      user('今晚想夜游古镇，怎么安排？'),
      {
        role: 'ai',
        blocks: [
          { type: 'text', text: '按今晚亮灯和演出时间，给你排了一版：' },
          { type: 'rows', rows: [
            { k: '路线', v: '老街 → 古戏台 → 荷塘廊桥 → 石拱桥，约 2 小时' },
            { k: '时间', v: '18:30 亮灯，19:30 古戏台有夜场演出（示例）' },
            { k: '天气', v: '夜间 21℃，20:00 后可能有小雨（示例）' },
            { k: '提醒', v: '荷塘栈道 19:00 后湿滑，穿防滑鞋' },
          ] },
          { type: 'notice', text: '夜游开放时间、是否另购票以景区公告为准 [待景区确认]。天气变差我会第一时间提醒你。' },
          { type: 'actions', items: [
            { label: '生成完整行程', kind: 'action', link: { page: 'trip' } },
            { label: '夜游安全提示', kind: 'ok', link: { page: 'sos' } },
          ] },
        ],
        basis: '景区公告 · 实时气象 · 景区知识库。以现场通知为准。',
      },
    ],
  },
  {
    id: 'elder',
    chip: '带老人怎么逛',
    turns: [
      user('带 70 岁的老人，怎么逛不累？'),
      {
        role: 'ai',
        blocks: [
          { type: 'text', text: '少走路、多坐车、错开高峰就好：' },
          { type: 'items', items: [
            { text: '· 南门坐观光车到文昌阁站，再步行逛老街，全程步行不到 1.5 公里' },
            { text: '· 观光车可按时段预约，15:00 这一班还有余位（示例）' },
            { text: '· 古戏台有座位区；沿途休息点、无障碍洗手间和医务室都标在地图上' },
          ] },
          { type: 'actions', items: [
            { label: '帮我约观光车', kind: 'action', link: { page: 'trip' } },
            { label: '查看休息点', kind: 'ok', link: { page: 'map' } },
          ] },
        ],
        basis: '观光车运营规则 · 实时余位 · 服务设施台账。以现场通知为准。',
      },
    ],
  },
  {
    id: 'shop',
    chip: '买特产防坑',
    turns: [
      user('想买点特产，怎么才不被坑？'),
      {
        role: 'ai',
        blocks: [
          { type: 'text', text: '记住三件事：' },
          { type: 'items', items: [
            { bold: '1. 先看明码标价。', text: '镇内商户都应公示价格，没有标价的可以先问清总价再买。' },
            { bold: '2. 按斤还是按份问清楚。', text: '计价单位不清是最常见的纠纷来源。' },
            { bold: '3. 价格不对就反馈。', text: '一句话说明情况，AI 会自动定位并转给景区处理。' },
          ] },
          { type: 'actions', items: [
            { label: '遇到价格问题？一键反馈', kind: 'danger', link: { page: 'feedback' } },
          ] },
        ],
        basis: '景区商户管理规定 [待景区提供] · 市场监管公示',
      },
    ],
  },
]
