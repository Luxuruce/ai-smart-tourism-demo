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

/** 提交后生成的工单号（与后台工单 #1026 对应） */
export const FIRST_TICKET_NO = 1026

export const submittedNote = '已通知现场工作人员 · 通常 15 分钟内处理'

export const feedbackProgress = [
  { label: '已提交 · 刚刚', done: true },
  { label: '待受理 · 已通知[保洁 A]', done: false },
  { label: '已解决 · 等你确认', done: false },
]

/**
 * 「我的反馈」初始只有 #1021。原型为展示效果预置了 #1026，
 * 实现时由一键反馈的提交动作写入，避免重复（交接文档 V6）。
 */
export const initialFeedbacks: VisitorFeedback[] = [
  { id: '1021', title: '老街牌坊的指示牌方向指错了', text: '老街牌坊的指示牌方向指错了', status: 'resolved', note: '14:32 已临时张贴正确指引' },
]

export const RATE_TEXT = {
  good: '感谢评价，已反馈给景区',
  bad: '已重新打开工单，工作人员会再次处理',
}
