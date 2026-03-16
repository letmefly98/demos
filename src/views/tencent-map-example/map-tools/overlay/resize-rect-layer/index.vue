<script setup lang="ts" name="ResizeRectOverlay">
import type { BaseOverlayInject } from '../base/types'
import type { ResizeRectGeometry } from './types'
import { shallowRef, useTemplateRef, watch } from 'vue'
import { getRectByPath, point2ll } from '../../utils'
import { getLatLngDeltaByDragDelta } from '../../utils/format-delta'
import ResizeRect from './biz/resize-rect.vue'

/** 每个 geometry 对应的屏幕像素位置信息 */
interface ScreenRect {
  width: number
  height: number
}

interface Props {
  renderFlag?: number
  context: BaseOverlayInject<ResizeRectGeometry>
}
const props = withDefaults(defineProps<Props>(), {})
const domRefs = useTemplateRef<HTMLDivElement[]>('geo')

/** 每个 geometry 对应的屏幕像素位置 & 宽高 */
const screenRectMap = shallowRef<Map<string, ScreenRect>>(new Map())

// 地图视窗触发变化
watch(() => props.renderFlag, () => requestAnimationFrame(updateDOM), { immediate: true })

/** 地图视窗变化时，更新 DOM 位置 */
function updateDOM() {
  if (!domRefs.value) return
  const domList = Array.isArray(domRefs.value) ? domRefs.value : [domRefs.value]
  const list = props.context.geometries || []
  const { map } = props.context
  const newMap = new Map<string, ScreenRect>()

  list.forEach((geo, i) => {
    if (!geo.id) return

    const dom = domList[i]
    if (!dom) return

    const { lb, rt } = getRectByPath(geo.paths)

    // 经纬度 → 屏幕像素坐标
    const { x: left, y: bottom } = map.projectToContainer(point2ll(lb))
    const { x: right, y: top } = map.projectToContainer(point2ll(rt))
    const width = right - left
    const height = bottom - top

    // 定位容器 div
    dom.style.transform = `translate(${left}px, ${top}px)`

    // 保存屏幕像素位置传给子组件
    newMap.set(geo.id, { width, height })
  })

  screenRectMap.value = newMap
}

/**
 * 子组件拖拽完成后回调
 * 将四条边各自的像素增量转换为经纬度变化，计算出新的 geo.paths
 */
function handleResize(
  geo: ResizeRectGeometry,
  dragDelta: { left: number, top: number, right: number, bottom: number },
) {
  const { map } = props.context
  const { lb, rt } = getRectByPath(geo.paths)

  const delta = getLatLngDeltaByDragDelta(map, dragDelta)

  const newLb = new TMap.LatLng(lb.lat + delta.bottom, lb.lng + delta.left)
  const newRt = new TMap.LatLng(rt.lat + delta.top, rt.lng + delta.right)

  // 更新 geo.paths 为新的经纬度
  geo.paths = [newLb, newRt]

  props.context.emit('resize', geo)
}
</script>

<template>
  <template v-for="geo in props.context.geometries" :key="geo.id">
    <div ref="geo" class="resize-rect-geometry">
      <ResizeRect
        :width="screenRectMap.get(geo.id)?.width ?? 0"
        :height="screenRectMap.get(geo.id)?.height ?? 0"
        :color="geo.color"
        :border="geo.border"
        :border-color="geo.borderColor"
        @resize="(delta: any) => handleResize(geo, delta)"
      >
        <template #bottom-left>
          <input />
        </template>
        <template #top-right>
          <input />
        </template>
      </ResizeRect>
    </div>
  </template>
</template>

<style scoped>
.resize-rect-geometry {
  position: absolute;
  top: 0;
  left: 0;

  input {
    pointer-events: auto;
  }
}
</style>
