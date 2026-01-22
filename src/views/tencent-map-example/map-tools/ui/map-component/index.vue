<script setup lang="ts">
import { loadScript } from '@/utils/load'

import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Props {
  defaultLat?: number
  defaultLng?: number
  options?: TMap.MapOptions
}
const props = withDefaults(defineProps<Props>(), {
  defaultLat: 39.914012857692846,
  defaultLng: 116.39726472863117,
  options: () => ({
    pitchable: false,
    rotatable: false,
    zoom: 13,
    minZoom: 7,
    maxZoom: 20,
    doubleClickZoom: false,
  }),
})
const emit = defineEmits<{
  (e: 'loaded', map: TMap.Map): void
  (e: 'destroyed'): void
}>()
defineSlots<{
  default: () => any
}>()
defineExpose({
  setCursorStyle,
})

const cursorStyle = ref('default')

const randomId = ref('') // 用于热更新时重新实例化地图
let map: TMap.Map | null
const loading = ref(true)

onMounted(async () => {
  randomId.value = Date.now().toString()
  initial()
})

onBeforeUnmount(() => {
  if (!map) return
  map.destroy()
  map = null
  emit('destroyed')
})

// 初始化
async function initial() {
  try {
    loading.value = true
    await loadMapScript()
    const map = await initialMapInstance()
    if (!map) throw new Error('地图实例化失败')
    emit('loaded', map)
  } catch (err) {
    console.error((err as Error).message || '初始化地图失败')
  } finally {
    loading.value = false
  }
}

async function loadMapScript() {
  await Promise.all([
    loadScript(
      'gljs-tools',
      'https://map.qq.com/api/gljs?v=1.exp&key=SD5BZ-RFZHU-C6ZVE-2H3GT-3I2DQ-2VFCG&libraries=tools,geometry',
    ),
  ])
}

// 地图SDK加载完成后，实例化地图
function initialMapInstance() {
  const TMap = window.TMap
  const dom = document.querySelector(`#map-${randomId.value}`) as HTMLDivElement
  if (!dom) return undefined
  const center = new TMap.LatLng(props.defaultLat, props.defaultLng)
  map = new TMap.Map(dom, {
    center,
    ...props.options,
  })
  map.removeControl(TMap.constants.DEFAULT_CONTROL_ID.ZOOM)
  map.removeControl(TMap.constants.DEFAULT_CONTROL_ID.ROTATION)
  map.removeControl(TMap.constants.DEFAULT_CONTROL_ID.SCALE)
  // const zoomControl = map.getControl(TMap.constants.DEFAULT_CONTROL_ID.ZOOM) as TMap.ZoomControl;
  // zoomControl.setNumVisible(true);
  // zoomControl.setPosition(TMap.constants.CONTROL_POSITION.BOTTOM_LEFT);
  return map
}

// 外放函数：改变鼠标样式
function setCursorStyle(style: string) {
  cursorStyle.value = style
}
</script>

<template>
  <div class="map-component" :style="{ cursor: cursorStyle }">
    <div :id="`map-${randomId}`" class="map-instance" />
    <slot />
  </div>
</template>

<style scoped>
.map-component {
  position: relative;
  width: 100%;
  height: 100%;
  transform: translate3d(0, 0, 0);
}
.map-component > .map-instance {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: inherit !important;
}
</style>
