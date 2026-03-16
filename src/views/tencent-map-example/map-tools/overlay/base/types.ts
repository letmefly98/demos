import type { App, Component, Ref } from 'vue'

export interface BaseGeometry {
  id?: string
}

// 自定义图层基础入参
export interface BaseOverlayProps<G extends BaseGeometry> extends TMap.DOMOverlayOptions {
  component: Component
  geometries: G[]
}

// 自定义图层内部上下文
export interface BaseOverlayContext<G extends Required<BaseGeometry>> extends BaseOverlayProps<G> {
  id: string
  dom: HTMLElement
  map: TMap.Map
  app: App | null
  renderFlag: Ref<number>
  emit: (event: string, ...args: any[]) => void
}

// 自定义图层被使用时的上下文
export interface BaseOverlayInject<C = any> extends BaseOverlayProps<C & Required<BaseGeometry>> {
  id: string
  dom: HTMLElement
  map: TMap.Map
  app: App | null
  renderFlag: Ref<number>
  emit: (event: string, ...args: any[]) => void
}
