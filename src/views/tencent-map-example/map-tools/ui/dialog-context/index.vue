<script setup lang="ts" name="MapDialogContext">
import { provide } from 'vue'

import { MapDialogInjectionKey } from './provide'

interface Props {
  mapIns: TMap.Map
  dialogRef: TMap.InfoWindow
}
const props = withDefaults(defineProps<Props>(), {})
defineSlots<{
  default: () => any
}>()

provide(MapDialogInjectionKey, {
  mapIns: props.mapIns,
  dialogRef: props.dialogRef,
})
</script>

<template>
  <slot name="default" />
</template>
