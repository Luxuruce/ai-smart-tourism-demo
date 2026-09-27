import { ref } from 'vue'

// 极简全局提示
export const toastText = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

export function toast(text: string, ms = 2400) {
  toastText.value = text
  clearTimeout(timer)
  timer = setTimeout(() => (toastText.value = ''), ms)
}
