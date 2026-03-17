// 全局共享类型

export type CalendarType = 'solar' | 'lunar'

// 0: 只公历, 1: 公历+农历切换, 2: 默认农历
export type PickerType = 0 | 1 | 2

// 时间字段类型
export type TimeField = 'hour' | 'minute' | 'second'

export interface SolarDate {
  year: number
  month: number // 1-12
  day: number
  week: number // 0-6，0=周日
  weekCn: string // '周一'
}

export interface LunarDate {
  year: number
  month: number
  day: number
  isLeap: boolean
  yearCn: string // '甲子年'
  monthCn: string // '正月'
  dayCn: string // '初一'
  animal: string // '鼠'
}

export interface DateResult {
  date: Date
  solar: SolarDate
  lunar: LunarDate
}

export interface DateTimeResult extends DateResult {
  hour?: number | '不清楚' // 可选，取决于 timeFields 是否包含 'hour'
  minute?: number | '不清楚' // 可选，取决于 timeFields 是否包含 'minute'
  second?: number // 可选，取决于 timeFields 是否包含 'second'
}

export interface LunarInfo {
  lYear: number
  lMonth: number
  lDay: number
  Animal: string
  IMonthCn: string
  IDayCn: string
  cYear: number
  cMonth: number
  cDay: number
  gzYear: string
  gzMonth: string
  gzDay: string
  isToday: boolean
  isLeap: boolean
  nWeek: number
  ncWeek: string
  isTerm: boolean
  Term: string | null
  astro: string
}
