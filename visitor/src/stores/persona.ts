import { defineStore } from 'pinia'
import { DEFAULT_PERSONA, personas, type PersonaId } from '@qs/shared'

// 选中的身份在首页写入，「我的」和 AI 导游读取
export const usePersonaStore = defineStore('persona', {
  state: () => ({
    id: DEFAULT_PERSONA as PersonaId,
  }),
  getters: {
    label(s): string {
      return personas.find((p) => p.id === s.id)?.label ?? ''
    },
  },
  actions: {
    pick(id: PersonaId) {
      this.id = id
    },
  },
})
