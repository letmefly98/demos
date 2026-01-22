import type { AreaDrawItem } from '../types/layer'
import { createClickEvent } from '../events/click'
import { createHoverEvent } from '../events/hover'

interface Props {
  zIndex?: number
  config?: { key: string, color: string, borderColor: string, hoverColor: string }[]
  onAreaHover?: (geo: AreaDrawItem | undefined, p: TMap.LatLng) => void
  onAreaClick?: (geo: AreaDrawItem | undefined, p: TMap.LatLng) => void
  onAreaDoubleClick?: (geo: AreaDrawItem | undefined, p: TMap.LatLng) => void
}

export function createAreaLayer(mapIns: TMap.Map, props?: Props) {
  const styles = (props?.config || []).reduce((re, cf) => {
    const styleId = `${cf.key}`
    const hoverStyleId = `${cf.key}_hover`
    const selectedStyleId = `${cf.key}_selected`
    const normalStyle = new TMap.PolygonStyle({
      color: cf.color,
      showBorder: true,
      borderColor: cf.borderColor,
    })
    const hoverStyle = new TMap.PolygonStyle({
      color: cf.hoverColor,
      showBorder: true,
      borderColor: cf.borderColor,
    })
    return {
      ...re,
      [styleId]: normalStyle,
      [hoverStyleId]: hoverStyle,
      [selectedStyleId]: hoverStyle,
    }
  }, {} as TMap.MultiPolygonStyleHash)

  const areaLayer = new TMap.MultiPolygon({
    map: mapIns,
    geometries: [],
    styles,
    zIndex: props?.zIndex,
  })

  const areaHoverEvent = createHoverEvent({ layer: areaLayer, onChange: props?.onAreaHover })
  const areaClickEvent = createClickEvent({
    layer: areaLayer,
    onClick: props?.onAreaClick,
    onDoubleClick: props?.onAreaDoubleClick,
  })

  if (props?.onAreaHover) {
    areaLayer.on('hover', e => areaHoverEvent.handlerHover(e))
  }
  if (props?.onAreaClick || props?.onAreaDoubleClick) {
    areaLayer.on('click', e => areaClickEvent.handleClick(e))
  }

  function restoreEvent() {
    areaHoverEvent.clear()
    areaClickEvent.clear()
  }

  function selected(ids: string[]) {
    const geometries = areaLayer.getGeometries().slice(0)
    geometries.forEach((e) => {
      const isSelected = e.id ? ids.includes(e.id) : false
      const originStyleId = e.properties?.styleId || ''
      e.styleId = isSelected ? `${originStyleId}_selected` : originStyleId
    })
    areaLayer.updateGeometries(geometries)
  }

  function redraw(geometries: AreaDrawItem[]) {
    areaHoverEvent.clear()
    areaClickEvent.clear()
    areaLayer.setGeometries([])
    if (geometries.length) areaLayer.setGeometries(geometries)
  }

  function destroy() {
    restoreEvent()
    areaLayer.destroy()
  }

  function setEnable(enable = true) {
    (areaLayer as any).setInteractiveDisable(!enable)
    // areaClickEvent.setEnable(enable);
    // areaHoverEvent.setEnable(enable);
  }

  return {
    layer: areaLayer,
    destroy,
    redraw,
    restoreEvent,
    selected,
    setEnable,
  }
}
