// 来源：Queue.dc.html（文昌阁）+ 开发交接文档 v1.1 附录 B.5（其他机位）
import type { Merchant, NarrationVersion, QuizTask, Route } from '../types'
import { timeLeftText } from './clock'

/** 拍完时距离开始排队过去的分钟数（「这次用时 18 分钟」） */
export const DONE_AFTER_MIN = 18

/** 各机位的等待填充内容（不含 mode、spotName，由 service 按机位数据补齐） */
export interface SpotFill {
  elapsed: string
  ahead: string
  remain: string
  progress: number
  storyTitle: string
  versions: NarrationVersion[]
  quizzes: QuizTask[]
  merchants: Merchant[]
  nextStop?: { name: string; desc: string; link: Route }
}

export const queueCommon = {
  storyProgress: '0:30',
  source: '出处：[《XX 镇志》第 X 页]（已审核）',
  followUps: ['它是哪年修的？', '怎么拍才好看？'],
  doneTime: `这次用时 ${DONE_AFTER_MIN} 分钟，已匿名更新机位热度，帮后面的人少等一会儿`,
  timeLeft: `下一站推荐 · 还能逛 ${timeLeftText(DONE_AFTER_MIN)}`,
}

const DEEP_PENDING = { id: 'deep' as const, label: '深度考据', duration: '—', text: '[深度内容需景区审核后上线]' }

function versions(std: string, kid: string, quick: string): NarrationVersion[] {
  return [
    { id: 'std', label: '标准版', duration: '1:00', text: std },
    { id: 'kid', label: '讲给孩子', duration: '0:45', text: kid },
    DEEP_PENDING,
    { id: 'quick', label: '1 分钟速听', duration: '1:00', text: quick },
  ]
}

const EXPLAIN = '答对了！[示例解析，以知识库为准]'
const WRONG = '再仔细看看，换个角度也许更清楚'
const quiz = (question: string, options: string[], answer: string, stamp: string, unit?: string): QuizTask =>
  ({ question, options, unit, answer, explain: EXPLAIN, wrongHint: WRONG, stamp })

const groupBuy = (name: string, walk: string, item: string): Merchant =>
  ({ name, walk, item, placeholder: '团购 · 即将上线' })

