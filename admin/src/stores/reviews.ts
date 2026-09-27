import { defineStore } from 'pinia'
import type { ReviewItem } from '@qs/shared'

// 评论明细：标签修正、回复记录在 store 里，切换页面后保留
export const useReviewStore = defineStore('reviews', {
  state: () => ({ list: [] as ReviewItem[], loaded: false }),
  actions: {
    init(list: ReviewItem[]) {
      if (this.loaded) return
      this.list = list
      this.loaded = true
    },
    find(id: string) {
      return this.list.find((r) => r.id === id)
    },
    /** 人工修正 AI 标签（PRD S4-3） */
    setTags(id: string, tags: string[]) {
      const r = this.find(id)
      if (!r) return
      r.tags = tags
      r.tagsEdited = true
    },
    setReply(id: string, reply: string) {
      const r = this.find(id)
      if (!r) return
      r.reply = reply
      r.replied = true
    },
  },
})
