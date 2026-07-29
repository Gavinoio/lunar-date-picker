import { LunarCalendar } from '../calendar/lunar'
import { resolveLocale } from '../locale'
import { Scroll } from '../scroll/Scroll'
import type { DateTimeResult, LunarInfo, PickerLocale } from '../types'
import type {
  DateTimePickerCoreOptions,
  DateTimeState,
  DateTimePickerEventHandler,
  DateTimePickerCancelHandler
} from './types'

// 常量定义
const DEFAULT_START_YEAR = 1910 // 起始年份
const MIN_SUPPORTED_YEAR = 1900
const MAX_SUPPORTED_YEAR = 2100
const ITEM_HEIGHT = 44 // 每个选项的高度（px）
const UNCLEAR_VALUE = '不清楚'

function getMaxSelectableYear(): number {
  return Math.min(new Date().getFullYear(), MAX_SUPPORTED_YEAR)
}

function clampYear(year: number, min: number, max: number): number {
  return Math.min(Math.max(year, min), max)
}

function resolveYearRange(options: DateTimePickerCoreOptions): {
  startYear: number
  endYear: number
} {
  const maxSelectableYear = getMaxSelectableYear()
  let startYear = clampYear(options.startYear ?? DEFAULT_START_YEAR, MIN_SUPPORTED_YEAR, maxSelectableYear)
  let endYear = clampYear(options.endYear ?? maxSelectableYear, MIN_SUPPORTED_YEAR, maxSelectableYear)

  if (startYear > endYear) {
    startYear = MIN_SUPPORTED_YEAR
    endYear = maxSelectableYear
  }

  return { startYear, endYear }
}

type EventName = 'change' | 'confirm' | 'cancel'
type DateTimePickerResolvedOptions = Required<Omit<DateTimePickerCoreOptions, 'locale'>> & {
  locale: Required<PickerLocale>
}

/**
 * DateTimePickerCore - 日期时间选择器核心类
 *
 * 功能：
 * - 动态列布局：年、月、日 + 可选的时、分、秒
 * - 支持公历/农历切换（通过 type 参数控制）
 * - 时间列支持"不清楚"选项
 * - 通过 timeFields 参数灵活控制显示哪些时间字段
 */
export class DateTimePickerCore {
  private container: HTMLElement
  private options: DateTimePickerResolvedOptions
  private state: DateTimeState
  private scrollers: Map<string, Scroll> = new Map()
  private itemHeight = ITEM_HEIGHT
  private listeners: Map<
    EventName,
    Array<DateTimePickerEventHandler | DateTimePickerCancelHandler>
  > = new Map()

  constructor(container: HTMLElement, options: DateTimePickerCoreOptions = {}) {
    this.container = container
    const { startYear, endYear } = resolveYearRange(options)
    this.options = {
      defaultDate: options.defaultDate ?? new Date(),
      calendarMode: options.calendarMode ?? 'switch',
      defaultCalendar: options.defaultCalendar ?? 'solar',
      startYear,
      timeFields: options.timeFields ?? ['hour', 'minute'], // 默认显示时分
      showUnit: options.showUnit ?? true,
      showUnclear: options.showUnclear ?? true,
      unclearPosition: options.unclearPosition ?? 'last',
      endYear,
      primaryColor: options.primaryColor ?? '#D03F3F',
      locale: resolveLocale(options.locale),
      onChange: options.onChange ?? (() => {}),
      onConfirm: options.onConfirm ?? (() => {}),
      onCancel: options.onCancel ?? (() => {})
    }

    const d = this.options.defaultDate
    this.validateDateInRange(d, 'defaultDate')
    const calendarType = this.getInitialCalendarType()
    const hasHour = this.options.timeFields.includes('hour')
    const hasMinute = this.options.timeFields.includes('minute')
    const hasSecond = this.options.timeFields.includes('second')

    // 初始化状态
    if (calendarType === 'lunar') {
      // 默认农历，需要先转换
      const lunar = LunarCalendar.solar2lunar(d.getFullYear(), d.getMonth() + 1, d.getDate())
      this.state = {
        year: lunar?.lYear || d.getFullYear(),
        month: lunar?.lMonth || d.getMonth() + 1,
        day: lunar?.lDay || d.getDate(),
        hour: hasHour ? this.getInitialTimeValue(d.getHours()) : undefined,
        minute: hasMinute ? this.getInitialTimeValue(d.getMinutes()) : undefined,
        second: hasSecond ? this.getInitialTimeValue(d.getSeconds()) : undefined,
        isLeap: lunar?.isLeap || false,
        calendarType: 'lunar'
      }
    } else {
      // 默认公历
      this.state = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        hour: hasHour ? this.getInitialTimeValue(d.getHours()) : undefined,
        minute: hasMinute ? this.getInitialTimeValue(d.getMinutes()) : undefined,
        second: hasSecond ? this.getInitialTimeValue(d.getSeconds()) : undefined,
        isLeap: false,
        calendarType: 'solar'
      }
    }

