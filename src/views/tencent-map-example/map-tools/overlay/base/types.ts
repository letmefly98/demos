import type { App, Component, Ref } from 'vue'

/** 单个 geometry 的基础数据模型 */
export interface BaseGeometry {
  id?: string
}

/** 格式化后的单个 geometry 的数据类型 */
export type NormalizedGeometry<G extends BaseGeometry> = G & Required<BaseGeometry>

/** 自定义图层基础入参 */
export interface BaseOverlayProps<G extends BaseGeometry> extends TMap.DOMOverlayOptions {
  component?: Component
  geometries?: G[]
}

/** 自定义图层内部上下文 & 子组件注入的上下文（共用同一接口） */
export interface BaseOverlayContext<G extends BaseGeometry = BaseGeometry> extends Required<BaseOverlayProps<NormalizedGeometry<G>>> {
  id: string
  dom: HTMLElement
  map: TMap.Map
  app: App | null
  renderFlag: Ref<number>
  emit: (event: string, ...args: any[]) => void
}
