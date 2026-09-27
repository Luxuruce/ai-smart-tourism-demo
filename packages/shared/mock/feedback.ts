// 来源：Feedback.dc.html、Me.dc.html
import type { VisitorFeedback } from '../types'

export const feedbackDraft = {
  text: '戏台旁边的厕所没有纸了，地上也很湿',
  aiType: '卫生与设施',
  location: '古戏台东侧卫生间（已定位）',
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
  { id: '1021', text: '老街牌坊的指示牌方向指错了', status: 'resolved', note: '14:32 已临时张贴正确指引' },
]

export const RATE_TEXT = {
  good: '感谢评价，已反馈给景区',
  bad: '已重新打开工单，工作人员会再次处理',
}
