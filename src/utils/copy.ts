import copy from 'copy-to-clipboard'

// 复制文本
export function copyText(text?: string | number, message = '复制成功') {
  if (!text) return
  const success = copy(String(text))
  if (success) console.info(message)
}
