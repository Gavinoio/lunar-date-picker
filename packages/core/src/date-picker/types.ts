import type { CalendarMode, CalendarType, DateResult, PickerLocale } from '../types'

/**
 * DatePickerCore 配置选项
 */
export interface DatePickerCoreOptions {
  defaultDate?: Date
  calendarMode?: CalendarMode
  defaultCalendar?: CalendarType
  startYear?: number
  endYear?: number
  primaryColor?: string
  locale?: PickerLocale
  onChange?: (result: DateResult) => void
  onConfirm?: (result: DateResult) => void
  onCancel?: () => void
}

/**
 * 事件处理函数类型
 */
export type DatePickerEventHandler = (result: DateResult) => void
export type DatePickerCancelHandler = () => void

/**
 * DatePickerCore 内部状态
 */
export interface DatePickerState {
  year: number
  month: number // 0-based，和 Date 一致
  day: number
  calendarType: 'solar' | 'lunar'
  // 农历状态
  lYear: number
  lMonth: number // 1-based
  lDay: number
  isLeap: boolean
}
