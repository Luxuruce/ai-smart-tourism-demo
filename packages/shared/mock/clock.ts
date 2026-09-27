// 演示时钟：所有「现在」相关的文案都基于固定时间，不读系统时间。

export const DEMO_NOW = '14:18'
export const CLOSING_TIME = '17:30'

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** 距闭园还剩多少分钟；offsetMin 为在 DEMO_NOW 基础上再过去的分钟数 */
export function minutesToClose(offsetMin = 0): number {
  return toMinutes(CLOSING_TIME) - toMinutes(DEMO_NOW) - offsetMin
}

/** 「3 小时」——首页信息块用，只取整小时 */
export function hoursLeftText(offsetMin = 0): string {
  return `${Math.floor(minutesToClose(offsetMin) / 60)} 小时`
}

/** 「2 小时 54 分」 */
export function timeLeftText(offsetMin = 0): string {
  const left = minutesToClose(offsetMin)
  const h = Math.floor(left / 60)
  const m = left % 60
  return m === 0 ? `${h} 小时` : `${h} 小时 ${m} 分`
}
