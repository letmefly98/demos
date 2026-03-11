// 在 src/utils/index.ts 中添加
export function uuid(): string {
  // 现代浏览器支持 crypto.randomUUID()
  if (typeof window.crypto !== 'undefined' && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }

  // 降级方案：使用 crypto.getRandomValues()
  if (typeof window.crypto !== 'undefined' && window.crypto.getRandomValues) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = window.crypto.getRandomValues(new Uint8Array(1))[0] % 16
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // 最后降级方案：使用 Math.random()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
