<script setup lang="ts" name="CommonMapToolDialog">
import { inject, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'

import { MapDialogInjectionKey } from './provide'

interface Props {
  title?: string
}
const props = withDefaults(defineProps<Props>(), {})

const ctx = inject(MapDialogInjectionKey)!
const draggableRef = useTemplateRef('draggableRef')
const wrapperRef = useTemplateRef('wrapperRef')
const arrowRef = shallowRef({} as HTMLElement)
const mapContainerRef = shallowRef({} as Element) // TODO: 限制拖拽时箭头与原位置相连
let isDragging = false
const offset = { x: 0, y: 0 }

onMounted(() => {
  if (draggableRef.value) draggableRef.value.addEventListener('mousedown', handleDragStart)
  window.addEventListener('mousemove', handleDragMove)
  window.addEventListener('mouseup', handleDragEnd)
  if (wrapperRef.value) {
    const arrowDom = getNextElementSibling(wrapperRef.value.parentNode?.parentNode as HTMLDivElement)
    if (arrowDom) arrowRef.value = arrowDom
    if (arrowDom) arrowDom.style.backgroundColor = 'var(--el-bg-color)'
    const mapContainerDom = wrapperRef.value.closest('.map-component')
    if (mapContainerDom) mapContainerRef.value = mapContainerDom
  }
})
onBeforeUnmount(() => {
  if (draggableRef.value) draggableRef.value.removeEventListener('mousedown', handleDragStart)
  window.removeEventListener('mousemove', handleDragMove)
  window.removeEventListener('mouseup', handleDragEnd)
})

function handleDragStart(e: MouseEvent) {
  if (!draggableRef.value || !wrapperRef.value) return
  e.stopPropagation()
  isDragging = true
  const rect = wrapperRef.value.getBoundingClientRect()
  const outerRect = mapContainerRef.value.getBoundingClientRect()
  const rectX = rect.left - outerRect.left + rect.width / 2
  const rectY = rect.top - outerRect.top + rect.height + 6
  offset.x = rectX - e.clientX
  offset.y = rectY - e.clientY
}
function handleDragMove(e: MouseEvent) {
  if (!draggableRef.value) return
  e.stopPropagation()
  if (!isDragging) return
  isDragging = true
  const p = new TMap.Point(e.clientX + offset.x, e.clientY + offset.y)
  const latLng = ctx.mapIns.unprojectFromContainer(p)
  ctx.dialogRef.setPosition(latLng)
}
function handleDragEnd(e: MouseEvent) {
  e.stopPropagation()
  isDragging = false
}

// 获取下一个兄弟元素，过滤掉文本节点
function getNextElementSibling(dom: HTMLElement) {
  if (!dom) return null
  let next = dom.nextSibling
  while (next) {
    if (next.nodeType === 1) {
      return next as HTMLElement
    }
    next = next.nextSibling
  }
  return null
}

function handlePrevent(e: MouseEvent) {
  e.stopPropagation()
}
</script>

<template>
  <div ref="wrapperRef" class="common-map-tool-dialog" @mousedown="handlePrevent">
    <div v-if="props.title" ref="draggableRef" class="title">
      {{ props.title }}
    </div>
    <slot name="default" />
  </div>
</template>

<style scoped>
.common-map-tool-dialog {
  margin: -25px -10px -12px;
  padding: 12px 10px 12px;
  background-color: var(--el-bg-color);
  text-align: left;
  font-size: 10px;
  line-height: 1.414;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.common-map-tool-dialog .title {
  position: relative;
  z-index: 0;
  font-size: 1.1em;
  font-weight: bold;
  cursor: move;
}
</style>
