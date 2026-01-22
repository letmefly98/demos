<script setup lang="ts">
import { copyText } from '@/utils/copy'
import { cloneDeep } from 'lodash-es'

import { computed } from 'vue'

interface Props {
  data: any
  showCopyButton?: boolean
  removeNullValue?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showCopyButton: true,
  removeNullValue: true,
})

function handleCopy(str?: string) {
  copyText(str || JSON.stringify(props.data, null, 2))
}

const content = computed(() => {
  const data = cloneDeep(props.data)
  if (props.removeNullValue) {
    Object.keys(data).forEach((key) => {
      const val = data[key]
      if (val === undefined || val === null) delete data[key]
    })
  }
  const str = JSON.stringify(data, null, 2)
  return str
})
</script>

<template>
  <div class="json-preview">
    <div v-if="props.showCopyButton" class="btn-copy" @click="handleCopy()">
      复制
    </div>
    <div class="content">
      {{ content }}
    </div>
  </div>
</template>

<style scoped>
.json-preview {
  position: relative;
  max-width: var(--json-preview-width, 400px);
  max-height: var(--json-preview-height, 400px);
  overflow: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  padding: 2px 4px;
}

.json-preview .btn-copy {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
  border-bottom-left-radius: 4px;
  cursor: pointer;
}

.json-preview .content {
  text-wrap: auto;
  white-space: pre;
}
</style>
