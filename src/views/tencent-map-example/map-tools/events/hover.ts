import type { GeometryOf, LayerMap } from '../types/layer'

type HoverLayerMap = Exclude<LayerMap, TMap.Map>

interface Props<T extends HoverLayerMap, D = any> {
  layer: T
  onChange?: (
    geo: GeometryOf<T, D> | undefined,
    p: TMap.LatLng,
  ) => Promise<void | boolean | undefined> | void | boolean | undefined
}

export function createHoverEvent<T extends HoverLayerMap, D = any>(props: Props<T, D>) {
  const { layer, onChange } = props

  let hoverCacheId: string | undefined
  let disabled = false

  async function handlerHover(event: any) {
    if (disabled) return
    const e = event as { geometry?: GeometryOf<T, D>, latLng: TMap.LatLng }

    if (hoverCacheId && hoverCacheId !== e.geometry?.id) {
      const cache = layer.getGeometryById(hoverCacheId) as GeometryOf<T, D> | null
      const isSelected = cache?.styleId?.includes('_selected')
      if (cache && !isSelected) {
        const originStyleId = cache.properties?.styleId || '';
        (layer as any).updateGeometries([{ ...cache, styleId: originStyleId }])
        hoverCacheId = undefined
      }
    }

    if (!e.geometry?.styleId) {
      if (onChange) onChange(undefined, e.latLng)
    } else {
      const originStyleId = e.geometry.properties?.styleId || ''
      const newStyleId = `${originStyleId}_hover`
      if (originStyleId && e.geometry.styleId !== newStyleId) {
        const isSelected = e.geometry.styleId.includes('_selected')
        if (!isSelected) {
          const data = e.geometry
          if (onChange) {
            const go = await onChange(data, e.latLng)
            if (go === false) return
          }
          const geo = layer.getGeometryById(e.geometry.id) as GeometryOf<T, D> | null
          const isSelectedNow = geo?.styleId?.includes('_selected')
          if (isSelectedNow) return;
          (layer as any).updateGeometries([{ ...e.geometry, styleId: newStyleId }])
          hoverCacheId = e.geometry.id
        }
      }
    }
  }

  async function clear() {
    hoverCacheId = undefined
  }

  function setEnable(enable: boolean) {
    disabled = !enable
    clear()
  }

  return {
    handlerHover,
    clear,
    setEnable,
  }
}
