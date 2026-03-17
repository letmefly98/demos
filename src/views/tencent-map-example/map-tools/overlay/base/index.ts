import type { Component } from 'vue'
import type { BaseGeometry, BaseOverlayContext, BaseOverlayProps, NormalizedGeometry } from './types'
import { differenceBy } from 'lodash-es'
import { createApp, defineComponent, h, ref } from 'vue'
import { uuid } from '../../utils/uuid'

/** 自定义覆盖物基类 - 继承 DOMOverlay */
export default class BaseOverlay<G extends BaseGeometry> extends TMap.DOMOverlay<HTMLDivElement> {
  constructor(options: BaseOverlayProps<G>) {
    super(options)
  }

  /**
   * 初始化过程 constructor -> super(onInit -> createDOM -> updateDOM) -> after-constructor
   * 特别注意：其中 super 阶段的 this 与本类的 this 不同，容易会造成取值异常，所以最好不要直接采用 this 存值而是 getContext()
   */

  /** 初始化 */
  onInit(props: BaseOverlayProps<G>) {
    const context = this.getContext()
    Object.assign(context, props)
    context.geometries = (context.geometries || []).map(this.normalizeGeometry)
    context.renderFlag = ref(0)
  }

  /** 销毁时卸载 Vue 应用 */
  onDestroy() {
    const context = this.getContext()
    if (context.app) {
      context.app.unmount()
      context.app = null
    }
  }

  /** 创建 DOM 元素，挂载 Vue 组件，返回一个 DOMElement */
  createDOM() {
    const context = this.getContext()

    const dom = document.createElement('div')
    dom.className = 'custom-overlay-wrapper'

    if (!context.component) return dom

    const app = this.createApp(dom, context.component)
    context.app = app

    return dom
  }

  /** 更新 DOM 元素，在地图移动/缩放后执行 */
  updateDOM() {
    const context = this.getContext()
    context.renderFlag.value += 1
  }

  createApp(dom: HTMLElement, component: Component) {
    const context = this.getContext()
    // 使用 defineComponent + setup 返回渲染函数，确保 renderFlag 变化时触发重新渲染
    const App = defineComponent({
      setup() {
        return () => h(component, {
          renderFlag: context.renderFlag.value,
          context,
        })
      },
    })
    const app = createApp(App)
    app.mount(dom)
    context.app = app
    return app
  }

  /** 获取上下文（避免继承情况下的取值异常） */
  getContext() {
    return this as unknown as BaseOverlayContext<G>
  }

  /** 结构化单个内容，确保 id 存在 */
  normalizeGeometry(geometry: G): NormalizedGeometry<G> {
    const newGeo = geometry as NormalizedGeometry<G>
    if (!newGeo.id) newGeo.id = uuid()
    return newGeo
  }

  /** 设置内容 */
  setGeometries(geometries: G[]) {
    const context = this.getContext()
    context.geometries = geometries.map(this.normalizeGeometry)
    this.updateDOM()
  }

  /** 更新内容（合并已有数据，新增不存在的） */
  updateGeometries(geometries: G[]) {
    const context = this.getContext()
    const diff = differenceBy(geometries, context.geometries, 'id')
    context.geometries = context.geometries.map((geo) => {
      const match = geometries.find(g => g.id === geo.id)
      return match ? this.normalizeGeometry(match) : geo
    }).concat(diff.map(this.normalizeGeometry))
    this.updateDOM()
  }

  /** 获取内容 */
  getGeometries() {
    const context = this.getContext()
    return context.geometries
  }
}
