import type { BaseOverlayProps } from '../base/types'
import type { ResizeRectGeometry } from './types'
import BaseOverlay from '../base'
import ResizeRectElement from './ui.vue'

/** 可缩放矩形覆盖物类 */
export default class ResizeRectOverlay<G extends ResizeRectGeometry> extends BaseOverlay<G> {
  constructor(props: BaseOverlayProps<G>) {
    super({ ...props, component: ResizeRectElement })
  }
}
