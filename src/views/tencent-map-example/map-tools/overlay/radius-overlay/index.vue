<script setup lang="ts" name="RadiusOverlay">
import type { BaseOverlayContext } from '../base/types'
import type { RadiusGeometry } from './types'
import { nextTick, useTemplateRef, watch } from 'vue'
import Radius from './biz/radius.vue'

interface Props {
  renderFlag?: number
  context: BaseOverlayContext<RadiusGeometry>
}
const props = withDefaults(defineProps<Props>(), {})
const domRefs = useTemplateRef<HTMLDivElement[]>('geo')

// 地图视窗触发变化
watch(() => props.renderFlag, () => nextTick(updateDOM))

// 地图视窗变化时，更新 DOM 位置
function updateDOM() {
  if (!domRefs.value) return
  const domList = Array.isArray(domRefs.value) ? domRefs.value : [domRefs.value]
  const list = props.context.geometries || []
  const { map } = props.context

  list.forEach((geo, i) => {
    const dom = domList[i]
    if (!dom) return
    const pixel = map.projectToContainer(geo.position)
    const left = pixel.getX() - dom.clientWidth / 2
    const top = pixel.getY() - dom.clientHeight / 2
    dom.style.transform = `translate(${left}px, ${top}px)`
  })
}

// 事件 - 点击单个圆盘
function handleClick(geo: RadiusGeometry, e: MouseEvent) {
  props.context.emit('click', geo, e)
}
</script>

<template>
  <template v-for="geo in props.context.geometries" :key="geo.id">
    <div ref="geo" :style="{ position: 'absolute', top: '0px', left: '0px' }">
      <Radius
        :data="geo.data"
        :min-radius="geo.minRadius"
        :max-radius="geo.maxRadius"
        @click="(e: MouseEvent) => handleClick(geo, e)"
      />
    </div>
  </template>
</template>
