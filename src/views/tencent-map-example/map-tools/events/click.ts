import type { GeometryOf, LayerMap } from '../types/layer'

interface HandlerEvent<T extends LayerMap, D = any> {
  geometry?: GeometryOf<T, D>
  latLng: TMap.LatLng
}

interface Props<T extends LayerMap, D = any> {
  layer: T
  onClick?: (
    data: GeometryOf<T, D>,
    p: TMap.LatLng,
  ) => Promise<void | boolean | undefined> | void | boolean | undefined
  onDoubleClick?: (
    data: GeometryOf<T, D>,
    p: TMap.LatLng,
  ) => Promise<void | boolean | undefined> | void | boolean | undefined
}

export function createClickEvent<T extends LayerMap, D = any>(props: Props<T, D>) {
  const { layer, onClick, onDoubleClick } = props

  // 单击和双击容易混淆，靠延迟来统一时刻去决断
  let disabled = false
  let timer: NodeJS.Timeout | null = null
  const dblclickDuration = 220
  // let clickCache: { type: 'click' | 'dblclick'; event: HandlerEvent<T, D> } | null = null;
  const clickCache: HandlerEvent<T, D>[] = []

  // 外部需绑定的 click 事件
  function handleClick(e: HandlerEvent<T, D>) {
    if (!e) return
    if (disabled) return
    clickCache.push(e)
    if (clickCache.length === 1) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => handleClickFinish(), dblclickDuration)
    } else {
      handleClickFinish()
    }
  }

  // 在延迟后统一处理单双击
  function handleClickFinish() {
    const isClick = clickCache.length === 1
    const e = clickCache.pop()
    if (!e) return
    const position = e.latLng
    const data = (layer instanceof TMap.Map ? e : e.geometry) as GeometryOf<T, D>
    if (isClick && onClick) {
      onClick(data, position)
    } else if (onDoubleClick) {
      onDoubleClick(data, position)
    }
    clear()
    // if (!clickCache) return;
    // const { type: eventType, event: e } = clickCache;
    // const position = e.latLng;
    // const data = (layer instanceof TMap.Map ? e : e.geometry) as GeometryOf<T, D>;
    // if (eventType === 'click') {
    //   if (onClick) onClick(data, position);
    // } else if (eventType === 'dblclick') {
    //   if (onDoubleClick) onDoubleClick(data, position);
    // }
  }

  // 清理状态
  async function clear() {
    clearTimeout(timer!)
    timer = null
    clickCache.length = 0
  }

  function setEnable(enable: boolean) {
    disabled = !enable
    clear()
  }

  return {
    handleClick,
    clear,
    setEnable,
  }
}
