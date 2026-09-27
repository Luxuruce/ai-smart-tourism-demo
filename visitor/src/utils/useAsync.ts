import { ref, shallowRef, type Ref } from 'vue'

export type AsyncStatus = 'loading' | 'ready' | 'empty' | 'error'

/**
 * 包一层假接口调用，给页面统一的加载中 / 空 / 异常状态。
 * - isEmpty 判断「有返回但没内容」，默认按数组长度
 * - immediate=false 时不自动加载（等 onLoad 拿到页面参数后再调 reload）
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  { isEmpty = defaultEmpty as (v: T) => boolean, immediate = true } = {},
) {
  const data = shallowRef<T | null>(null) as Ref<T | null>
  const status = ref<AsyncStatus>('loading')
  const error = ref('')

  async function load() {
    status.value = 'loading'
    try {
      const v = await loader()
      data.value = v
      status.value = isEmpty(v) ? 'empty' : 'ready'
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      status.value = 'error'
    }
  }

  if (immediate) load()
  return { data, status, error, reload: load }
}

function defaultEmpty(v: unknown): boolean {
  return Array.isArray(v) ? v.length === 0 : v === null || v === undefined
}
