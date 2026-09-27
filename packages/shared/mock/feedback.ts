// 来源：Feedback.dc.html、Me.dc.html + 开发交接文档 v1.1（13.4 4.1/4.2/4.4、附录 B.6）
import type { VisitorFeedback } from '../types'

/** 反馈页文本框为空，只显示提示文字（13.4 4.4） */
export const feedbackForm = {
  placeholder: '一句话说说遇到的问题，例如：戏台旁的厕所没有纸了',
  queuePlaceholder: '说说排队时遇到的问题，例如有人插队、没人维持秩序',
  location: '古戏台东侧卫生间（已定位）',
  beforeInput: '输入后自动识别',
  safetyHint: '紧急情况请用一键求助',
}

/** 「修改」弹出的分类；含「安全 · 拥挤」，与识别规则一致（清单 9.2.1） */
export const FEEDBACK_CATEGORIES = [
  '讲解与内容', '排队与拥挤', '动线与指引', '卫生与设施', '服务态度',
  '价格与性价比', '商业化', '安全 · 拥挤', '其他',
]

export const SAFETY_CATEGORY = '安全 · 拥挤'

/** AI 识别的模拟规则：按顺序匹配，命中即停（附录 B.6；安全类去掉单字「挤」，见清单 9.2.1） */
export const CATEGORY_RULES: { keywords: string[]; category: string }[] = [
  { keywords: ['受伤', '走失', '挤到', '挤倒', '踩踏', '晕倒'], category: SAFETY_CATEGORY },
  { keywords: ['厕所', '纸', '脏', '垃圾', '湿'], category: '卫生与设施' },
  { keywords: ['排队', '插队', '人多', '等太久'], category: '排队与拥挤' },
  { keywords: ['价格', '贵', '标价', '宰客'], category: '价格与性价比' },
  { keywords: ['讲解', '牌子', '写错', '介绍'], category: '讲解与内容' },
  { keywords: ['路', '指示', '找不到', '迷路'], category: '动线与指引' },
  { keywords: ['态度', '工作人员', '凶'], category: '服务态度' },
]

export function classifyFeedback(text: string): string {
  const rule = CATEGORY_RULES.find((r) => r.keywords.some((k) => text.includes(k)))
  return rule ? rule.category : '其他'
}

/** 「我的反馈」标题：原型阶段取第一个逗号或句号之前的内容，最多 14 个字（13.4 4.2） */
export function summarizeFeedback(text: string): string {
  const first = text.trim().split(/[，,。.！!？?；;]/)[0] || text.trim()
  const chars = Array.from(first)
  return chars.length > 14 ? `${chars.slice(0, 14).join('')}…` : first
}

/** 提交后生成的工单号：第一条为 #1026（与后台对应），第二条起从 #1030 递增，避免与后台重号（清单 10.3） */
export const FIRST_TICKET_NO = 1026
export const NEXT_TICKET_NO = 1030

/**
 * 模拟后台处理的计时（14.2 11.2.3）：提交后 15 秒「已受理」，30 秒「已解决」。
 * 演示时可以调短。
 */
export const PROGRESS_TIMING = { acceptedMs: 15_000, resolvedMs: 30_000 }

/** 处理进度文案按 AI 类型区分，责任人与派单预填规则一致（清单 12.3） */
export const PROGRESS_TEXT: Record<string, { accepted: string; resolved: string }> = {
  '卫生与设施': { accepted: '[保洁 A] 正在处理', resolved: '已补充厕纸并拖干地面' },
  '排队与拥挤': { accepted: '[安保 B] 正在处理', resolved: '已安排工作人员到现场维持秩序' },
  '讲解与内容': { accepted: '[运营 C] 正在处理', resolved: '已转知识库复核，确认后更新讲解' },
  '动线与指引': { accepted: '[运营 C] 正在处理', resolved: '已临时张贴正确指引' },
  '价格与性价比': { accepted: '[市场巡查 D] 正在处理', resolved: '已联系商户核实，并要求明码标价' },
  '安全 · 拥挤': { accepted: '值班主管正在处理', resolved: '工作人员已到场处理' },
}
/** 服务态度、商业化、其他 */
export const PROGRESS_TEXT_DEFAULT = { accepted: '值班主管正在处理', resolved: '值班主管已联系相关人员处理' }
export const progressTextOf = (category?: string) => (category && PROGRESS_TEXT[category]) || PROGRESS_TEXT_DEFAULT

/** 「还没解决」后回到处理中（PRD S5-3） */
export const REOPENED_NOTE = '已重新打开，工作人员会再次处理'

export const submittedNote = '已通知现场工作人员 · 通常 15 分钟内处理'

/** 处理进度三步的名称；第二、三步的说明按 AI 类型取 PROGRESS_TEXT */
export const PROGRESS_STEPS = ['已提交', '已受理', '已解决'] as const

/**
 * 「我的反馈」初始只有 #1021。原型为展示效果预置了 #1026，
 * 实现时由一键反馈的提交动作写入，避免重复（交接文档 V6）。
 */
export const initialFeedbacks: VisitorFeedback[] = [
  { id: '1021', title: '老街牌坊的指示牌方向指错了', text: '老街牌坊的指示牌方向指错了', status: 'resolved', note: '14:32 已临时张贴正确指引' },
]

export const RATE_TEXT = {
  good: '感谢评价，已反馈给景区',
  bad: REOPENED_NOTE,
}
