import type { App, Component, Ref } from 'vue'

// 自定义图层基础入参
export interface BaseOverlayProps<G = any> extends TMap.DOMOverlayOptions {
  component: Component
  geometries: G[]
}

// 自定义图层内部上下文
export interface BaseOverlayContext<G = any> extends BaseOverlayProps<G> {
  id: string
  dom: HTMLElement
  map: TMap.Map
  app: App | null
  renderFlag: Ref<number>
  emit: (event: string, ...args: any[]) => void
}
