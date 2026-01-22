import type { Point } from '../types/base'
import { point2ll } from './format-point'
import { getDistanceDot2Dot } from './get-distance'

// 获取地图级数
export function getMapLevel(mapIns: TMap.Map): number {
  const zoom = Math.round(mapIns.getZoom() || 13)
  return zoom
}

// 极值地图 Tile 级数，超过时将无法计算 TileId
const minTileLevel = 7
const maxTileLevel = 15

// 获取地图 Tile 级数
export function getTileLevel(mapIns: TMap.Map): number {
  const zoom = getMapLevel(mapIns)
  const tileLevel = Math.max(minTileLevel, Math.min(maxTileLevel, zoom))
  return tileLevel
}

// 视图居中到指定位置
export function fitBounds(mapIns: TMap.Map, points: Point[], options?: TMap.FitBoundsOptions) {
  const opts = options || { padding: 50 }
  if (!points.length) return

  const screenRect = mapIns.getBounds()
  const bounds = new TMap.LatLngBounds()
  points.forEach(d => bounds.extend(point2ll(d)))

  // 内容相比视窗太小，则缩放居中
  const isTooSmall = getDistanceDot2Dot(screenRect.getSouthWest(), bounds.getSouthWest()) > 10000
  if (isTooSmall) {
    mapIns.fitBounds(bounds, opts)
  } else {
    mapIns.setCenter(bounds.getCenter())
  }
}
