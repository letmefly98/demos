import type { TextDrawItem } from '../types/layer'
import { createClickEvent } from '../events/click'
import { createHoverEvent } from '../events/hover'

interface Props {
  zIndex?: number
  config?: ({ key: string, hoverColor?: string } & TMap.LabelStyleOptions)[]
  onTextHover?: (geo: TextDrawItem | undefined, p: TMap.LatLng) => void
  onTextClick?: (geo: TextDrawItem, p: TMap.LatLng) => void
  onTextDoubleClick?: (geo: TextDrawItem, p: TMap.LatLng) => void
}
export function createTextLayer(mapIns: TMap.Map, props?: Props) {
  const styles = (props?.config || []).reduce((re, cf) => {
    const styleId = `${cf.key}`
    const hoverStyleId = `${cf.key}_hover`
    const selectedStyleId = `${cf.key}_selected`
    const normalStyle = new TMap.LabelStyle({
      ...cf,
    })
    const hoverStyle = new TMap.LabelStyle({
      ...cf,
      color: cf.hoverColor,
    })
    const selectedStyle = new TMap.LabelStyle({
      ...cf,
      color: cf.hoverColor,
    })
    return {
      ...re,
      [styleId]: normalStyle,
      [hoverStyleId]: hoverStyle,
      [selectedStyleId]: selectedStyle,
    }
  }, {} as TMap.MultiLabelStyleHash)

  const textLayer = new TMap.MultiLabel({
    map: mapIns,
    geometries: [],
    styles,
    zIndex: props?.zIndex,
  })

  const textHoverEvent = createHoverEvent({ layer: textLayer, onChange: props?.onTextHover })
  const textClickEvent = createClickEvent({
    layer: textLayer,
    onClick: props?.onTextClick,
    onDoubleClick: props?.onTextDoubleClick,
  })

  if (props?.onTextHover) {
    textLayer.on('hover', e => textHoverEvent.handlerHover(e))
  }
  if (props?.onTextClick || props?.onTextDoubleClick) {
    textLayer.on('click', e => textClickEvent.handleClick(e))
  }

  function restoreEvent() {
    textHoverEvent.clear()
    textClickEvent.clear()
  }

  function redraw(geometries: TextDrawItem[]) {
    textHoverEvent.clear()
    textClickEvent.clear()
    textLayer.setGeometries([])
    if (geometries.length) textLayer.setGeometries(geometries)
  }

  function destroy() {
    restoreEvent()
    textLayer.destroy()
  }

  function setEnable(enable = true) {
    (textLayer as any).setInteractiveDisable(!enable)
    // markerClickEvent.setEnable(enable);
    // markerHoverEvent.setEnable(enable);
  }

  return {
    layer: textLayer,
    destroy,
    redraw,
    restoreEvent,
    setEnable,
  }
}
