// 单个数值圆盘数据模型
export interface RadiusGeometry {
  id: string
  data: number[]
  position: TMap.LatLng
  minRadius?: number
  maxRadius?: number
}