    this.render()
    this.initScrollers()
    this.bindPanelEvents()
  }

  private getInitialCalendarType(): 'solar' | 'lunar' {
    if (this.options.calendarMode === 'solar') return 'solar'
    if (this.options.calendarMode === 'lunar') return 'lunar'
    return this.options.defaultCalendar
  }

  private canUseCalendar(type: 'solar' | 'lunar'): boolean {
    return this.options.calendarMode === 'switch' || this.options.calendarMode === type
  }

  private validateDateInRange(date: Date, name: string): void {
    const year = date.getFullYear()
    if (year < this.options.startYear || year > this.options.endYear) {
      throw new Error(
        `DateTimePickerCore: ${name} year must be between ${this.options.startYear} and ${this.options.endYear}`
      )
    }
  }

  private isUnclearFirst(): boolean {
    return this.options.showUnclear && this.options.unclearPosition === 'first'
  }

  private getInitialTimeValue(value: number): number | '不清楚' {
    return this.isUnclearFirst() ? UNCLEAR_VALUE : value
  }

  private getTimePosition(value: number | '不清楚' | undefined, max: number): number {
    if (value === UNCLEAR_VALUE) return this.isUnclearFirst() ? 0 : max + 1
    const num = typeof value === 'number' ? value : 0
    return this.isUnclearFirst() ? num + 1 : num
  }

  private parseTimeValue(value: number, max: number): number | '不清楚' {
    return this.options.showUnclear && value === max + 1 ? UNCLEAR_VALUE : value
  }

  // ─── 渲染 ────────────────────────────────────────────────────────────────

  /**
   * 渲染选择器骨架
   * 根据 timeFields 动态生成年月日 + 时间列
   */
  private render(): void {
    const cols = ['year', 'month', 'day']
    // 根据 timeFields 添加时间列
    this.options.timeFields.forEach(field => cols.push(field))

    const colsHtml = cols
      .map(
        col => `
      <div class="ldp-wrapper ldp-${col}-wrapper">
        <ul class="ldp-wrapper-ul"></ul>
      </div>
    `
      )
      .join('')

    this.container.innerHTML = colsHtml
  }

  /**
   * 生成列表项的通用方法
   * @param start 起始值
   * @param end 结束值
   * @param type 列类型（year/month/day/hour/minute/second）
   * @param leapMonth 闰月月份（仅农历月份时使用）
   */
  private renderItem(start: number, end: number, type: string, leapMonth = 0): string {
    const items: string[] = []

    if (type === 'month' && this.state.calendarType === 'lunar') {
      // 农历月份特殊处理，使用索引作为 data-value
      const count = leapMonth > 0 ? 12 : 11
      for (let i = 0; i <= count; i++) {
        let label: string
        if (leapMonth > 0) {
          if (i < leapMonth) {
            label = LunarCalendar.toChinaMonth(i + 1)
          } else if (i === leapMonth) {
            label = '闰' + LunarCalendar.toChinaMonth(leapMonth)
          } else {
            label = LunarCalendar.toChinaMonth(i)
          }
        } else {
          label = LunarCalendar.toChinaMonth(i + 1)
        }
        items.push(`<li data-value="${i}" class="ldp-row">${label}</li>`)
      }
      return items.join('')
    }

    // 其他类型的列表项
    for (let i = start; i <= end; i++) {
      let text: string | number = i
      let unit = ''

      if (type === 'year') unit = '年'

      if (type === 'month') {
        // 公历月份
        unit = '月'
      }

      if (type === 'day') {
        if (this.state.calendarType === 'lunar') {
          text = LunarCalendar.toChinaDay(i)
          unit = ''
        } else {
          unit = '日'
        }
      }

      items.push(
        `<li data-value="${i}" class="ldp-row">${text}${this.options.showUnit ? unit : ''}</li>`
      )
    }
    return items.join('')
  }

  /**
   * 生成时间列表项（时、分、秒）
   * 包含"不清楚"选项，位置由 unclearPosition 控制
   */
  private renderTimeItem(start: number, end: number, unit: string): string {
    const unclearValue = end + 1
    const items: string[] = []

    if (this.isUnclearFirst()) {
      items.push(`<li data-value="${unclearValue}" class="ldp-row">不清楚</li>`)
    }

    for (let i = start; i <= end; i++) {
      const time = i < 10 ? '0' + i : String(i)
      const unitText = this.options.showUnit ? unit : ''
      items.push(`<li data-value="${i}" class="ldp-row">${time}${unitText}</li>`)
    }

    if (this.options.showUnclear && !this.isUnclearFirst()) {
      items.push(`<li data-value="${unclearValue}" class="ldp-row">不清楚</li>`)
    }

    return items.join('')
  }

  private renderYearCol(): void {
    const el = this.container.querySelector('.ldp-year-wrapper .ldp-wrapper-ul')!
    el.innerHTML = this.renderItem(this.options.startYear, this.options.endYear, 'year')
  }

  private renderMonthCol(leapMonth = 0): void {
    const el = this.container.querySelector('.ldp-month-wrapper .ldp-wrapper-ul')!
    el.innerHTML = this.renderItem(1, 12, 'month', leapMonth)
  }

  private renderDayCol(days: number): void {
    const el = this.container.querySelector('.ldp-day-wrapper .ldp-wrapper-ul')!
    el.innerHTML = this.renderItem(1, days, 'day')
  }

  private renderHourCol(): void {
    const el = this.container.querySelector('.ldp-hour-wrapper .ldp-wrapper-ul')!
    el.innerHTML = this.renderTimeItem(0, 23, '时')
  }

  private renderMinuteCol(): void {
    const el = this.container.querySelector('.ldp-minute-wrapper .ldp-wrapper-ul')!
    el.innerHTML = this.renderTimeItem(0, 59, '分')
  }

  private renderSecondCol(): void {
    const el = this.container.querySelector('.ldp-second-wrapper .ldp-wrapper-ul')
    if (!el) return
    el.innerHTML = this.renderTimeItem(0, 59, '秒')
  }

  // ─── 初始化滚动 ──────────────────────────────────────────────────────────

  private initScrollers(): void {
    const s = this.state

    // 根据日历类型计算天数和渲染列
    let days: number
    let monthPos: number

    if (s.calendarType === 'lunar') {
      // 农历模式
      const leapMonth = LunarCalendar.leapMonth(s.year)
      this.renderYearCol()
      this.renderMonthCol(leapMonth)

      days = s.isLeap ? LunarCalendar.leapDays(s.year) : LunarCalendar.monthDays(s.year, s.month)
      this.renderDayCol(days)

      // 计算农历月份的滚动位置（索引）
      monthPos = s.month - 1
      if (leapMonth > 0 && (s.month > leapMonth || s.isLeap)) {
        monthPos = s.month // 闰月或闰月之后，索引+1
      }
    } else {
      // 公历模式
      days = LunarCalendar.solarDays(s.year, s.month)
      this.renderYearCol()
      this.renderMonthCol()
      this.renderDayCol(days)
      monthPos = s.month - 1
    }

    // 根据 timeFields 渲染时间列
    if (this.options.timeFields.includes('hour')) this.renderHourCol()
    if (this.options.timeFields.includes('minute')) this.renderMinuteCol()
    if (this.options.timeFields.includes('second')) this.renderSecondCol()

    // 获取行高
    const firstRow = this.container.querySelector('.ldp-year-wrapper .ldp-row') as HTMLElement
    this.itemHeight = firstRow?.clientHeight || ITEM_HEIGHT

    const h = this.itemHeight
    const yearPos = s.year - this.options.startYear
    const dayPos = s.day - 1
    const hourPos = this.getTimePosition(s.hour, 23)
    const minutePos = this.getTimePosition(s.minute, 59)
    const secondPos = this.getTimePosition(s.second, 59)

    // 年
    this.scrollers.set(
      'year',
      new Scroll(this.container.querySelector('.ldp-year-wrapper') as HTMLElement, {
        step: true,
        defaultPlace: h * yearPos,
        callback: params => this.onYearChange(params.index, params.node)
      })
    )

    // 月
    this.scrollers.set(
      'month',
      new Scroll(this.container.querySelector('.ldp-month-wrapper') as HTMLElement, {
        step: true,
        defaultPlace: h * monthPos,
        callback: params => this.onMonthChange(params.index, params.node)
      })
    )

    // 日
    this.scrollers.set(
      'day',
      new Scroll(this.container.querySelector('.ldp-day-wrapper') as HTMLElement, {
        step: true,
        defaultPlace: h * dayPos,
        callback: params => {
          const item = params.node[params.index] as HTMLElement
          this.state.day = parseInt(item.dataset.value!)
          this.emit('change', this.getResult())
        }
      })
    )

    // 时
    if (this.options.timeFields.includes('hour')) {
      this.scrollers.set(
        'hour',
        new Scroll(this.container.querySelector('.ldp-hour-wrapper') as HTMLElement, {
          step: true,
          defaultPlace: h * hourPos,
          callback: params => {
            const item = params.node[params.index] as HTMLElement
            const val = parseInt(item.dataset.value!)
            this.state.hour = this.parseTimeValue(val, 23)
            this.emit('change', this.getResult())
          }
        })
      )
    }

    // 分
    if (this.options.timeFields.includes('minute')) {
      this.scrollers.set(
        'minute',
        new Scroll(this.container.querySelector('.ldp-minute-wrapper') as HTMLElement, {
          step: true,
          defaultPlace: h * minutePos,
          callback: params => {
            const item = params.node[params.index] as HTMLElement
            const val = parseInt(item.dataset.value!)
            this.state.minute = this.parseTimeValue(val, 59)
            this.emit('change', this.getResult())
          }
        })
      )
    }

    // 秒
    if (this.options.timeFields.includes('second')) {
      this.scrollers.set(
        'second',
        new Scroll(this.container.querySelector('.ldp-second-wrapper') as HTMLElement, {
          step: true,
          defaultPlace: h * secondPos,
          callback: params => {
            const item = params.node[params.index] as HTMLElement
            this.state.second = this.parseTimeValue(parseInt(item.dataset.value!), 59)
            this.emit('change', this.getResult())
          }
        })
      )
    }
  }

  // ─── 农历月份索引转换辅助方法 ─────────────────────────────────────────────

  /**
   * 将农历月份索引转换为实际月份和闰月标志
   * @param index 列表索引（data-value）
   * @param leapMonth 闰月月份（0表示无闰月）
   * @returns { month: 实际月份, isLeap: 是否闰月 }
   */
  private lunarIndexToMonth(index: number, leapMonth: number): { month: number; isLeap: boolean } {
    if (leapMonth > 0 && index === leapMonth) {
      return { month: leapMonth, isLeap: true }
    } else if (leapMonth > 0 && index > leapMonth) {
      return { month: index, isLeap: false }
    } else {
      return { month: index + 1, isLeap: false }
    }
  }

  /**
   * 将农历月份和闰月标志转换为列表索引
   * @param month 实际月份
   * @param isLeap 是否闰月
   * @param leapMonth 闰月月份（0表示无闰月）
   * @returns 列表索引
   */
  private lunarMonthToIndex(month: number, isLeap: boolean, leapMonth: number): number {
    if (leapMonth > 0 && (month > leapMonth || isLeap)) {
      return month
    }
    return month - 1
  }

  // ─── 滚动回调 ────────────────────────────────────────────────────────────

  private onYearChange(index: number, node: NodeListOf<ChildNode>): void {
    const item = node[index] as HTMLElement
    this.state.year = parseInt(item.dataset.value!)

    let days: number
    let monthPos: number

    if (this.state.calendarType === 'lunar') {
      // 农历模式
      const leapMonth = LunarCalendar.leapMonth(this.state.year)
      if (leapMonth !== 0) {
        this.renderMonthCol(leapMonth)
      } else {
        this.renderMonthCol()
      }

      // 计算农历月份的滚动位置
      monthPos = this.lunarMonthToIndex(this.state.month, this.state.isLeap, leapMonth)

      // 计算农历日期天数
      days = this.state.isLeap
        ? LunarCalendar.leapDays(this.state.year)
        : LunarCalendar.monthDays(this.state.year, this.state.month)
    } else {
      // 公历模式
      days = LunarCalendar.solarDays(this.state.year, this.state.month)
      monthPos = this.state.month - 1
    }

    this.renderDayCol(days)

    let dayPos = this.state.day - 1
    if (this.state.day > days) {
      this.state.day = days
      dayPos = days - 1
    }

    const monthScroll = this.scrollers.get('month')!
    const dayScroll = this.scrollers.get('day')!
    monthScroll.refresh()
    monthScroll.scrollTo(0, this.itemHeight * monthPos, 0)
    dayScroll.refresh()
    dayScroll.scrollTo(0, this.itemHeight * dayPos, 0)

    this.emit('change', this.getResult())
  }

  private onMonthChange(index: number, node: NodeListOf<ChildNode>): void {
    const item = node[index] as HTMLElement
    const val = parseInt(item.dataset.value!)

    let days: number

    if (this.state.calendarType === 'solar') {
      // 公历模式：val 就是月份（1-based）
      this.state.month = val
      days = LunarCalendar.solarDays(this.state.year, this.state.month)
    } else {
      // 农历模式：val 是索引，需要转换为实际月份
      const leapMonth = LunarCalendar.leapMonth(this.state.year)
      const { month, isLeap } = this.lunarIndexToMonth(val, leapMonth)
      this.state.month = month
      this.state.isLeap = isLeap
      days = isLeap ? LunarCalendar.leapDays(this.state.year) : LunarCalendar.monthDays(this.state.year, month)
    }

    this.renderDayCol(days)

    let dayPos = this.state.day - 1
    if (this.state.day > days) {
      this.state.day = days
      dayPos = days - 1
    }

    const dayScroll = this.scrollers.get('day')!
    dayScroll.refresh()
    dayScroll.scrollTo(0, this.itemHeight * dayPos, 0)

    this.emit('change', this.getResult())
  }

  // ─── 公历/农历切换 ───────────────────────────────────────────────────────

  /**
   * 切换日历类型（公历 <-> 农历）
   * 切换时会自动转换日期并更新年月日列的显示
   */
  switchCalendarType(type: 'solar' | 'lunar'): void {
    if (this.state.calendarType === type) return
    if (!this.canUseCalendar(type)) return
    const h = this.itemHeight

    if (type === 'lunar') {
      const lunar = LunarCalendar.solar2lunar(this.state.year, this.state.month, this.state.day)
      if (!lunar) return

      this.state.calendarType = 'lunar'
      this.state.year = lunar.lYear
      this.state.month = lunar.lMonth
      this.state.day = lunar.lDay
      this.state.isLeap = lunar.isLeap

      const leapMonth = LunarCalendar.leapMonth(lunar.lYear)
      const lMonth = this.lunarMonthToIndex(lunar.lMonth, lunar.isLeap, leapMonth)

      if (leapMonth !== 0) {
        this.renderMonthCol(leapMonth)
      } else {
        this.renderMonthCol()
      }

      const days = lunar.isLeap
        ? LunarCalendar.leapDays(lunar.lYear)
        : LunarCalendar.monthDays(lunar.lYear, lunar.lMonth)

      this.renderDayCol(days)

      const monthScroll = this.scrollers.get('month')!
      const dayScroll = this.scrollers.get('day')!
      monthScroll.refresh()
      dayScroll.refresh()

      this.scrollers.get('year')!.scrollTo(0, (lunar.lYear - this.options.startYear) * h, 500)
      monthScroll.scrollTo(0, lMonth * h, 500)
      dayScroll.scrollTo(0, (lunar.lDay - 1) * h, 500)
    } else {
      const solar = LunarCalendar.lunar2solar(
        this.state.year,
        this.state.month,
        this.state.day,
        this.state.isLeap
      )
      if (!solar) return

      this.state.calendarType = 'solar'
      this.state.year = solar.cYear
      this.state.month = solar.cMonth
      this.state.day = solar.cDay

      const days = LunarCalendar.solarDays(solar.cYear, solar.cMonth)
      this.renderMonthCol()
      this.renderDayCol(days)

      const monthScroll = this.scrollers.get('month')!
      const dayScroll = this.scrollers.get('day')!
      monthScroll.refresh()
      dayScroll.refresh()

      this.scrollers.get('year')!.scrollTo(0, (solar.cYear - this.options.startYear) * h, 500)
      monthScroll.scrollTo(0, (solar.cMonth - 1) * h, 500)
      dayScroll.scrollTo(0, (solar.cDay - 1) * h, 500)
    }

    this.emit('change', this.getResult())
  }

  // ─── 面板事件（由 Vue 组件调用） ─────────────────────────────────────────

  /** 空方法，保留用于扩展 */
  private bindPanelEvents(): void {
    // 面板事件由外部 Vue 组件通过 confirm/cancel 方法触发
  }

  /** 确认选择 */
  confirm(): void {
    this.emit('confirm', this.getResult())
  }

  /** 取消选择 */
  cancel(): void {
    this.emit('cancel')
  }

  // ─── 结果构建 ────────────────────────────────────────────────────────────

  /**
   * 获取当前选中的日期时间结果
   * 返回包含公历、农历和时间信息的完整结果对象
   * 时间字段根据 timeFields 配置动态包含
   */
  getResult(): DateTimeResult {
    const s = this.state
    let info: LunarInfo | null

    if (s.calendarType === 'solar') {
      info = LunarCalendar.solar2lunar(s.year, s.month, s.day)
    } else {
      info = LunarCalendar.lunar2solar(s.year, s.month, s.day, s.isLeap)
    }

    if (!info) {
      throw new Error('Invalid date conversion')
    }

    const hour = typeof s.hour === 'number' ? s.hour : 0
    const minute = typeof s.minute === 'number' ? s.minute : 0
    const second = typeof s.second === 'number' ? s.second : 0
    const date = new Date(info.cYear, info.cMonth - 1, info.cDay, hour, minute, second)

    const result: DateTimeResult = {
      date,
      solar: {
        year: info.cYear,
        month: info.cMonth,
        day: info.cDay,
        week: info.nWeek,
        weekCn: info.ncWeek,
        astro: info.astro
      },
      lunar: {
        year: info.lYear,
        month: info.lMonth,
        day: info.lDay,
        isLeap: info.isLeap,
        yearCn: info.gzYear,
        monthCn: info.IMonthCn,
        dayCn: info.IDayCn,
        animal: info.Animal,
        gzMonth: info.gzMonth,
        gzDay: info.gzDay,
        isTerm: info.isTerm,
        term: info.Term
      },
      isToday: info.isToday
    }

    // 根据 timeFields 添加时间字段
    if (s.hour !== undefined) result.hour = s.hour
    if (s.minute !== undefined) result.minute = s.minute
    if (s.second !== undefined) result.second = s.second

    return result
  }

  /** 设置日期并滚动到对应位置 */
  setDate(date: Date): void {
    this.validateDateInRange(date, 'date')
    const lunar = LunarCalendar.solar2lunar(date.getFullYear(), date.getMonth() + 1, date.getDate())
    if (!lunar) {
      throw new Error('DateTimePickerCore: date is outside supported range')
    }

    if (this.state.calendarType === 'lunar') {
      this.state.year = lunar.lYear
      this.state.month = lunar.lMonth
      this.state.day = lunar.lDay
      this.state.isLeap = lunar.isLeap
    } else {
      this.state.year = date.getFullYear()
      this.state.month = date.getMonth() + 1
      this.state.day = date.getDate()
      this.state.isLeap = false
    }

    if (this.options.timeFields.includes('hour')) this.state.hour = date.getHours()
    if (this.options.timeFields.includes('minute')) this.state.minute = date.getMinutes()
    if (this.options.timeFields.includes('second')) this.state.second = date.getSeconds()

    const days =
      this.state.calendarType === 'lunar'
        ? this.state.isLeap
          ? LunarCalendar.leapDays(this.state.year)
          : LunarCalendar.monthDays(this.state.year, this.state.month)
        : LunarCalendar.solarDays(this.state.year, this.state.month)

    const leapMonth =
      this.state.calendarType === 'lunar' ? LunarCalendar.leapMonth(this.state.year) : 0

    this.renderYearCol()
    this.renderMonthCol(leapMonth)
    this.renderDayCol(days)
    if (this.options.timeFields.includes('hour')) this.renderHourCol()
    if (this.options.timeFields.includes('minute')) this.renderMinuteCol()
    if (this.options.timeFields.includes('second')) this.renderSecondCol()

    const h = this.itemHeight
    this.scrollers.forEach(s => s.refresh())
    this.scrollers.get('year')?.scrollTo(0, (this.state.year - this.options.startYear) * h, 300)
    this.scrollers
      .get('month')
      ?.scrollTo(0, this.lunarMonthToIndex(this.state.month, this.state.isLeap, leapMonth) * h, 300)
    this.scrollers.get('day')?.scrollTo(0, (this.state.day - 1) * h, 300)
    this.scrollers.get('hour')?.scrollTo(0, this.getTimePosition(this.state.hour, 23) * h, 300)
    this.scrollers.get('minute')?.scrollTo(0, this.getTimePosition(this.state.minute, 59) * h, 300)
    this.scrollers.get('second')?.scrollTo(0, this.getTimePosition(this.state.second, 59) * h, 300)
  }

  // ─── 事件系统 ────────────────────────────────────────────────────────────

  /** 注册事件监听器 */
  on(event: EventName, handler: DateTimePickerEventHandler | DateTimePickerCancelHandler): this {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(handler)
    return this
  }

  /** 移除事件监听器 */
  off(event: EventName, handler: DateTimePickerEventHandler | DateTimePickerCancelHandler): this {
    const handlers = this.listeners.get(event)
    if (handlers) {
      const idx = handlers.indexOf(handler)
      if (idx > -1) handlers.splice(idx, 1)
    }
    return this
  }

  /** 触发事件 */
  private emit(event: EventName, ...args: unknown[]): void {
    if (event === 'change') this.options.onChange(args[0] as DateTimeResult)
    if (event === 'confirm') this.options.onConfirm(args[0] as DateTimeResult)
    if (event === 'cancel') this.options.onCancel()
    this.listeners.get(event)?.forEach(fn => fn(...(args as [DateTimeResult])))
  }

  /** 销毁实例，清理所有资源 */
  destroy(): void {
    this.scrollers.forEach(s => s.destroy())
    this.scrollers.clear()
    this.listeners.clear()
    this.container.innerHTML = ''
  }
}
