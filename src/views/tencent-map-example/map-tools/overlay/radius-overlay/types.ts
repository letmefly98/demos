import type { BaseGeometry } from './../base/types'

// 单个数值圆盘数据模型
export interface RadiusGeometry extends BaseGeometry {
  data: number[]
  position: TMap.LatLng
  minRadius?: number
  maxRadius?: number
}
