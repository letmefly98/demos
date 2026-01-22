import type { ArrowDrawItem } from '../types/layer'

import { getBase64BySvg } from '@/utils'
import { getDistanceDot2Dot } from '../utils'

const BaseStyle = {
  width: 12,
  height: 12,
  anchor: { x: 6, y: 6 },
  enableRelativeScale: true,
  relativeScaleOptions: {
    scaleZoom: 20,
    minScale: 0.5,
    maxScale: 0.8,
  },
}

interface Props {
  zIndex?: number
  angleSliceSize?: number
  iconIntervalDistance?: number
  config?: { key: string, icon: (rotate: number, status: 'normal' | 'hover' | 'selected') => string }[]
}
export function createLinkArrowLayer(mapIns: TMap.Map, props?: Props) {
  const angleSliceSize = props?.angleSliceSize || 15
  const iconIntervalDistance = props?.iconIntervalDistance || 30

  const styles = (props?.config || []).reduce((re, cf) => {
    const angleCount = Math.floor(360 / angleSliceSize)
    const angles = Array.from({ length: angleCount + 1 }).fill(0).map((_, i) => i * angleSliceSize)
    angles.forEach((rotate) => {
      const styleId = `${cf.key}_${rotate}`
      const hoverStyleId = `${cf.key}_${rotate}_hover`
      const selectedStyleId = `${cf.key}_${rotate}_selected`
      const normalStyle = new TMap.MarkerStyle({
        ...BaseStyle,
        src: cf.icon(rotate, 'normal'),
      })
      const hoverStyle = new TMap.MarkerStyle({
        ...BaseStyle,
        src: cf.icon(rotate, 'hover'),
      })
      const selectedStyle = new TMap.MarkerStyle({
        ...BaseStyle,
        src: cf.icon(rotate, 'selected'),
      })
      re[styleId] = normalStyle
      re[hoverStyleId] = hoverStyle
      re[selectedStyleId] = selectedStyle
    })
    return re
  }, {} as TMap.MultiPolylineStyleHash)

  const linkArrowLayer = new TMap.MultiMarker({
    map: mapIns,
    collisionOptions: {
      sameSource: true,
    },
    geometries: [],
    styles,
    zIndex: props?.zIndex,
  });
  (linkArrowLayer as any).setInteractiveDisable(true) // 禁用事件，不遮挡线条的交互

  function redraw(geometries: ArrowDrawItem[]) {
    linkArrowLayer.setGeometries([])

    const arrows: TMap.PointGeometry[] = []
    geometries.forEach((geo) => {
      const paths = geo.paths
      if (paths.length < 2) return
      const key = geo.properties.styleId
      const iconPositions = generateIconPositions(paths, iconIntervalDistance)
      iconPositions.forEach(({ position, angle }) => {
        const rotate = Math.round(angle / angleSliceSize) * angleSliceSize
        const styleId = `${key}_${rotate}`
        arrows.push({ styleId, position })
      })
    })
    if (arrows.length) linkArrowLayer.setGeometries(arrows)
  }

  function destroy() {
    linkArrowLayer.destroy()
  }

  function setEnable(enable: boolean) {
    (linkArrowLayer as any).setInteractiveDisable(!enable)
  }

  return {
    layer: linkArrowLayer,
    redraw,
    destroy,
    setEnable,
  }
}

// 沿线条每隔指定距离生成点位和角度
function generateIconPositions(paths: TMap.LatLng[], interval = 30): { position: TMap.LatLng, angle: number }[] {
  if (paths.length < 2) return []

  const positions: { position: TMap.LatLng, angle: number }[] = []
  let accumulatedDistance = 0
  let nextIconDistance = interval / 2 // 从中间开始放置第一个图标

  for (let i = 0; i < paths.length - 1; i++) {
    const p1 = paths[i]
    const p2 = paths[i + 1]
    const segmentDistance = getDistanceDot2Dot(p1, p2)
    const segmentAngle = calculateAngle(p1, p2)

    while (accumulatedDistance + segmentDistance >= nextIconDistance) {
      const distanceInSegment = nextIconDistance - accumulatedDistance
      const ratio = distanceInSegment / segmentDistance
      const position = interpolatePoint(p1, p2, ratio)
      positions.push({ position, angle: segmentAngle })
      nextIconDistance += interval
    }

    accumulatedDistance += segmentDistance
  }

  return positions
}

// 在线段上按距离插值获取点
function interpolatePoint(p1: TMap.LatLng, p2: TMap.LatLng, ratio: number): TMap.LatLng {
  const TMap = window.TMap
  const lat = p1.lat + (p2.lat - p1.lat) * ratio
  const lng = p1.lng + (p2.lng - p1.lng) * ratio
  return new TMap.LatLng(lat, lng)
}

// 单向箭头图标，rotation=0为正东，角度增大沿顺时针旋转
export function createArrowIcon(): Required<Props>['config'][number]['icon'] {
  return (rotation, status) => {
    const color = '#333'
    const borderColor = status !== 'normal' ? '#f77e34' : '#fff'
    return getBase64BySvg(`<svg viewBox="0 0 24 24" style="transform: rotate(${rotation}deg)">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" fill="${color}" stroke-width="1" stroke="${borderColor}" />
    </svg>`)
  }
}

// 双向箭头图标，rotation=0为正东，角度增大沿顺时针旋转
export function createArrow2Icon(): Required<Props>['config'][number]['icon'] {
  return (rotation, status) => {
    const color = '#333'
    const borderColor = status !== 'normal' ? '#f77e34' : '#fff'
    return getBase64BySvg(`<svg viewBox="0 0 24 24" fill="${color}" style="transform: rotate(${rotation}deg)">
      <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" fill="${color}" stroke-width="1" stroke="${borderColor}" />
    </svg>`)
  }
}

// 问号图标，无需改变角度
export function createQuestionMarkIcon(): Required<Props>['config'][number]['icon'] {
  return (rotation, status) => {
    const color = '#333'
    const borderColor = status !== 'normal' ? '#f77e34' : '#fff'
    return getBase64BySvg(`<svg viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="${color}"  stroke-width="1" stroke="${borderColor}" />
  </svg>`)
  }
}

// 计算两点之间的角度（度），两点水平向东角度为0，两点垂直向南角度为90
function calculateAngle(p1: TMap.LatLng, p2: TMap.LatLng): number {
  const dx = p2.lng - p1.lng
  const dy = p2.lat - p1.lat
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) // 两点垂直向北为90
  angle = -angle // 调整为两点垂直向南为90
  if (angle < 0) angle += 360
  if (angle > 360) angle -= 360
  return angle
}
