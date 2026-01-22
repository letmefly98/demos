// 阻止事件冒泡，layer 上的事件在 map 阶段不触发
export function createPreventEvent() {
  let stopPropagation = false

  function preventDefault() {
    stopPropagation = true
  }

  function isPreventDefault() {
    const stop = stopPropagation
    stopPropagation = false
    return stop
  }

  return {
    preventDefault,
    isPreventDefault,
  }
}
