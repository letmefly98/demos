/// <reference types="vite/client" />

/**
 * 常用 options 结构
 */
declare interface OPTION<T = any> {
  value: T
  label: string
  disabled?: boolean
  [key: string]: any
}
declare type OPTIONS<T = any> = OPTION<T>[]
declare type ACTION_OPTION<T = any> = OPTION<T> & {
  permKeys?: string[]
  theme?: 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

/**
 * 数组内数据键的值转枚举
 *
 * @example
 * const COLOR_OPTIONS = [
 *   { label: '红色', value: 0 },
 *   { label: '绿色', value: 1 },
 * ] as const satisfies OPTION[];
 * type COLOR = ArrayElement<typeof COLOR_OPTIONS>['value'];
 */
declare type ArrayElement<A> = A extends (infer T)[] ? T : never
