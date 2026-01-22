import type { LineDrawItem } from '../types/layer'
import { createClickEvent } from '../events/click'
import { createHoverEvent } from '../events/hover'

interface Props {
  zIndex?: number
  config?: { key: string, color: string, hoverColor: string }[]
  onLinkHover?: (geo: LineDrawItem | undefined, p: TMap.LatLng) => void
  onLinkClick?: (geo: LineDrawItem, p: TMap.LatLng) => void
  onLinkDoubleClick?: (geo: LineDrawItem, p: TMap.LatLng) => void
}
export function createLinkLayer(mapIns: TMap.Map, props?: Props) {
  const styles = (props?.config || []).reduce((re, cf) => {
    const styleId = `${cf.key}`
    const hoverStyleId = `${cf.key}_hover`
    const selectedStyleId = `${cf.key}_selected`
    const normalStyle = new TMap.PolylineStyle({
      color: cf.color,
      width: 4,
      lineCap: 'round',
    })
    const hoverStyle = new TMap.PolylineStyle({
      color: cf.hoverColor,
      width: 4,
      lineCap: 'round',
      borderWidth: 1,
      borderColor: cf.hoverColor,
    })
    return {
      ...re,
      [styleId]: normalStyle,
      [hoverStyleId]: hoverStyle,
      [selectedStyleId]: hoverStyle,
    }
  }, {} as TMap.MultiPolylineStyleHash)

  const linkLayer = new TMap.MultiPolyline({
    map: mapIns,
    geometries: [],
    styles,
    zIndex: props?.zIndex,
  })

  const linkHoverEvent = createHoverEvent({ layer: linkLayer, onChange: props?.onLinkHover })
  const linkClickEvent = createClickEvent({
    layer: linkLayer,
    onClick: props?.onLinkClick,
    onDoubleClick: props?.onLinkDoubleClick,
  })

  if (props?.onLinkHover) {
    linkLayer.on('hover', e => linkHoverEvent.handlerHover(e))
  }
  if (props?.onLinkClick || props?.onLinkDoubleClick) {
    linkLayer.on('click', e => linkClickEvent.handleClick(e))
  }

  function restoreEvent() {
    linkHoverEvent.clear()
    linkClickEvent.clear()
  }

  function selected(ids: string[]) {
    const geometries = linkLayer.getGeometries().slice(0)
    geometries.forEach((e) => {
      const isSelected = e.id ? ids.includes(e.id) : false
      const originStyleId = e.properties?.styleId || ''
      e.styleId = isSelected ? `${originStyleId}_selected` : originStyleId
    })
    linkLayer.updateGeometries(geometries)
  }

  function redraw(geometries: LineDrawItem[]) {
    linkHoverEvent.clear()
    linkClickEvent.clear()
    if (geometries.length) linkLayer.setGeometries(geometries)
    else linkLayer.setGeometries([])
  }

  function destroy() {
    restoreEvent()
    linkLayer.destroy()
  }

  function setEnable(enable = true) {
    (linkLayer as any).setInteractiveDisable(!enable)
    // linkClickEvent.setEnable(enable);
    // linkHoverEvent.setEnable(enable);
  }

  return {
    layer: linkLayer,
    destroy,
    redraw,
    restoreEvent,
    selected,
    setEnable,
  }
}
