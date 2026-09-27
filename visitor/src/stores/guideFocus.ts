import { defineStore } from 'pinia'
import type { QaScenarioId } from '@qs/shared'

// switchTab 不能带参数：打开 AI 导游前把要显示的对话场景放在这里，AI 导游页 onShow 时取走
export const useGuideFocusStore = defineStore('guideFocus', {
  state: () => ({ pending: null as QaScenarioId | null }),
  actions: {
    request(id: QaScenarioId) {
      this.pending = id
    },
    take(): QaScenarioId | null {
      const id = this.pending
      this.pending = null
      return id
    },
  },
})
