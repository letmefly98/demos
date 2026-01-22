import type { PointLike } from '../types/base'
import type { MarkerDrawItem } from '../types/layer'
import { createClickEvent } from '../events/click'
import { createHoverEvent } from '../events/hover'
import { getPosition } from '../utils/format-point'

const BaseStyle = {
  width: 12,
  height: 12,
  anchor: { x: 6, y: 6 },
  enableRelativeScale: true,
  relativeScaleOptions: {
    scaleZoom: 16,
    minScale: 0.5,
    maxScale: 0.8,
  },
}

interface Props {
  zIndex?: number
  config?: { key: string, icon: (status: 'normal' | 'hover' | 'selected') => string }[]
  onMarkerHover?: (geo: MarkerDrawItem | undefined, p: TMap.LatLng) => void
  onMarkerClick?: (geo: MarkerDrawItem, p: TMap.LatLng) => void
  onMarkerDoubleClick?: (geo: MarkerDrawItem, p: TMap.LatLng) => void
}
export function createMarkerLayer(mapIns: TMap.Map, props?: Props) {
  const styles = (props?.config || []).reduce((re, cf) => {
    const styleId = `${cf.key}`
    const hoverStyleId = `${cf.key}_hover`
    const selectedStyleId = `${cf.key}_selected`
    const normalStyle = new TMap.MarkerStyle({
      ...BaseStyle,
      src: cf.icon('normal'),
    })
    const hoverStyle = new TMap.MarkerStyle({
      ...BaseStyle,
      src: cf.icon('hover'),
    })
    const selectedStyle = new TMap.MarkerStyle({
      ...BaseStyle,
      src: cf.icon('selected'),
    })
    return {
      ...re,
      [styleId]: normalStyle,
      [hoverStyleId]: hoverStyle,
      [selectedStyleId]: selectedStyle,
    }
  }, {} as TMap.MultiMarkerStyleHash)

  styles['起点'] = new TMap.MarkerStyle({
    ...BaseStyle,
    width: 25,
    height: 35,
    anchor: { x: 12.5, y: 34 },
    src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/start.png',
  })
  styles['终点'] = new TMap.MarkerStyle({
    ...BaseStyle,
    width: 25,
    height: 35,
    anchor: { x: 12.5, y: 34 },
    src: 'https://mapapi.qq.com/web/lbs/javascriptGL/demo/img/end.png',
  })

  const markerLayer = new TMap.MultiMarker({
    map: mapIns,
    geometries: [],
    styles,
    zIndex: props?.zIndex,
  })

  const markerHoverEvent = createHoverEvent({ layer: markerLayer, onChange: props?.onMarkerHover })
  const markerClickEvent = createClickEvent({
    layer: markerLayer,
    onClick: props?.onMarkerClick,
    onDoubleClick: props?.onMarkerDoubleClick,
  })

  if (props?.onMarkerHover) {
    markerLayer.on('hover', e => markerHoverEvent.handlerHover(e))
  }
  if (props?.onMarkerClick || props?.onMarkerDoubleClick) {
    markerLayer.on('click', e => markerClickEvent.handleClick(e))
  }

  function restoreEvent() {
    markerHoverEvent.clear()
    markerClickEvent.clear()
  }

  function selected(ids: string[]) {
    const geometries = markerLayer.getGeometries().slice(0)
    geometries.forEach((e) => {
      const isSelected = e.id ? ids.includes(e.id) : false
      const originStyleId = e.properties?.styleId || ''
      e.styleId = isSelected ? `${originStyleId}_selected` : originStyleId
    })
    markerLayer.updateGeometries(geometries)
  }

  function redraw(geometries: MarkerDrawItem[]) {
    markerHoverEvent.clear()
    markerClickEvent.clear()
    markerLayer.setGeometries([])
    if (geometries.length) markerLayer.setGeometries(geometries)
  }

  function destroy() {
    restoreEvent()
    markerLayer.destroy()
  }

  function mark(p?: PointLike, setCenter = true) {
    markerLayer.remove(['扎点'])
    if (!p) return // 传空删除扎点
    const position = getPosition(p)
    if (!position) return // 坐标不合法
    const geo: MarkerDrawItem = {
      id: '扎点',
      styleId: 'mark',
      position,
      properties: { styleId: 'mark', data: undefined },
    }
    markerLayer.updateGeometries([geo])
    if (setCenter) mapIns.setCenter(position)
  }

  // 标注起点终点
  function markStartEnd(start?: PointLike, end?: PointLike) {
    if (start) {
      const position = getPosition(start)
      if (position) {
        const geo: MarkerDrawItem = {
          id: '起点',
          styleId: '起点',
          position,
          properties: { styleId: '起点', data: undefined },
        }
        markerLayer.updateGeometries([geo])
      }
    } else {
      markerLayer.remove(['起点'])
    }
    if (end) {
      const position = getPosition(end)
      if (position) {
        const geo: MarkerDrawItem = {
          id: '终点',
          styleId: '终点',
          position,
          properties: { styleId: '终点', data: undefined },
        }
        markerLayer.updateGeometries([geo])
      }
    } else {
      markerLayer.remove(['终点'])
    }
  }

  function setEnable(enable = true) {
    (markerLayer as any).setInteractiveDisable(!enable)
    // markerClickEvent.setEnable(enable);
    // markerHoverEvent.setEnable(enable);
  }

  return {
    layer: markerLayer,
    destroy,
    redraw,
    restoreEvent,
    selected,
    mark,
    markStartEnd,
    setEnable,
  }
}
