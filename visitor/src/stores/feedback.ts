import { defineStore } from 'pinia'
import type { VisitorFeedback } from '@qs/shared'
import { progressTextFor, progressTiming, rateText, reopenedNote } from '@/services/feedback'

/**
 * 「我的反馈」列表。提交后用计时器模拟后台处理（14.2 11.2.3）：
 * 15 秒「已受理」，30 秒「已解决」；提交成功页和「我的反馈」读同一份状态。
 * 计时器挂在 store 上，离开页面也会继续。
 */
export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    list: [] as VisitorFeedback[],
    loaded: false,
    /** 「还没解决」后重新打开的工单 id */
    reopened: [] as string[],
  }),
  actions: {
    init(list: VisitorFeedback[]) {
      if (this.loaded) return
      this.list = list
      this.loaded = true
    },
    find(id: string) {
      return this.list.find((f) => f.id === id)
    },
    /** 提交后插到最前面，并开始模拟处理 */
    add(item: VisitorFeedback) {
      this.list.unshift(item)
      const text = progressTextFor(item.category)
      setTimeout(() => {
        const f = this.find(item.id)
        if (f && f.status === 'pending') {
          f.status = 'processing'
          f.note = `已受理 · ${text.accepted}`
        }
      }, progressTiming.acceptedMs)
      setTimeout(() => {
        const f = this.find(item.id)
        if (f && f.status === 'processing' && !this.reopened.includes(f.id)) {
          f.status = 'resolved'
          f.note = `已解决 · ${text.resolved}`
        }
      }, progressTiming.resolvedMs)
    },
    /** 评价已解决的工单：「还没解决」回到处理中，不再自动解决（清单 12.2.8） */
    rate(id: string, rating: 'good' | 'bad') {
      const f = this.find(id)
      if (!f) return
      f.rating = rating
      if (rating === 'bad') {
        f.status = 'processing'
        f.note = reopenedNote
        this.reopened.push(id)
      }
    },
    /** 状态标签：待受理 / 已受理 / 处理中（重新打开后）/ 已解决 */
    statusLabel(f: VisitorFeedback): string {
      if (f.status === 'pending') return '待受理'
      if (f.status === 'resolved') return '已解决'
      return this.reopened.includes(f.id) ? '处理中' : '已受理'
    },
    rateResult(f: VisitorFeedback): string {
      return f.rating ? rateText[f.rating] : ''
    },
  },
})
