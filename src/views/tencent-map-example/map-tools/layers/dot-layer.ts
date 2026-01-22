import type { DotDrawItem } from '../types/layer'

import { getBase64BySvg } from '@/utils'
import { createClickEvent } from '../events/click'
import { createHoverEvent } from '../events/hover'

interface Props {
  zIndex?: number
  config?: { key: string, size?: number, color: string, hoverColor: string }[]
  onDotHover?: (geo: DotDrawItem | undefined, p: TMap.LatLng) => void
  onDotClick?: (geo: DotDrawItem, p: TMap.LatLng) => void
  onDotDoubleClick?: (geo: DotDrawItem, p: TMap.LatLng) => void
}
export function createDotLayer(mapIns: TMap.Map, props?: Props) {
  const styles = (props?.config || []).reduce((re, cf) => {
    const styleId = `${cf.key}`
    const hoverStyleId = `${cf.key}_hover`
    const selectedStyleId = `${cf.key}_selected`
    const color = cf.color ?? '#000000'
    const hoverColor = cf.hoverColor ?? '#FF0000'
    const size = cf.size ?? 12
    const BaseStyle = {
      width: size,
      height: size,
      anchor: { x: size / 2, y: size / 2 },
      enableRelativeScale: true,
      relativeScaleOptions: {
        scaleZoom: 16,
        minScale: 0.5,
        maxScale: 0.8,
      },
    }
    const normalStyle = new TMap.MarkerStyle({
      ...BaseStyle,
      src: getBase64BySvg(`<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="${color}" /></svg>`),
    })
    const hoverStyle = new TMap.MarkerStyle({
      ...BaseStyle,
      src: getBase64BySvg(`<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="${hoverColor}" /></svg>`),
    })
    return {
      ...re,
      [styleId]: normalStyle,
      [hoverStyleId]: hoverStyle,
      [selectedStyleId]: hoverStyle,
    }
  }, {} as TMap.MultiMarkerStyleHash)

  const dotLayer = new TMap.MultiMarker({
    map: mapIns,
    geometries: [],
    styles,
    zIndex: props?.zIndex,
  })

  const dotHoverEvent = createHoverEvent({ layer: dotLayer, onChange: props?.onDotHover })
  const dotClickEvent = createClickEvent({
    layer: dotLayer,
    onClick: props?.onDotClick,
    onDoubleClick: props?.onDotDoubleClick,
  })

  if (props?.onDotHover) {
    dotLayer.on('hover', e => dotHoverEvent.handlerHover(e))
  }
  if (props?.onDotClick || props?.onDotDoubleClick) {
    dotLayer.on('click', e => dotClickEvent.handleClick(e))
  }

  function restoreEvent() {
    dotHoverEvent.clear()
    dotClickEvent.clear()
  }

  function selected(ids: string[]) {
    const geometries = dotLayer.getGeometries().slice(0)
    geometries.forEach((e) => {
      const isSelected = e.id ? ids.includes(e.id) : false
      const originStyleId = e.properties?.styleId || ''
      e.styleId = isSelected ? `${originStyleId}_selected` : originStyleId
    })
    dotLayer.updateGeometries(geometries)
  }

  function redraw(geometries: DotDrawItem[]) {
    dotHoverEvent.clear()
    dotClickEvent.clear()
    dotLayer.setGeometries([])
    if (geometries.length) dotLayer.setGeometries(geometries)
  }

  function destroy() {
    restoreEvent()
    dotLayer.destroy()
  }

  function setEnable(enable = true) {
    (dotLayer as any).setInteractiveDisable(!enable)
    // dotClickEvent.setEnable(enable);
    // dotHoverEvent.setEnable(enable);
  }

  return {
    layer: dotLayer,
    destroy,
    redraw,
    restoreEvent,
    selected,
    setEnable,
  }
}
