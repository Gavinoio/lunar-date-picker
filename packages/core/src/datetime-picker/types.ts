import type {
  CalendarMode,
  CalendarType,
  DateTimeResult,
  PickerLocale,
  TimeField,
  TimeValue
} from '../types'

/**
 * DateTimePickerCore 配置选项
 */
export interface DateTimePickerCoreOptions {
  defaultDate?: Date
  calendarMode?: CalendarMode // 只公历、只农历，或允许切换
  defaultCalendar?: CalendarType // 切换模式下默认打开的日历
  startYear?: number // 年份选择的起始年份
  timeFields?: TimeField[] // 要显示的时间字段，例如 ['hour', 'minute'] 或 ['hour', 'minute', 'second']
  showUnit?: boolean // 是否显示单位文字（年、月、日、时、分、秒）
  showUnclear?: boolean // 是否显示“不清楚”选项
  unclearPosition?: 'first' | 'last' // “不清楚”选项显示位置
  endYear?: number // 年份选择的最大年份
  primaryColor?: string // 主题色
  locale?: PickerLocale
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
  hour?: TimeValue // 可选，取决于 timeFields 是否包含 'hour'
  minute?: TimeValue // 可选，取决于 timeFields 是否包含 'minute'
  second?: TimeValue // 可选，取决于 timeFields 是否包含 'second'
  isLeap: boolean
  calendarType: 'solar' | 'lunar'
}
