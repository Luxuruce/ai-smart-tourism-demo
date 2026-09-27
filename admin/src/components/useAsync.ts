import { ref, shallowRef, type Ref } from 'vue'

export type AsyncStatus = 'loading' | 'ready' | 'empty' | 'error'

/** 包一层假接口调用，给页面统一的加载中 / 空 / 异常状态 */
export function useAsync<T>(loader: () => Promise<T>, isEmpty: (v: T) => boolean = (v) => Array.isArray(v) && v.length === 0) {
  const data = shallowRef<T | null>(null) as Ref<T | null>
  const status = ref<AsyncStatus>('loading')
  const error = ref('')
  async function load() {
    status.value = 'loading'
    try {
      data.value = await loader()
      status.value = isEmpty(data.value) ? 'empty' : 'ready'
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      status.value = 'error'
    }
  }
  load()
  return { data, status, error, reload: load }
}
