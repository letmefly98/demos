// 加载JS文件
export function loadScript(id: string, url: string) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve(undefined)
      return
    }

    const script = document.createElement('script')
    script.id = id
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}
