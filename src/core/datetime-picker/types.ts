import type { PickerType, DateTimeResult, TimeField } from '../types'

/**
 * DateTimePickerCore 配置选项
 */
export interface DateTimePickerCoreOptions {
  defaultDate?: Date
  type?: PickerType // 0: 只公历, 1: 公历+农历切换, 2: 默认农历
  timeFields?: TimeField[] // 要显示的时间字段，例如 ['hour', 'minute'] 或 ['hour', 'minute', 'second']
  showUnit?: boolean // 是否显示单位文字（年、月、日、时、分、秒）
  unclearFirst?: boolean // "不清楚"选项是否放在时间列的最前面（true: 最前面, false: 最后面）
  endYear?: number // 年份选择的最大年份
  primaryColor?: string // 主题色
  onChange?: (result: DateTimeResult) => void
  onConfirm?: (result: DateTimeResult) => void
  onCancel?: () => void
}

/**
 * 事件处理函数类型
 */
export type DateTimePickerEventHandler = (result: DateTimeResult) => void
export type DateTimePickerCancelHandler = () => void

/**
 * DateTimePickerCore 内部状态
 */
export interface DateTimeState {
  year: number
  month: number
  day: number
  hour?: number | '不清楚' // 可选，取决于 timeFields 是否包含 'hour'
  minute?: number | '不清楚' // 可选，取决于 timeFields 是否包含 'minute'
  second?: number // 可选，取决于 timeFields 是否包含 'second'
  isLeap: boolean
  calendarType: 'solar' | 'lunar'
}