export const spotFills: Record<string, SpotFill> = {
  wc: {
    elapsed: '06:12',
    ahead: '前面约 8 人',
    remain: '预计还需 12 分钟',
    progress: 34,
    storyTitle: '飞檐为什么翘起来？',
    versions: [
      { id: 'std', label: '标准版', duration: '1:15', text: '[讲解正文示例] 抬头看这一角高高翘起的屋檐，它不只是为了好看……正式内容由景区已审核的知识库生成。' },
      { id: 'kid', label: '讲给孩子', duration: '0:50', text: '[示例] 小朋友，你看屋檐的角，像不像一只准备起飞的小鸟？古人让它翘起来，下雨时雨水就能被甩得远远的……' },
      { id: 'deep', label: '深度考据', duration: '4:30', text: '[示例] 从传统木构的「举折」做法讲起：屋檐起翘既能排雨、采光，也体现了建筑的等级与审美……（深度内容需景区审核后上线）' },
      { id: 'quick', label: '1 分钟速听', duration: '1:00', text: '[示例] 一句话：飞檐起翘让雨水甩得更远、屋里更亮，也让厚重的屋顶显得轻盈。' },
    ],
    quizzes: [
      { question: '找一找：屋檐的四个角上，各蹲着几只小兽？', options: ['3', '5', '7'], unit: '只', answer: '5', explain: '答对了！[示例答案解析，来自知识库]', wrongHint: '再仔细数数看，转到屋檐另一侧也许看得更清楚', stamp: '阁' },
      { question: '抬头看屋脊正中，立着的是什么？', options: ['宝葫芦', '小狮子', '铜钟'], answer: '宝葫芦', explain: '答对了！[示例解析] 屋脊中央的宝顶常做成葫芦形，寓意福禄。', wrongHint: '站远一点，看屋顶最高的那一点', stamp: '阁' },
      { question: '数一数，文昌阁一共有几层屋檐？', options: ['2', '3', '4'], unit: '层', answer: '3', explain: '答对了！[示例解析，以知识库为准] 三重檐让阁楼显得更高。', wrongHint: '从下往上数，每层都有翘起的檐角', stamp: '阁' },
    ],
    merchants: [
      { name: '[商户] 阁前茶铺', walk: '步行 1 分钟', item: '桂花乌龙', coupon: { label: '领 5 元券', claimed: false } },
      groupBuy('[商户] 古镇文创馆', '步行 3 分钟', '飞檐书签'),
    ],
    nextStop: { name: '石拱桥', desc: '不用等 · 步行 4 分钟 · 傍晚逆光更出片', link: { page: 'map', focus: 'gq' } },
  },
  pf: {
    elapsed: '04:30',
    ahead: '前面约 6 人',
    remain: '预计还需 13 分钟',
    progress: 25,
    storyTitle: '牌坊为什么立在街口？',
    versions: versions(
      '[示例] 老街牌坊是古镇的「门脸」，过去用来表彰功名或德行……正式内容由景区已审核的知识库生成。',
      '[示例] 小朋友，牌坊就像古镇的大门牌，上面刻的字是在夸奖一位了不起的人……',
      '[示例] 一句话：牌坊是表彰用的纪念性建筑，也是老街的入口标志。',
    ),
    quizzes: [quiz('牌坊一共有几个门洞？', ['1', '3', '5'], '3', '坊', '个')],
    merchants: [groupBuy('[商户] 老街糖画铺', '步行 1 分钟', '生肖糖画')],
    nextStop: { name: '荷塘廊桥', desc: '约等 3 分钟 · 适合拍人像', link: { page: 'map', focus: 'ht' } },
  },
  xt: {
    elapsed: '02:10',
    ahead: '前面约 3 人',
    remain: '预计还需 6 分钟',
    progress: 27,
    storyTitle: '戏台为什么对着祠堂？',
    versions: versions(
      '[示例] 古戏台常与祠堂相对，唱戏既是娱乐，也是祭祀的一部分……',
      '[示例] 以前没有电视，大家最开心的事就是看戏……',
      '[示例] 一句话：戏台对着祠堂，戏是唱给祖先和乡亲一起看的。',
    ),
    quizzes: [quiz('戏台台口两侧的柱子上挂着什么？', ['对联', '灯笼', '铜镜'], '对联', '台')],
    merchants: [groupBuy('[商户] 戏台边茶座', '步行 1 分钟', '盖碗茶')],
    nextStop: { name: '状元祠', desc: '约等 6 分钟 · 适合亲子 · 有 2 个观察小任务', link: { page: 'map', focus: 'zy' } },
  },
  zy: {
    elapsed: '01:40',
    ahead: '前面约 2 人',
    remain: '预计还需 4 分钟',
    progress: 30,
    storyTitle: '本镇的读书人有多拼？',
    versions: versions(
      '[示例] 状元祠纪念本镇历代读书人，讲的是科举考试的故事……',
      '[示例] 古时候考状元，比现在考大学还要难很多……',
      '[示例] 一句话：这里讲的是本镇读书人通过科举改变命运的故事。',
    ),
    quizzes: [
      quiz('找一找：祠堂门口的匾额上有几个字？', ['3', '4', '5'], '4', '祠', '个'),
      quiz('考中功名的人家，门口会竖起什么来表彰？', ['旗杆石', '石磨', '水井'], '旗杆石', '祠'),
    ],
    merchants: [groupBuy('[商户] 书院文创', '步行 2 分钟', '状元笔')],
    nextStop: { name: '文昌阁飞檐', desc: '约等 25 分钟 · 有 2 个同款但人少的替代机位', link: { page: 'map', focus: 'wc' } },
  },
  kx: {
    elapsed: '', ahead: '', remain: '', progress: 0,
    storyTitle: '魁星为何点斗？',
    versions: versions(
      '[示例] 魁星是古人心中主管文运的神，一手执笔、一脚踩鳌头，寓意「独占鳌头」……',
      '[示例] 魁星是古人心中保佑考试的神仙……',
      '[示例] 一句话：魁星点斗，寓意考中状元、独占鳌头。',
    ),
    quizzes: [quiz('魁星像的一只脚踩着什么？', ['鳌头', '祥云', '莲花'], '鳌头', '楼')],
    merchants: [],
    nextStop: { name: '石拱桥', desc: '不用等 · 傍晚逆光更出片', link: { page: 'map', focus: 'gq' } },
  },
  gq: {
    elapsed: '', ahead: '', remain: '', progress: 0,
    storyTitle: '石拱桥为什么是半圆的？',
    versions: versions(
      '[示例] 拱形能把桥面的重量分散到两岸，石头越压越紧……',
      '[示例] 你试试用手掌弯成拱形，是不是比平放的时候更能撑住东西？',
      '[示例] 一句话：拱形让石头互相挤紧，桥才能立几百年。',
    ),
    quizzes: [quiz('数一数，这座桥有几个桥拱？', ['1', '3', '5'], '3', '桥', '个')],
    merchants: [],
    // 清单 9.3：跳到地图并选中南门的观光车售票点
    nextStop: { name: '南门出口', desc: '闭园前从南门出', link: { page: 'map', focus: 'bus1' } },
  },
}

/** 通用古镇讲解：荷塘廊桥和其他没有专属内容的机位；不显示小任务和附近 tab */
export const genericFill: Omit<SpotFill, 'elapsed' | 'ahead' | 'remain' | 'progress'> = {
  storyTitle: '青石古镇为什么叫「青石」？',
  versions: versions(
    '[示例] 古镇的老街全部铺着青石板，下雨后石面发亮，这是古镇名字的由来……',
    '[示例] 低头看看脚下的石板，它们已经被人走了几百年……',
    '[示例] 一句话：满街青石板，是古镇名字的由来。',
  ),
  quizzes: [],
  merchants: [],
}

/** 今日收集：6 枚印章对应 6 个机位，初始 0/6（13.3 3.3） */
export const STAMP_SLOTS = 6
export const STAMP_ORDER = ['阁', '坊', '台', '祠', '楼', '桥']
export const INITIAL_STAMPS: string[] = []
