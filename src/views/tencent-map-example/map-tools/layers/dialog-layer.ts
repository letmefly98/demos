import type { App, Component } from 'vue'
import { merge } from 'lodash-es'
import { createApp, h } from 'vue'

import MapDialogContext from '../ui/dialog-context/index.vue'
import { offsetPosition, point2ll } from '../utils'

let id = 0

interface Props {
  onClose?: () => void
}
export function createDialogLayer(mapIns: TMap.Map, props?: Props) {
  let dialogDomRef: App | undefined
  id += 1

  // 创建图层
  const dialogLayer = new TMap.InfoWindow({
    map: mapIns,
    position: new TMap.LatLng(39.984104, 116.307503),
    offset: { x: 0, y: 0 },
  })
  dialogLayer.close()
  dialogLayer.on('closeclick', () => closeDialog())

  // 显示弹窗
  function openDialog(comp: Component, p: TMap.LatLng, data: any) {
    if (!dialogLayer) {
      closeDialog()
      console.info('dialogLayer is destroyed')
      return
    }
    const position = point2ll(offsetPosition(p, new TMap.LatLng(0.00003, 0)))
    dialogLayer.setPosition(position)
    const idStr = `debug-tool-info-dialog-${id}`
    dialogLayer.setContent(`<div id="${idStr}"></div>`)
    const dom = document.querySelector(`#${idStr}`)
    if (!dom) return
    const app = createApp(h(MapDialogContext, { mapIns, dialogRef: dialogLayer }, () => h(comp, { ...data })))
    app.mount(dom)
    dialogDomRef = app
    dialogLayer.open()
  }

  // 关闭弹窗
  function closeDialog() {
    if (dialogDomRef) {
      dialogDomRef.unmount()
      dialogDomRef = undefined
    }
    dialogLayer.close()
    if (props?.onClose) props.onClose()
  }

  // 后置设置 props
  function setProps(p: Props) {
    merge(props, p)
  }

  function destroy() {
    closeDialog()
  }

  return {
    layer: dialogLayer,
    destroy,
    openDialog,
    closeDialog,
    setProps,
  }
}
