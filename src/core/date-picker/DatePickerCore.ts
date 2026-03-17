import { LunarCalendar } from '../calendar/lunar'
import { Scroll } from '../scroll/Scroll'
import type { DateResult, LunarInfo } from '../types'
import type {
  DatePickerCoreOptions,
  DatePickerState,
  DatePickerEventHandler,
  DatePickerCancelHandler
} from './types'

// 周几的中文简写
const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六']

// 常量定义
const ITEM_HEIGHT = 44 // 每个选项的高度（px）
const START_YEAR = 1910 // 起始年份

type EventName = 'change' | 'confirm' | 'cancel'

/**
 * DatePickerCore - 日期选择器核心类（只选日期，不含时间）
 *
 * 功能：
 * - 3列布局：年、月、日
 * - 日期列显示格式：1日周一、2日周二、今天
 * - 支持公历/农历切换
 * - 底部显示农历切换按钮（可选）
 */
export class DatePickerCore {
  private container: HTMLElement
  private options: Required<DatePickerCoreOptions>
  private state: DatePickerState
  private scrollers: Map<string, Scroll> = new Map()
  private itemHeight = ITEM_HEIGHT
  private listeners: Map<EventName, Array<DatePickerEventHandler | DatePickerCancelHandler>> =
    new Map()
  private today = new Date()

  constructor(container: HTMLElement, options: DatePickerCoreOptions = {}) {
    this.container = container

    const d = options.defaultDate || new Date()

    this.options = {
      defaultDate: d,
      showLunar: options.showLunar ?? true,
      endYear: options.endYear || new Date().getFullYear(),
      primaryColor: options.primaryColor || '#D03F3F',
      onChange: options.onChange || (() => {}),
      onConfirm: options.onConfirm || (() => {}),
      onCancel: options.onCancel || (() => {})
    }

    this.state = {
      year: d.getFullYear(),
      month: d.getMonth(), // 0-based
      day: d.getDate(),
      calendarType: 'solar',
      lYear: 0,
      lMonth: 0,
      lDay: 0,
      isLeap: false
    }

    this.render()
    this.initScrollers()
  }

  // ─── 渲染骨架 ─────────────────────────────────────────────────────────────

  private render(): void {
    this.container.innerHTML = `
      <div class="ldp-wrapper ldp-year-wrapper"><ul class="ldp-wrapper-ul"></ul></div>
      <div class="ldp-wrapper ldp-month-wrapper"><ul class="ldp-wrapper-ul"></ul></div>
      <div class="ldp-wrapper ldp-day-wrapper"><ul class="ldp-wrapper-ul"></ul></div>
    `
  }

  // ─── 生成列内容 ───────────────────────────────────────────────────────────

  /** 生成年份列表（1910 - endYear） */
  private buildYearItems(): string {
    const items: string[] = []
    for (let y = START_YEAR; y <= this.options.endYear; y++) {
      items.push(`<li data-value="${y}" class="ldp-row">${y}年</li>`)
    }
    return items.join('')
  }

  /** 生成公历月份列表（1-12月） */
  private buildSolarMonthItems(): string {
    const items: string[] = []
    for (let m = 0; m <= 11; m++) {
      items.push(`<li data-value="${m}" class="ldp-row">${m + 1}月</li>`)
    }
    return items.join('')
  }

