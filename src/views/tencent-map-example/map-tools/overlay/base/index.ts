import type { BaseOverlayContext, BaseOverlayProps } from './types'
import { createApp, defineComponent, h, ref } from 'vue'

/** 自定义覆盖物基类 - 继承 DOMOverlay，内部挂载 Vue 组件实现自定义渲染 */
export default class BaseOverlay<G = any> extends TMap.DOMOverlay<HTMLDivElement> {
  /**
   * 初始化过程 constructor -> super(onInit -> createDOM -> updateDOM) -> after-constructor
   * 特别注意：其中 super 阶段的 this 与本类的 this 不同，容易会造成取值异常，所以最好不要直接采用 this 存值而是 getContext()
   */
  constructor(options: BaseOverlayProps<G>) {
    super(options)
  }

  /** 初始化 */
  onInit(props: BaseOverlayProps<G>) {
    const context = this.getContext()
    Object.assign(context, props)
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

    // 使用 defineComponent + setup 返回渲染函数，确保 renderFlag 变化时触发重新渲染
    const App = defineComponent({
      setup() {
        return () => h(context.component, {
          renderFlag: context.renderFlag.value,
          context,
        })
      },
    })

    const app = createApp(App)
    app.mount(dom)
    context.app = app

    return dom
  }

  /** 更新 DOM 元素，在地图移动/缩放后执行 */
  updateDOM() {
    const context = this.getContext()
    context.renderFlag.value += 1
  }

  /** 获取上下文（将 this 作为 context 载体，避免额外对象分配） */
  getContext() {
    return this as unknown as BaseOverlayContext<G>
  }
}
