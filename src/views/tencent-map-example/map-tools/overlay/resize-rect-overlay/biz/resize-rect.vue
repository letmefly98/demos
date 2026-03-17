<script setup lang="ts">
import type { Corner, Delta } from '../../../types/delta'
import { computed, shallowRef } from 'vue'
import { computeDragDelta } from '../../../utils/format-delta'

interface Props {
  /** 容器像素宽度（px） */
  width: number
  /** 容器像素高度（px） */
  height: number
  /** 矩形填充颜色 */
  color?: string
  /** 边框宽度 */
  border?: number
  /** 边框颜色 */
  borderColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'rgba(41, 91, 255, 0.15)',
  border: 2,
  borderColor: '#295BFF',
})

const emit = defineEmits<{
  /** 拖拽结束时透出四条边各自的像素增量 */
  (e: 'resize', delta: Delta): void
}>()

defineSlots<{
  /** 左上角标签内容 */
  'top-left': () => any
  /** 右上角标签内容 */
  'top-right': () => any
  /** 左下角标签内容 */
  'bottom-left': () => any
  /** 右下角标签内容 */
  'bottom-right': () => any
}>()

/** 当前是否正在拖拽 */
const isDragging = shallowRef(false)

/** 拖拽过程中四条边各自的像素偏移量 */
const dragDelta = shallowRef<Delta>({ left: 0, top: 0, right: 0, bottom: 0 })

/** 矩形显示样式 —— 拖拽时实时反映变化 */
const rectStyle = computed(() => {
  if (props.width <= 0 || props.height <= 0) {
    return { display: 'none' }
  }
  const d = isDragging.value ? dragDelta.value : { left: 0, top: 0, right: 0, bottom: 0 }
  const w = props.width - d.left + d.right
  const h = props.height - d.top + d.bottom
  return {
    width: `${Math.max(0, w)}px`,
    height: `${Math.max(0, h)}px`,
    backgroundColor: props.color,
    border: `${props.border}px solid ${props.borderColor}`,
    boxSizing: 'border-box' as const,
    transform: `translate(${d.left}px, ${d.top}px)`,
  }
})

/** 手柄 mousedown 处理 —— 内部完成拖拽计算，对角固定 */
function handleMouseDown(corner: Corner, e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
  isDragging.value = true
  dragDelta.value = { left: 0, top: 0, right: 0, bottom: 0 }

  const startX = e.clientX
  const startY = e.clientY

  const onMouseMove = (moveEvent: MouseEvent) => {
    const dx = moveEvent.clientX - startX
    const dy = moveEvent.clientY - startY
    dragDelta.value = computeDragDelta(corner, dx, dy)
  }

  const onMouseUp = () => {
    const finalDelta = { ...dragDelta.value }
    isDragging.value = false
    dragDelta.value = { left: 0, top: 0, right: 0, bottom: 0 }
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    emit('resize', finalDelta)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <!-- 矩形主体 -->
  <div class="resize-rect" :style="rectStyle">
    <!-- 左上角拖拽手柄 -->
    <div
      class="drag-handle drag-handle--top-left"
      @mousedown="(e) => handleMouseDown('topLeft', e)"
    />
    <div v-if="$slots['top-left']" class="drag-label drag-label--top-left">
      <slot name="top-left" />
    </div>
    <!-- 右上角拖拽手柄 -->
    <div
      class="drag-handle drag-handle--top-right"
      @mousedown="(e) => handleMouseDown('topRight', e)"
    />
    <div v-if="$slots['top-right']" class="drag-label drag-label--top-right">
      <slot name="top-right" />
    </div>
    <!-- 左下角拖拽手柄 -->
    <div
      class="drag-handle drag-handle--bottom-left"
      @mousedown="(e) => handleMouseDown('bottomLeft', e)"
    />
    <div v-if="$slots['bottom-left']" class="drag-label drag-label--bottom-left">
      <slot name="bottom-left" />
    </div>
    <!-- 右下角拖拽手柄 -->
    <div
      class="drag-handle drag-handle--bottom-right"
      @mousedown="(e) => handleMouseDown('bottomRight', e)"
    />
    <div v-if="$slots['bottom-right']" class="drag-label drag-label--bottom-right">
      <slot name="bottom-right" />
    </div>
  </div>
</template>

<style scoped>
.resize-rect {
  position: relative;
  pointer-events: auto;
}

.drag-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #fff;
  border: 2px solid #295BFF;
  border-radius: 50%;
  pointer-events: auto;
  transform: translate(-50%, -50%);
}

.drag-handle--top-left {
  top: 0;
  left: 0;
  cursor: nwse-resize;
}

.drag-handle--top-right {
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  cursor: nesw-resize;
}

.drag-handle--bottom-left {
  bottom: 0;
  left: 0;
  transform: translate(-50%, 50%);
  cursor: nesw-resize;
}

.drag-handle--bottom-right {
  bottom: 0;
  right: 0;
  transform: translate(50%, 50%);
  cursor: nwse-resize;
}

/* 四角文字标签 —— 独立于 drag-handle */
.drag-label {
  position: absolute;
  font-size: 12px;
  line-height: 1;
  color: #295BFF;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

/* 左上角：文字在手柄左上方（矩形外侧） */
.drag-label--top-left {
  top: 0;
  left: 0;
  transform: translate(-100%, -100%) translate(-4px, -4px);
}

/* 右上角：文字在手柄右上方（矩形外侧） */
.drag-label--top-right {
  top: 0;
  right: 0;
  transform: translate(100%, -100%) translate(4px, -4px);
}

/* 左下角：文字在手柄左下方（矩形外侧） */
.drag-label--bottom-left {
  bottom: 0;
  left: 0;
  transform: translate(-100%, 100%) translate(-4px, 4px);
}

/* 右下角：文字在手柄右下方（矩形外侧） */
.drag-label--bottom-right {
  bottom: 0;
  right: 0;
  transform: translate(100%, 100%) translate(4px, 4px);
}
</style>
