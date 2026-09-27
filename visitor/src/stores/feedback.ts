import { defineStore } from 'pinia'
import type { VisitorFeedback } from '@qs/shared'

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    list: [] as VisitorFeedback[],
    loaded: false,
  }),
  actions: {
    init(list: VisitorFeedback[]) {
      if (this.loaded) return
      this.list = list
      this.loaded = true
    },
    /** 提交后插到最前面 */
    add(item: VisitorFeedback) {
      this.list.unshift(item)
    },
    rate(id: string, rating: 'good' | 'bad') {
      const item = this.list.find((f) => f.id === id)
      if (item) item.rating = rating
    },
  },
})