  /** 生成农历月份列表（包含闰月处理） */
  private buildLunarMonthItems(lYear: number): string {
    const leapMonth = LunarCalendar.leapMonth(lYear)
    const items: string[] = []
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

  /** 生成公历日期列表（显示格式：1日周一、2日周二、今天） */
  private buildSolarDayItems(year: number, month: number): string {
    const dayCount = LunarCalendar.solarDays(year, month + 1)
    const items: string[] = []
    const todayY = this.today.getFullYear()
    const todayM = this.today.getMonth()
    const todayD = this.today.getDate()

    for (let d = 1; d <= dayCount; d++) {
      const date = new Date(year, month, d)
      const isToday = year === todayY && month === todayM && d === todayD
      const label = isToday ? '今天' : `${d}日周${WEEK_CN[date.getDay()]}`
      items.push(`<li data-value="${d}" class="ldp-row">${label}</li>`)
    }
    return items.join('')
  }

  /** 生成农历日期列表（显示格式：初一周一、初二周二、今天） */
  private buildLunarDayItems(lYear: number, lMonth: number, isLeap: boolean): string {
    const dayCount = isLeap ? LunarCalendar.leapDays(lYear) : LunarCalendar.monthDays(lYear, lMonth)
    const todayY = this.today.getFullYear()
    const todayM = this.today.getMonth()
    const todayD = this.today.getDate()
    const items: string[] = []

    for (let d = 1; d <= dayCount; d++) {
      const solar = LunarCalendar.lunar2solar(lYear, lMonth, d, isLeap)
      if (!solar) continue
      const isToday = solar.cYear === todayY && solar.cMonth - 1 === todayM && solar.cDay === todayD
      const label = isToday ? '今天' : `${LunarCalendar.toChinaDay(d)}周${WEEK_CN[solar.nWeek]}`
      items.push(`<li data-value="${d}" class="ldp-row">${label}</li>`)
    }
    return items.join('')
  }

  // ─── 初始化滚动 ───────────────────────────────────────────────────────────

  private initScrollers(): void {
    const s = this.state

    // 渲染初始内容
    this.container.querySelector('.ldp-year-wrapper .ldp-wrapper-ul')!.innerHTML =
      this.buildYearItems()
    this.container.querySelector('.ldp-month-wrapper .ldp-wrapper-ul')!.innerHTML =
      this.buildSolarMonthItems()
    this.container.querySelector('.ldp-day-wrapper .ldp-wrapper-ul')!.innerHTML =
      this.buildSolarDayItems(s.year, s.month)

    const firstRow = this.container.querySelector('.ldp-row') as HTMLElement
    this.itemHeight = firstRow?.clientHeight || ITEM_HEIGHT
    const h = this.itemHeight

    // 年
    this.scrollers.set(
      'year',
      new Scroll(this.container.querySelector('.ldp-year-wrapper') as HTMLElement, {
        step: true,
        defaultPlace: h * (s.year - START_YEAR),
        callback: params => this.onYearChange(params.index, params.node)
      })
    )

    // 月
    this.scrollers.set(
      'month',
      new Scroll(this.container.querySelector('.ldp-month-wrapper') as HTMLElement, {
        step: true,
        defaultPlace: h * s.month,
        callback: params => this.onMonthChange(params.index, params.node)
      })
    )

    // 日
    this.scrollers.set(
      'day',
      new Scroll(this.container.querySelector('.ldp-day-wrapper') as HTMLElement, {
        step: true,
        defaultPlace: h * (s.day - 1),
        callback: params => this.onDayChange(params.index, params.node)
      })
    )
  }

  // ─── 滚动回调 ─────────────────────────────────────────────────────────────

  private onYearChange(index: number, node: NodeListOf<ChildNode>): void {
    const item = node[index] as HTMLElement
    const year = parseInt(item.dataset.value!)
    if (isNaN(year)) return

    if (this.state.calendarType === 'solar') {
      this.state.year = year
      this.refreshDayCol()
    } else {
      this.state.lYear = year
      this.refreshLunarMonthCol()
      this.refreshLunarDayCol()
    }
    this.emit('change', this.getResult())
  }

  private onMonthChange(index: number, node: NodeListOf<ChildNode>): void {
    const item = node[index] as HTMLElement
    const val = parseInt(item.dataset.value!)
    if (isNaN(val)) return

    if (this.state.calendarType === 'solar') {
      this.state.month = val
      this.refreshDayCol()
    } else {
      const leapMonth = LunarCalendar.leapMonth(this.state.lYear)
      if (leapMonth > 0 && val === leapMonth) {
        this.state.lMonth = leapMonth
        this.state.isLeap = true
      } else if (leapMonth > 0 && val > leapMonth) {
        this.state.lMonth = val
        this.state.isLeap = false
      } else {
        this.state.lMonth = val + 1
        this.state.isLeap = false
      }
      this.refreshLunarDayCol()
    }
    this.emit('change', this.getResult())
  }

  private onDayChange(index: number, node: NodeListOf<ChildNode>): void {
    const item = node[index] as HTMLElement
    const val = parseInt(item.dataset.value!)
    if (isNaN(val)) return

    if (this.state.calendarType === 'solar') {
      this.state.day = val
    } else {
      this.state.lDay = val
    }
    this.emit('change', this.getResult())
  }

  // ─── 刷新列 ───────────────────────────────────────────────────────────────

  /** 刷新公历日期列（当年份或月份变化时调用） */
  private refreshDayCol(): void {
    const { year, month, day } = this.state
    const dayCount = LunarCalendar.solarDays(year, month + 1)
    const el = this.container.querySelector('.ldp-day-wrapper .ldp-wrapper-ul')!
    el.innerHTML = this.buildSolarDayItems(year, month)

    const newDay = Math.min(day, dayCount)
    this.state.day = newDay

    const scroller = this.scrollers.get('day')!
    scroller.refresh()
    scroller.scrollTo(0, this.itemHeight * (newDay - 1), 300)
  }

  /** 刷新农历月份列（当农历年份变化时调用） */
  private refreshLunarMonthCol(): void {
    const el = this.container.querySelector('.ldp-month-wrapper .ldp-wrapper-ul')!
    el.innerHTML = this.buildLunarMonthItems(this.state.lYear)

    const leapMonth = LunarCalendar.leapMonth(this.state.lYear)
    let monthPos = this.state.lMonth - 1
    if (leapMonth > 0 && (this.state.lMonth > leapMonth || this.state.isLeap)) {
      monthPos += 1
    }

    const scroller = this.scrollers.get('month')!
    scroller.refresh()
    scroller.scrollTo(0, this.itemHeight * monthPos, 300)
  }

  /** 刷新农历日期列（当农历年份或月份变化时调用） */
  private refreshLunarDayCol(): void {
    const { lYear, lMonth, isLeap, lDay } = this.state
    const dayCount = isLeap ? LunarCalendar.leapDays(lYear) : LunarCalendar.monthDays(lYear, lMonth)

    const el = this.container.querySelector('.ldp-day-wrapper .ldp-wrapper-ul')!
    el.innerHTML = this.buildLunarDayItems(lYear, lMonth, isLeap)

    const newDay = Math.min(lDay || 1, dayCount)
    this.state.lDay = newDay

    const scroller = this.scrollers.get('day')!
    scroller.refresh()
    scroller.scrollTo(0, this.itemHeight * (newDay - 1), 300)
  }

  // ─── 公历/农历切换 ────────────────────────────────────────────────────────

  /**
   * 切换日历类型（公历 <-> 农历）
   * 切换时会自动转换日期并更新所有列的显示
   */
  switchCalendarType(type: 'solar' | 'lunar'): void {
    if (this.state.calendarType === type) return
    const h = this.itemHeight

    if (type === 'lunar') {
      const lunar = LunarCalendar.solar2lunar(this.state.year, this.state.month + 1, this.state.day)
      if (!lunar) return

      this.state.calendarType = 'lunar'
      this.state.lYear = lunar.lYear
      this.state.lMonth = lunar.lMonth
      this.state.lDay = lunar.lDay
      this.state.isLeap = lunar.isLeap

      // 年列不变，只需滚动到农历年
      const yearScroller = this.scrollers.get('year')!
      const yearEl = this.container.querySelector('.ldp-year-wrapper .ldp-wrapper-ul')!
      yearEl.innerHTML = this.buildYearItems()
      yearScroller.refresh()
      yearScroller.scrollTo(0, h * (lunar.lYear - 1910), 500)

      // 月列切换为农历
      const leapMonth = LunarCalendar.leapMonth(lunar.lYear)
      let monthPos = lunar.lMonth - 1
      if (leapMonth > 0 && (lunar.lMonth > leapMonth || lunar.isLeap)) monthPos += 1

      const monthEl = this.container.querySelector('.ldp-month-wrapper .ldp-wrapper-ul')!
      monthEl.innerHTML = this.buildLunarMonthItems(lunar.lYear)
      const monthScroller = this.scrollers.get('month')!
      monthScroller.refresh()
      monthScroller.scrollTo(0, h * monthPos, 500)

      // 日列切换为农历
      const dayEl = this.container.querySelector('.ldp-day-wrapper .ldp-wrapper-ul')!
      dayEl.innerHTML = this.buildLunarDayItems(lunar.lYear, lunar.lMonth, lunar.isLeap)
      const dayScroller = this.scrollers.get('day')!
      dayScroller.refresh()
      dayScroller.scrollTo(0, h * (lunar.lDay - 1), 500)
    } else {
      const solar = LunarCalendar.lunar2solar(
        this.state.lYear,
        this.state.lMonth,
        this.state.lDay,
        this.state.isLeap
      )
      if (!solar) return

      this.state.calendarType = 'solar'
      this.state.year = solar.cYear
      this.state.month = solar.cMonth - 1
      this.state.day = solar.cDay

      const yearEl = this.container.querySelector('.ldp-year-wrapper .ldp-wrapper-ul')!
      yearEl.innerHTML = this.buildYearItems()
      const yearScroller = this.scrollers.get('year')!
      yearScroller.refresh()
      yearScroller.scrollTo(0, h * (solar.cYear - 1910), 500)

      const monthEl = this.container.querySelector('.ldp-month-wrapper .ldp-wrapper-ul')!
      monthEl.innerHTML = this.buildSolarMonthItems()
      const monthScroller = this.scrollers.get('month')!
      monthScroller.refresh()
      monthScroller.scrollTo(0, h * (solar.cMonth - 1), 500)

      const dayEl = this.container.querySelector('.ldp-day-wrapper .ldp-wrapper-ul')!
      dayEl.innerHTML = this.buildSolarDayItems(solar.cYear, solar.cMonth - 1)
      const dayScroller = this.scrollers.get('day')!
      dayScroller.refresh()
      dayScroller.scrollTo(0, h * (solar.cDay - 1), 500)
    }

    this.emit('change', this.getResult())
  }

  // ─── 结果 ─────────────────────────────────────────────────────────────────

  /**
   * 获取当前选中的日期结果
   * 返回包含公历和农历信息的完整结果对象
   */
  getResult(): DateResult {
    let info: LunarInfo | null

    if (this.state.calendarType === 'solar') {
      info = LunarCalendar.solar2lunar(this.state.year, this.state.month + 1, this.state.day)
    } else {
      info = LunarCalendar.lunar2solar(
        this.state.lYear,
        this.state.lMonth,
        this.state.lDay,
        this.state.isLeap
      )
    }

    if (!info) {
      throw new Error('Invalid date conversion')
    }

    return {
      date: new Date(info.cYear, info.cMonth - 1, info.cDay),
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
  }

  /** 设置日期并滚动到对应位置 */
  setDate(date: Date): void {
    this.state.year = date.getFullYear()
    this.state.month = date.getMonth()
    this.state.day = date.getDate()
    const h = this.itemHeight
    this.scrollers.get('year')?.scrollTo(0, h * (this.state.year - START_YEAR), 300)
    this.scrollers.get('month')?.scrollTo(0, h * this.state.month, 300)
    this.scrollers.get('day')?.scrollTo(0, h * (this.state.day - 1), 300)
  }

  // ─── 事件 ─────────────────────────────────────────────────────────────────

  /** 注册事件监听器 */
  on(event: EventName, handler: DatePickerEventHandler | DatePickerCancelHandler): this {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(handler)
    return this
  }

  /** 移除事件监听器 */
  off(event: EventName, handler: DatePickerEventHandler | DatePickerCancelHandler): this {
    const handlers = this.listeners.get(event)
    if (handlers) {
      const idx = handlers.indexOf(handler)
      if (idx > -1) handlers.splice(idx, 1)
    }
    return this
  }

  /** 触发事件 */
  private emit(event: EventName, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach(fn => fn(...(args as [DateResult])))
  }

  /** 销毁实例，清理所有资源 */
  destroy(): void {
    this.scrollers.forEach(s => s.destroy())
    this.scrollers.clear()
    this.listeners.clear()
    this.container.innerHTML = ''
  }
}
