import type { DateResult } from '../types'

/**
 * DatePickerCore 配置选项
 */
export interface DatePickerCoreOptions {
  defaultDate?: Date
  showLunar?: boolean
  endYear?: number
  primaryColor?: string
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
