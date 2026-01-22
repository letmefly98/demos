<script setup lang="ts">
import type TMap from 'tmap-gl-types'
import type { MAP_TYPE } from './map-tools/plugins/map-type-plugin'
import { ref, watch } from 'vue'
import { createTileLayer } from './map-tools/layers/tile-layer'
import useMapTypePlugin, { MAP_TYPE_OPTIONS } from './map-tools/plugins/map-type-plugin'
import MapComponent from './map-tools/ui/map-component/index.vue'
import { fitBounds, getMapLevel, getPosition, getRectByScreen, getTileCorner, getTileLevel, getTileRect, getTileSizeById, point2ll } from './map-tools/utils'

defineOptions({
  title: '腾讯地图API演示',
  group: 'libs',
  layout: 'pure',
})

// 地图初始化参数
let mapIns: TMap.Map
let markerLayer: TMap.MultiMarker

// 拓展地图类型功能
const mapType = ref<MAP_TYPE>('tencent-map')
const { initial: initMapTypePlugin, changeType: changeMapType } = useMapTypePlugin({
  defaultType: mapType.value,
})
watch(mapType, () => changeMapType(mapIns, mapType.value))

const markInput = ref('')
const tileInput = ref('')
const mapLevel = ref(13)
const tileLevel = ref(13)

// 地图加载完成，初始化各种拓展
function handleMapLoaded(map: TMap.Map) {
  const TMap = window.TMap
  mapIns = map

  const tileLayer = createTileLayer(mapIns, { config: { color: '#ff0000' } })
  markerLayer = new TMap.MultiMarker({
    id: 'markerLayer',
    map: mapIns,
    zIndex: 1,
    geometries: [],
    styles: {},
  })

  // 初始化地图类型
  initMapTypePlugin(mapIns)
  updateTile()

  mapIns.on('bounds_changed', () => {
    mapLevel.value = getMapLevel(mapIns)
    tileLevel.value = getTileLevel(mapIns)
    updateTile()
  })

  const beijing = { lat: 39.9069287, lng: 116.3975649 }
  markerLayer.updateGeometries([{ id: 'mark', styleId: 'mark', position: point2ll(beijing) }])

  function updateTile() {
    const tileLevel = getTileLevel(mapIns)
    const bounds = getRectByScreen(mapIns) // 当前视窗
    tileLayer.redraw(tileLevel, bounds)
  }
}

function handleMarkInputChange() {
  if (!markInput.value) {
    markerLayer.remove(['mark'])
    return
  }
  const p = getPosition(markInput.value)
  if (!p) return alert('请输入正确的经纬度')
  const position = point2ll(p)
  mapIns.setCenter(position)
  markerLayer.updateGeometries([{ id: 'mark', styleId: 'mark', position }])
}

function handleTileInputChange() {
  if (!tileInput.value) return
  const tid = Number(tileInput.value)
  if (Number.isNaN(tid)) return
  const dist = getTileSizeById(tid)
  const lb = getTileCorner(tid)
  const paths = getTileRect(lb, dist)
  fitBounds(mapIns, paths)
}
</script>

<template>
  <div class="tencent-map-api">
    <div class="map-container">
      <MapComponent @loaded="handleMapLoaded" />
    </div>
    <div class="controls">
      <div class="control-item">
        <div class="title">
          <span>地图级别</span>
        </div>
        <div class="content">
          {{ mapLevel }}
        </div>
      </div>
      <div class="control-item">
        <div class="title">
          <span>地图Tile级别</span>
        </div>
        <div class="content">
          {{ tileLevel }}
        </div>
      </div>
      <div class="control-item">
        <div class="title">
          <span>地图类型</span>
        </div>
        <div class="content">
          <select v-model="mapType">
            <template v-for="op in MAP_TYPE_OPTIONS" :key="op.value">
              <option :value="op.value">
                {{ op.label }}
              </option>
            </template>
          </select>
        </div>
      </div>
      <div class="control-item">
        <div class="title">
          <span>快速定位</span>
        </div>
        <div class="content">
          <input v-model="markInput" placeholder="请输入经纬度" @blur="handleMarkInputChange" />
          <input v-model="tileInput" placeholder="请输入TileId" @blur="handleTileInputChange" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import "@/styles/mixins.less";

.tencent-map-api {
  .items-gap(bottom);
  display: flex;
  gap: .px(20)[];

  .map-container {
    width: 80%;
    height: 90vh;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  }
}
</style>
