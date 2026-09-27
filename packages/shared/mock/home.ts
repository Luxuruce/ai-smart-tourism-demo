// 来源：Main.dc.html
import type { Persona, PersonaId, Recommendation } from '../types'
import { CLOSING_TIME, hoursLeftText } from './clock'

export const personas: Persona[] = [
  { id: 'photo', label: '青年打卡' },
  { id: 'family', label: '亲子研学' },
  { id: 'elder', label: '带老人' },
  { id: 'night', label: '夜游古镇' },
]

export const DEFAULT_PERSONA: PersonaId = 'photo'

export const homeInfo = {
  name: '青石古镇',
  subtitle: '[示例景区] · 今天想怎么逛？',
  blocks: [
    { label: '天气', value: '26℃ 多云' },
    { label: `${CLOSING_TIME} 闭园`, value: `还能逛 ${hoursLeftText()}` },
    { label: '观光车 · 南门', value: '3 分钟后' },
  ],
  alert: {
    title: '文昌阁 14:00–16:00 是排队高峰',
    desc: 'AI 建议：先逛状元祠和古戏台，15:30 再来，光线更好，预计少等 15 分钟。（示例）',
    cta: '按这个顺序排行程 ›',
  },
}

export const recommendations: Recommendation[] = [
  { personaId: 'photo', tag: '机位', title: '文昌阁飞檐 · 约等 25 分钟', desc: '有 2 个同款出片、人更少的替代机位', link: { page: 'spot', id: 'wc' } },
  { personaId: 'photo', tag: '此刻人少', title: '石拱桥 · 不用等', desc: '步行 4 分钟，傍晚逆光更出片', link: { page: 'map', focus: 'gq' } },
  { personaId: 'photo', tag: '约 3 小时', title: '半日出片路线', desc: '6 个机位按实时排队排好顺序，高峰机位自动往后放', link: { page: 'trip' } },

  { personaId: 'family', tag: '8–12 岁', title: '故事版讲解 + 6 个观察小任务', desc: '排队时也能边玩边学，完成可收集印章', link: { page: 'queue', id: 'wc' } },
  { personaId: 'family', tag: '研学', title: '状元祠：本镇读书人的故事', desc: '讲解可切换为「讲给孩子」版，配合答题打卡', link: { page: 'guide' } },
  { personaId: 'family', tag: '安全', title: '走散提醒与寻人', desc: '开启同行人位置共享；游客中心可发起寻人广播', link: { page: 'sos' } },

  { personaId: 'elder', tag: '适老', title: '少走路路线：观光车 + 短步行', desc: '步行控制在 1.5 公里内，沿途休息点和厕所都已标注', link: { page: 'trip' } },
  { personaId: 'elder', tag: '演出', title: '古戏台 14:30 演出，有座位区', desc: '提前 15 分钟到可坐前排，旁边有无障碍洗手间（示例）', link: { page: 'map', focus: 'xt' } },
  { personaId: 'elder', tag: '安全', title: '医务室与休息点', desc: '体力不支时，一键求助或导航到最近的服务点', link: { page: 'sos' } },

  { personaId: 'night', tag: '约 2 小时', title: '夜游古镇 · 18:30 亮灯', desc: '老街 → 古戏台 → 荷塘廊桥 → 石拱桥，按亮灯和演出时间排好', link: { page: 'trip' } },
  { personaId: 'night', tag: '天气', title: '今晚会不会下雨？', desc: 'AI 会在 17:00 再判断一次，变天会主动提醒你（示例）', link: { page: 'guide' } },
  { personaId: 'night', tag: '安全', title: '夜里路滑的地方', desc: '荷塘栈道 19:00 后湿滑，已在地图上标注', link: { page: 'sos' } },
]
