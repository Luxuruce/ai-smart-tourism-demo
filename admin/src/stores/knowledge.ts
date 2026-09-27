import { defineStore } from 'pinia'
import { DEMO_DATE, type KnowledgeEntry, type PendingQuestion } from '@qs/shared'
import { isKeyReview, publishedBase } from '@/services/knowledge'

/**
 * 知识库：待补问题、知识条目。驾驶舱「知识库待补 N 条」和「游客在问什么」的标签读这里。
 * 不与游客端联动，待补问题固定从 3 条开始（交接文档 14.5）。
 */
export const useKnowledgeStore = defineStore('knowledge', {
  state: () => ({
    pending: [] as PendingQuestion[],
    entries: [] as KnowledgeEntry[],
    /** 初始就已发布的条目，用来算「已发布」的变化量 */
    initialPublished: [] as string[],
    loaded: false,
  }),
  getters: {
    /** 已发布 = 固定底数 + 演示中新通过的条目（清单 12.3） */
    publishedCount: (s) => publishedBase + s.entries.filter((e) => e.status === 'published' && !s.initialPublished.includes(e.id)).length,
    reviewingCount: (s) => s.entries.filter((e) => e.status === 'pending').length,
    /** 「游客在问什么」里某个待补问题的状态：待补 / 已补录待审核 / 已通过 */
    pendingState: (s) => (id: string): 'gap' | 'submitted' | 'done' => {
      if (s.pending.some((p) => p.id === id)) return 'gap'
      const entry = s.entries.find((e) => e.fromPending === id)
      return entry?.status === 'published' ? 'done' : 'submitted'
    },
  },
  actions: {
    init(pending: PendingQuestion[], entries: KnowledgeEntry[]) {
      if (this.loaded) return
      this.pending = pending
      this.entries = entries
      this.initialPublished = entries.filter((e) => e.status === 'published').map((e) => e.id)
      this.loaded = true
    },
    /** 补录：待补问题移除，知识条目新增一条「待审核」 */
    submit(pendingId: string, answer: string, source: string) {
      const q = this.pending.find((p) => p.id === pendingId)
      if (!q) return
      this.pending = this.pending.filter((p) => p.id !== pendingId)
      this.entries.unshift({
        id: `new-${pendingId}`, title: q.text, spot: q.spot, source, status: 'pending',
        keyReview: isKeyReview(answer), answer, fromPending: pendingId,
      })
    },
    approve(id: string, edited?: { title: string; answer: string }) {
      const e = this.entries.find((x) => x.id === id)
      if (!e) return
      if (edited) {
        e.title = edited.title
        e.answer = edited.answer
        e.note = '修改后通过'
      }
      e.status = 'published'
      e.reviewer = '[审核人 A]'
      e.date = DEMO_DATE
    },
    reject(id: string) {
      const e = this.entries.find((x) => x.id === id)
      if (!e) return
      e.status = 'rejected'
      e.reviewer = '[审核人 A]'
      e.date = DEMO_DATE
    },
  },
})
