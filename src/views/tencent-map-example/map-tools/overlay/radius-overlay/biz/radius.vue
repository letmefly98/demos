<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 各扇区的数据 */
  data: number[]
  /** 内圆半径（空心部分） */
  minRadius?: number
  /** 外圆半径 */
  maxRadius?: number
}
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  minRadius: 0,
  maxRadius: 50,
})
const emit = defineEmits<{
  (e: 'click', ...args: any[]): void
}>()

/** 颜色列表 */
const colorList = ['#7AF4FF', '#67D7FF', '#52B5FF', '#295BFF']

/** 数据总和 */
const sum = computed(() => props.data.reduce((prev, curr) => prev + curr, 0))

/** SVG viewBox 属性 */
const viewBox = computed(() => {
  const r = props.maxRadius
  return [-r, -r, r * 2, r * 2].join(' ')
})

/** 计算各扇形的 SVG path 数据 */
const sectors = computed(() => {
  const total = sum.value
  // 当数据总和为 0 时返回空，避免除零产生 NaN
  if (total === 0) return []

  let angle = 0
  return props.data.map((d, i) => {
    const delta = (d / total) * Math.PI * 2
    const r = props.maxRadius
    const startAngle = angle
    const endAngle = angle + delta
    angle += delta

    const path = [
      'M0 0',
      `L${r * Math.sin(startAngle)} ${-r * Math.cos(startAngle)}`,
      `A${r} ${r} 0 ${delta > Math.PI ? 1 : 0} 1 ${r * Math.sin(endAngle)} ${-r * Math.cos(endAngle)}`,
    ].join(' ')

    return {
      path: `${path} z`,
      color: colorList[i % colorList.length],
    }
  })
})
</script>

<template>
  <svg
    version="1.1"
    baseProfile="full"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="viewBox"
    :width="maxRadius * 2"
    :height="maxRadius * 2"
    @click="(e: MouseEvent) => emit('click', e)"
  >
    <g>
      <!-- 各扇形区域 -->
      <path
        v-for="(sector, index) in sectors"
        :key="index"
        :d="sector.path"
        :style="{ fill: sector.color }"
      />
      <!-- 中心空心圆 -->
      <circle
        style="fill: #FFFFFF"
        cx="0"
        cy="0"
        :r="minRadius"
      />
      <!-- 中心文字 -->
      <text x="0" y="0.3em" text-anchor="middle">
        {{ sum }}
      </text>
    </g>
  </svg>
</template>
