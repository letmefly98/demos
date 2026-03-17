import type { BaseOverlayProps } from '../base/types'
import type { RadiusGeometry } from './types'
import BaseOverlay from '../base/index'
import ResizeRectElement from './ui.vue'

/** 数字圆盘覆盖物类 */
export default class RadiusOverlay<G extends RadiusGeometry> extends BaseOverlay<G> {
  constructor(props: BaseOverlayProps<G>) {
    super({ ...props, component: ResizeRectElement })
  }
}
