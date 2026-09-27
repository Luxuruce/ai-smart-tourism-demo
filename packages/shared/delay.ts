// services 层用的假网络：统一 300ms 延迟，并可模拟空数据和异常。

export type MockMode = 'normal' | 'empty' | 'error'

let mode: MockMode = 'normal'

/** 演示用：切换所有 services 的返回模式 */
export function setMockMode(next: MockMode) {
  mode = next
}

export function getMockMode(): MockMode {
  return mode
}

export const MOCK_DELAY = 300

/**
 * 模拟一次接口调用。
 * - empty 模式下，列表数据返回空数组（emptyValue）
 * - error 模式下，reject 一个错误
 */
export function mockRequest<T>(data: T, emptyValue?: T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mode === 'error') reject(new Error('网络开小差了，请稍后重试（模拟异常）'))
      else if (mode === 'empty' && emptyValue !== undefined) resolve(emptyValue)
      else resolve(structuredCloneSafe(data))
    }, MOCK_DELAY)
  })
}

/** 返回数据的深拷贝，避免页面改到 mock 原件（小程序环境没有 structuredClone） */
function structuredCloneSafe<T>(data: T): T {
  return data === undefined ? data : JSON.parse(JSON.stringify(data))
}
