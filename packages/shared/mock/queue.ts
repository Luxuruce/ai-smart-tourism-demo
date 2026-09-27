// 来源：Queue.dc.html。原型只为文昌阁飞檐写了等待填充内容，其他机位暂时复用这一套。
import type { QueueContent } from '../types'
import { timeLeftText } from './clock'

/** 拍完时距离开始排队过去的分钟数（「这次用时 18 分钟」） */
const DONE_AFTER_MIN = 18

export const queueContent: QueueContent = {
  spotId: 'wc',
  spotName: '文昌阁飞檐',
  elapsed: '06:12',
  ahead: '前面约 8 人',
  remain: '预计还需 12 分钟',
  progress: 34,
  storyTitle: '飞檐为什么翘起来？',
  storyProgress: '0:30',
  versions: [
    { id: 'std', label: '标准版', duration: '1:15', text: '[讲解正文示例] 抬头看这一角高高翘起的屋檐，它不只是为了好看……正式内容由景区已审核的知识库生成。' },
    { id: 'kid', label: '讲给孩子', duration: '0:50', text: '[示例] 小朋友，你看屋檐的角，像不像一只准备起飞的小鸟？古人让它翘起来，下雨时雨水就能被甩得远远的……' },
    { id: 'deep', label: '深度考据', duration: '4:30', text: '[示例] 从传统木构的「举折」做法讲起：屋檐起翘既能排雨、采光，也体现了建筑的等级与审美……（深度内容需景区审核后上线）' },
    { id: 'quick', label: '1 分钟速听', duration: '1:00', text: '[示例] 一句话：飞檐起翘让雨水甩得更远、屋里更亮，也让厚重的屋顶显得轻盈。' },
  ],
  source: '出处：[《XX 镇志》第 X 页]（已审核）',
  followUps: ['它是哪年修的？', '怎么拍才好看？'],
  quiz: {
    progress: '观察小任务 · 1/3',
    question: '找一找：屋檐的四个角上，各蹲着几只小兽？',
    options: ['3', '5', '7'],
    answer: '5',
    explain: '答对了！[示例答案解析，来自知识库]',
    wrongHint: '再仔细数数看，转到屋檐另一侧也许看得更清楚',
    stamp: '阁',
  },
  merchants: [
    { name: '[商户] 阁前茶铺', walk: '步行 1 分钟', item: '桂花乌龙', coupon: { label: '领 5 元券', claimed: false } },
    { name: '[商户] 古镇文创馆', walk: '步行 3 分钟', item: '飞檐书签', placeholder: '团购 · 即将上线' },
  ],
  doneTime: `这次用时 ${DONE_AFTER_MIN} 分钟，已匿名更新机位热度，帮后面的人少等一会儿`,
  nextStop: { name: '石拱桥', desc: '不用等 · 步行 4 分钟 · 傍晚逆光更出片', link: { page: 'map', focus: 'gq' } },
  timeLeft: `下一站推荐 · 还能逛 ${timeLeftText(DONE_AFTER_MIN)}`,
}

/** 今日收集：6 个印章位。初始只收集了「桥」，答对文昌阁小任务后收入「阁」 */
export const STAMP_SLOTS = 6
export const STAMP_ORDER = ['阁', '桥']
export const INITIAL_STAMPS = ['桥']
