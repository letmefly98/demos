// 获取随机数
export function random(n1: number, n2 = 0) {
  const min = Math.min(n1, n2)
  const max = Math.max(n1, n2)
  return min + Math.random() * (max - min)
}

// 获取随机颜色
export function randomColor() {
  // return `#${Math.random().toString(16).slice(2, 8)}`
  return `hsla(${Math.floor(Math.random() * 360)}, 50%, 90%, 1)`
}

// 补零
export function addZero(num: number | string, len = 2) {
  let numLen = `${num}`.length
  while (numLen++ < len) num = `0${num}`
  return `${num}`
}

// 获取鼠标或手势位置
export function getTouchPosition(e: MouseEvent | TouchEvent) {
  if (e instanceof MouseEvent) {
    const { clientX: x, clientY: y } = e
    return [{ x, y }]
  } else {
    const touches = Array.from(e.touches)
    const res = [] as { x: number, y: number }[]
    return touches.reduce((re, { clientX: x, clientY: y }) => [...re, { x, y }], res)
  }
}

// 传入 svg 源码字符串，转成 base64
// getBase64BySvg('<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="red" /></svg>')
export function getBase64BySvg(svgStr: string) {
  if (!svgStr.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgStr = svgStr.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
  }
  return `data:image/svg+xml;charset=utf-8;base64,${window.btoa(svgStr)}`
}
