// 来源：Guide.dc.html
import type { AnswerBlock, QaScenario, QaScenarioId } from '../types'

export const guideMeta = {
  subtitle: '只根据景区审核过的资料回答，每条都注明依据',
  /** 附近讲解条：点击后在本页展开迷你播放条（13.1 1.4），讲解内容取文昌阁的等待填充 */
  nearby: { spotId: 'wc', spot: '文昌阁', story: '听「飞檐为什么翘起来」· 1:15' },
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
        ],
        // 13.2 2.1：资料里没有的也显示依据行，原来的「已记录为待补充」合并进来
        basis: '景区知识库未收录（已提交补充）',
      },
    ],
  },
  {
    // 附录 B.2
    id: 'zhuangyuan',
    chip: '状元祠的故事',
    turns: [
      user('状元祠讲的是什么故事？'),
      {
        role: 'ai',
        blocks: [
          { type: 'text', text: '[示例回答] 状元祠纪念的是本镇历代读书人。可以带着这三个问题去看：' },
          { type: 'items', items: [
            { bold: '1. 科举有多难？', text: '祠内展板讲了从县试到殿试要考多少轮。' },
            { bold: '2. 门口的旗杆石是做什么的？', text: '过去考中功名的人家，才能在门前竖旗杆。' },
            { bold: '3. 适合孩子吗？', text: '适合，这里有 2 个观察小任务，完成可集「祠」章。' },
          ] },
          { type: 'actions', items: [
            { label: '在地图上看状元祠', kind: 'action', link: { page: 'map', focus: 'zy' } },
            { label: '看亲子研学路线', kind: 'ok', link: { page: 'trip', persona: 'family', tripTab: 'plan' } },
          ] },
        ],
        basis: '[《XX 镇志》第 X 页] · 景区知识库（已审核）',
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
            { label: '15:30 再来', kind: 'ok', link: { page: 'trip', tripTab: 'plan' } },
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
            { label: '生成完整行程', kind: 'action', link: { page: 'trip', persona: 'night', tripTab: 'plan' } },
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
            { label: '帮我约观光车', kind: 'action', link: { page: 'trip', persona: 'elder', tripTab: 'bus' } },
            { label: '查看休息点', kind: 'ok', link: { page: 'map', focus: 'rest1' } },
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

// —— 机位追问场景（附录 C.1）：一问一答，只能通过 q 参数打开，不出现在快捷问题里 ——

type Item = { bold: string; text: string }

function spotScenario(id: QaScenarioId, name: string, intro: string, items: Item[], spotId: string | null, basis: string): QaScenario {
  const actions: AnswerBlock = spotId
    ? { type: 'actions', items: [
        { label: '看机位详情', kind: 'action', link: { page: 'spot', id: spotId } },
        { label: '在地图上看', kind: 'ok', link: { page: 'map', focus: spotId } },
      ] }
    : { type: 'actions', items: [{ label: '在地图上看', kind: 'ok', link: { page: 'map' } }] }
  return {
    id,
    chip: spotId ? `关于${name}` : '关于这里',
    turns: [
      user(spotId ? `关于${name}，还能问什么？` : '关于这里，还能问什么？'),
      { role: 'ai', blocks: [{ type: 'text', text: intro }, { type: 'items', items }, actions], basis },
    ],
  }
}

const REVIEWED = '[《XX 镇志》第 X 页] · 景区知识库（已审核）'

export const spotScenarios: QaScenario[] = [
  spotScenario('paifang', '老街牌坊', '[示例回答] 关于老街牌坊，游客最常问这三件事：', [
    { bold: '表彰的是谁？', text: '牌坊正中的题字记录了受表彰的人和事，具体人物以镇志为准。' },
    { bold: '怎么拍？', text: '站在老街中段往回拍，能把牌坊和老街纵深一起框进画面。' },
    { bold: '有什么小任务？', text: '数一数牌坊有几个门洞，答对可以集「坊」章。' },
  ], 'pf', REVIEWED),
  spotScenario('xitai', '古戏台', '[示例回答] 关于古戏台，游客最常问这三件事：', [
    { bold: '什么时候有演出？', text: '今天 14:30 一场，夜游时 19:30 有夜场（示例），以景区公告为准。' },
    { bold: '为什么对着祠堂？', text: '戏既唱给乡亲，也唱给祖先，所以戏台和祠堂相对。' },
    { bold: '有什么小任务？', text: '找一找台口两侧柱子上挂着什么，答对可以集「台」章。' },
  ], 'xt', REVIEWED),
  spotScenario('kuixing', '魁星楼', '[示例回答] 关于魁星楼，游客最常问这三件事：', [
    { bold: '魁星是谁？', text: '古人心中主管文运的神，一手执笔、一脚踩鳌头。' },
    { bold: '怎么拍？', text: '侧檐 + 远山是文昌阁的同款构图，几乎不用排队。' },
    { bold: '有什么小任务？', text: '看看魁星像的脚踩着什么，答对可以集「楼」章。' },
  ], 'kx', REVIEWED),
  // 第 1 条资料里暂无考据，依据行按规则 R0-4 写「未收录」
  spotScenario('gongqiao', '石拱桥', '[示例回答] 关于石拱桥，游客最常问这三件事：', [
    { bold: '建了多少年？', text: '具体年代待景区资料补充，我不乱说。' },
    { bold: '怎么拍？', text: '傍晚逆光最好，站在下游的岸边拍桥拱倒影。' },
    { bold: '有什么小任务？', text: '数一数桥有几个拱，答对可以集「桥」章。' },
  ], 'gq', '景区知识库未收录（已提交补充）'),
  spotScenario('town', '', '[示例回答] 关于这里，游客最常问这三件事：', [
    { bold: '古镇为什么叫「青石」？', text: '老街全部铺着青石板，雨后发亮，古镇因此得名。' },
    { bold: '哪里人少？', text: '打开地图看各机位的等待时间，绿色的地方人少。' },
    { bold: '遇到问题怎么办？', text: '点右下角「反馈」，一句话告诉景区，通常 15 分钟内有人处理。' },
  ], null, REVIEWED),
]

/** 机位 → 追问场景；没有专属场景的机位用 town（附录 C.1） */
export const SPOT_SCENARIO: Record<string, QaScenarioId> = {
  wc: 'history',
  zy: 'zhuangyuan',
  pf: 'paifang',
  xt: 'xitai',
  kx: 'kuixing',
  gq: 'gongqiao',
}

export const scenarioOfSpot = (spotId: string): QaScenarioId => SPOT_SCENARIO[spotId] ?? 'town'

