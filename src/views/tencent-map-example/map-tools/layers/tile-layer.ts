import type { PointRect } from '../types/base'
import type { AreaDrawItem, TextDrawItem } from '../types/layer'
import { point2ll } from '../utils'
import { getTileData } from '../utils/get-tile-data'
import { createAreaLayer } from './area-layer'
import { createTextLayer } from './text-layer'

interface Props {
  zIndex?: number
  config?: { color?: string, borderColor?: string, hoverColor?: string }
  onTileHover?: (geo: AreaDrawItem | undefined, p: TMap.LatLng) => void
  onTileClick?: (geo: AreaDrawItem | undefined, p: TMap.LatLng) => void
  onTileDoubleClick?: (geo: AreaDrawItem | undefined, p: TMap.LatLng) => void
  // onTileIdHover?: (geo: TextDrawItem | undefined, p: TMap.LatLng) => void;
  // onTileIdClick?: (geo: TextDrawItem | undefined, p: TMap.LatLng) => void
  // onTileIdDoubleClick?: (geo: TextDrawItem | undefined, p: TMap.LatLng) => void
}
export function createTileLayer(mapIns: TMap.Map, props?: Props) {
  const color = props?.config?.color || 'rgba(255, 0, 0, 0.2)'
  const hoverColor = props?.config?.hoverColor || 'rgba(255, 0, 0, 0.05)'
  const areaLayerIns = createAreaLayer(mapIns, {
    config: [
      {
        key: 'tile',
        color: 'rgba(0, 0, 0, 0)',
        borderColor: color,
        hoverColor,
      },
    ],
    zIndex: props?.zIndex,
    onAreaHover: props?.onTileHover,
    onAreaClick: props?.onTileClick,
    onAreaDoubleClick: props?.onTileDoubleClick,
  })
  const textLayerIns = createTextLayer(mapIns, {
    config: [
      {
        key: 'tileId',
        color,
        size: 14, // 文字大小属性
        offset: { x: 6, y: 4 }, // 文字偏移属性单位为像素]
        angle: 0, // 文字旋转属性
        alignment: 'left', // 文字水平对齐属性
        verticalAlignment: 'top', //
      },
    ],
    zIndex: props?.zIndex,
  });
  (textLayerIns.layer as any).setInteractiveDisable(true) // 禁用文本上的事件

  function restoreEvent() {
    areaLayerIns.restoreEvent()
    textLayerIns.restoreEvent()
  }

  function selected(ids: string[]) {
    areaLayerIns.selected(ids)
  }

  function redraw(tileLevel: number, bounds: PointRect) {
    const tileData = getTileData(tileLevel, bounds)
    const geometries: AreaDrawItem[] = []
    const geometries2: TextDrawItem[] = []
    tileData.forEach(({ tileId, paths }) => {
      const areaGeo: AreaDrawItem = {
        id: `${tileId}`,
        styleId: 'tile',
        paths: paths.map(point2ll),
        properties: {
          styleId: 'tile',
          data: { tileId, tileLevel, paths },
        },
      }
      geometries.push(areaGeo)
      const textGeo: TextDrawItem = {
        id: `${tileId}`,
        styleId: 'tileId',
        position: point2ll(paths[0]),
        content: `${tileId}`,
        properties: {
          styleId: 'tileId',
          data: { tileId, tileLevel, paths },
        },
      }
      geometries2.push(textGeo)
    })
    areaLayerIns.redraw(geometries)
    textLayerIns.redraw(geometries2)
  }

  function destroy() {
    restoreEvent()
    areaLayerIns.destroy()
    textLayerIns.destroy()
  }

  function setEnable(enable = true) {
    areaLayerIns.setEnable(enable)
    textLayerIns.setEnable(enable)
  }

  function setVisible(visible = true) {
    areaLayerIns.layer.setVisible(visible)
    textLayerIns.layer.setVisible(visible)
  }

  return {
    destroy,
    redraw,
    restoreEvent,
    selected,
    setEnable,
    setVisible,
  }
}
