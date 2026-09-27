import { defineStore } from 'pinia'
import { DEMO_NOW, type DispatchDraft, type Ticket } from '@qs/shared'
import { baseCounts, groupOf } from '@/services/tickets'

/**
 * 工单列表放在 store 里：驾驶舱派单生成的新工单、详情抽屉里的状态变化，工单中心都能看到。
 * 页头统计 = 固定底数 + 列表相对初始状态的变化（清单 9.1.2）。
 */
export const useTicketStore = defineStore('tickets', {
  state: () => ({
    list: [] as Ticket[],
    /** 初始列表里每张工单的统计分组，用来算变化量 */
    initialGroups: {} as Record<string, 'pending' | 'processing' | 'resolved'>,
    loaded: false,
  }),
  getters: {
    counts(s) {
      const c = { ...baseCounts }
      for (const t of s.list) {
        const now = groupOf(t.status)
        const was = s.initialGroups[t.id]
        if (was === now) continue
        if (was) c[was] -= 1
        c[now] += 1
      }
      return c
    },
  },
  actions: {
    init(list: Ticket[]) {
      if (this.loaded) return
      this.list = list
      this.initialGroups = Object.fromEntries(list.map((t) => [t.id, groupOf(t.status)]))
      this.loaded = true
    },
    find(id: string) {
      return this.list.find((t) => t.id === id)
    },
    /** 受理：待受理或已超时 → 处理中（已超时的时间线保留「超时升级」记录） */
    accept(id: string) {
      const t = this.find(id)
      if (!t) return
      t.status = 'processing'
      t.statusText = '处理中 · 已受理'
      t.history.push({ label: '受理', time: DEMO_NOW, note: `由${t.owner}受理` }, { label: '处理中', time: DEMO_NOW })
    },
    transfer(id: string, owner: string) {
      const t = this.find(id)
      if (!t || t.owner === owner) return
      t.history.push({ label: '转派', time: DEMO_NOW, note: `${t.owner} → ${owner}` })
      t.owner = owner
    },
    resolve(id: string, result: string) {
      const t = this.find(id)
      if (!t) return
      t.status = 'resolved'
      t.statusText = '已解决 · 待关闭'
      t.history.push({ label: '已解决', time: DEMO_NOW, note: result })
    },
    close(id: string) {
      const t = this.find(id)
      if (!t) return
      t.status = 'closed'
      t.statusText = '已关闭'
      t.history.push({ label: '已关闭', time: DEMO_NOW })
    },
    /** 驾驶舱派单生成的新工单，插到最前面 */
    addDispatched(d: DispatchDraft): Ticket {
      const t: Ticket = {
        id: d.ticketId, text: d.desc, aiType: d.aiType, area: d.area, owner: d.owner,
        status: 'pending', statusText: '待受理', elapsed: '刚刚',
        history: [{ label: '提交', time: DEMO_NOW, note: '由运营驾驶舱派单' }],
      }
      this.list.unshift(t)
      return t
    },
  },
})
