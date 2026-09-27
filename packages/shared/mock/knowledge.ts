// 来源：开发交接文档 v1.2 附录 C.4、14.5（不做前后台联动，待补问题固定为 3 条）
import type { KnowledgeEntry, PendingQuestion } from '../types'

/** 「已发布」固定底数：页头 = 底数 + 列表中新通过的条目（清单 12.3） */
export const PUBLISHED_BASE = 326

export const knowledgeMeta = {
  title: 'AI 问答与知识库',
  answerRequired: '答案和依据来源都要填写',
  sourceHint: '例如「《XX 镇志》第 X 页」或「景区公告」',
}

export const pendingQuestions: PendingQuestion[] = [
  { id: 'k-night', text: '夜游几点开始、要不要另买票', count: 205, lastAsked: '14:12', source: '游客在问什么', spot: '全镇' },
  { id: 'k-opera', text: '古戏台今天几点演出', count: 131, lastAsked: '14:05', source: '游客在问什么', spot: '古戏台' },
  { id: 'k-celebrity', text: '阁里住过什么名人吗？', count: 12, lastAsked: '13:48', source: 'AI 导游', spot: '文昌阁' },
]

export const knowledgeEntries: KnowledgeEntry[] = [
  { id: 'e1', title: '文昌阁 · 始建年代', spot: '文昌阁', source: '《XX 镇志》第 X 页', status: 'reviewing', note: '关联工单 #1019，讲解与门牌年代不一致', keyReview: true },
  { id: 'e2', title: '文昌阁 · 飞檐为什么翘起来', spot: '文昌阁', source: '《XX 镇志》第 X 页', status: 'published', reviewer: '[审核人 A]', date: '09-02', keyReview: false },
  { id: 'e3', title: '魁星楼 · 魁星点斗', spot: '魁星楼', source: '景区讲解词 2024 版 第 X 页', status: 'published', reviewer: '[审核人 A]', date: '09-02', keyReview: false },
  { id: 'e4', title: '状元祠 · 门前旗杆石', spot: '状元祠', source: '《XX 镇志》第 X 页', status: 'published', reviewer: '[审核人 B]', date: '09-05', keyReview: false },
  { id: 'e5', title: '古戏台 · 戏台与祠堂相对', spot: '古戏台', source: '景区讲解词 2024 版 第 X 页', status: 'published', reviewer: '[审核人 B]', date: '09-05', keyReview: false },
  { id: 'e6', title: '老街牌坊 · 表彰的人物', spot: '老街牌坊', source: '《XX 镇志》第 X 页', status: 'pending', keyReview: true },
  { id: 'e7', title: '石拱桥 · 桥拱数量与结构', spot: '石拱桥', source: '景区讲解词 2024 版 第 X 页', status: 'pending', keyReview: true },
  { id: 'e8', title: '荷塘廊桥 · 夜间开放时间', spot: '荷塘廊桥', source: '景区公告 [待景区提供]', status: 'rejected', note: '缺少官方口径', keyReview: false },
]

/** 答案里含数字、年代或朝代、人物称谓时，标为重点审核（清单 12.2.7） */
export function needsKeyReview(answer: string): boolean {
  return /\d|[一二三四五六七八九十百千]+年|年代|朝|明代|清代|宋代|元代|唐代|先生|状元|进士|人物/.test(answer)
}
