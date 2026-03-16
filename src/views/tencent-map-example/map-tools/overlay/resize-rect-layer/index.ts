import type { ResizeRectGeometry } from './types'
import BaseOverlay from '../base'

/** 自定义覆盖物基类 - 继承 DOMOverlay */
export default class ResizeRectOverlay<G extends ResizeRectGeometry> extends BaseOverlay<G> {}
