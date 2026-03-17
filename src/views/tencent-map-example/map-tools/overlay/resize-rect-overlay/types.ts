import type { BaseGeometry } from '../base/types'

/** 可缩放矩形覆盖物数据模型 */
export interface ResizeRectGeometry extends BaseGeometry {
  /** 两个边角经纬度，顺序：左下、右上 */
  paths: TMap.LatLng[]
  /** 矩形填充颜色 */
  color?: string
  /** 边框宽度 */
  border?: number
  /** 边框颜色 */
  borderColor?: string
}
