import { LunarCalendar } from '../calendar/lunar'
import { Scroll } from '../scroll/Scroll'
import type { DateTimeResult, LunarInfo } from '../types'
import type {
  DateTimePickerCoreOptions,
  DateTimeState,
  DateTimePickerEventHandler,
  DateTimePickerCancelHandler
} from './types'

// 常量定义
const START_YEAR = 1910 // 起始年份
const ITEM_HEIGHT = 44 // 每个选项的高度（px）

type EventName = 'change' | 'confirm' | 'cancel'

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
  private options: Required<DateTimePickerCoreOptions>
  private state: DateTimeState
  private scrollers: Map<string, Scroll> = new Map()
  private itemHeight = ITEM_HEIGHT
  private listeners: Map<
    EventName,
    Array<DateTimePickerEventHandler | DateTimePickerCancelHandler>
  > = new Map()

  constructor(container: HTMLElement, options: DateTimePickerCoreOptions) {
    this.container = container
    this.options = {
      defaultDate: new Date(),
      type: 1,
      timeFields: ['hour', 'minute'], // 默认显示时分
      showUnit: true,
      unclearFirst: false,
      endYear: new Date().getFullYear(),
      primaryColor: '#D03F3F',
      onChange: () => {},
      onConfirm: () => {},
      onCancel: () => {},
      ...options
    }

    const d = this.options.defaultDate
    const calendarType = this.options.type === 2 ? 'lunar' : 'solar'
    const hasHour = this.options.timeFields.includes('hour')
    const hasMinute = this.options.timeFields.includes('minute')
    const hasSecond = this.options.timeFields.includes('second')

    // 初始化状态
    if (calendarType === 'lunar') {
      // type=2 默认农历，需要先转换
      const lunar = LunarCalendar.solar2lunar(d.getFullYear(), d.getMonth() + 1, d.getDate())
      this.state = {
        year: lunar?.lYear || d.getFullYear(),
        month: lunar?.lMonth || d.getMonth() + 1,
        day: lunar?.lDay || d.getDate(),
        hour: hasHour ? (this.options.unclearFirst ? '不清楚' : d.getHours()) : undefined,
        minute: hasMinute ? (this.options.unclearFirst ? '不清楚' : d.getMinutes()) : undefined,
        second: hasSecond ? d.getSeconds() : undefined,
        isLeap: lunar?.isLeap || false,
        calendarType: 'lunar'
      }
    } else {
      // type=0 或 type=1，默认公历
      this.state = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        hour: hasHour ? (this.options.unclearFirst ? '不清楚' : d.getHours()) : undefined,
        minute: hasMinute ? (this.options.unclearFirst ? '不清楚' : d.getMinutes()) : undefined,
        second: hasSecond ? d.getSeconds() : undefined,
        isLeap: false,
        calendarType: 'solar'
      }
    }

    this.render()
    this.initScrollers()
    this.bindPanelEvents()
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
   * 包含"不清楚"选项，位置由 unclearFirst 控制
   */
  private renderTimeItem(start: number, end: number, unit: string): string {
    const unclearValue = end + 1
    const items: string[] = []

    if (this.options.unclearFirst) {
      items.push(`<li data-value="${unclearValue}" class="ldp-row">不清楚</li>`)
    }

    for (let i = start; i <= end; i++) {
      const time = i < 10 ? '0' + i : String(i)
      const unitText = this.options.showUnit ? unit : ''
      items.push(`<li data-value="${i}" class="ldp-row">${time}${unitText}</li>`)
    }

    if (!this.options.unclearFirst) {
      items.push(`<li data-value="${unclearValue}" class="ldp-row">不清楚</li>`)
    }

    return items.join('')
  }

  private renderYearCol(): void {
    const el = this.container.querySelector('.ldp-year-wrapper .ldp-wrapper-ul')!
    el.innerHTML = this.renderItem(START_YEAR, this.options.endYear, 'year')
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
    const yearPos = s.year - START_YEAR
    const dayPos = s.day - 1
    const hourPos = this.options.unclearFirst ? 0 : typeof s.hour === 'number' ? s.hour : 0
    const minutePos = this.options.unclearFirst ? 0 : typeof s.minute === 'number' ? s.minute : 0

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
            this.state.hour = val === 24 ? '不清楚' : val
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
            this.state.minute = val === 60 ? '不清楚' : val
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
          defaultPlace: 0,
          callback: params => {
            const item = params.node[params.index] as HTMLElement
            this.state.second = parseInt(item.dataset.value!)
            this.emit('change', this.getResult())
          }
        })
      )
    }
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
      monthPos = this.state.month - 1
      if (leapMonth > 0 && (this.state.month > leapMonth || this.state.isLeap)) {
        monthPos = this.state.month
      }

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
      const isLeapMonth = item.textContent?.includes('闰') ?? false

      if (leapMonth > 0 && val === leapMonth && isLeapMonth) {
        // 选中的是闰月
        this.state.month = leapMonth
        this.state.isLeap = true
        days = LunarCalendar.leapDays(this.state.year)
      } else if (leapMonth > 0 && val > leapMonth) {
        // 闰月之后的月份
        this.state.month = val
        this.state.isLeap = false
        days = LunarCalendar.monthDays(this.state.year, val)
      } else {
        // 闰月之前的月份或没有闰月
        this.state.month = val + 1
        this.state.isLeap = false
        days = LunarCalendar.monthDays(this.state.year, val + 1)
      }
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
      let lMonth = lunar.lMonth - 1

      if (leapMonth !== 0) {
        this.renderMonthCol(leapMonth)
        if (leapMonth && (lunar.lMonth > leapMonth || lunar.isLeap)) {
          lMonth = lMonth + 1
        }
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

      this.scrollers.get('year')!.scrollTo(0, (lunar.lYear - START_YEAR) * h, 500)
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

      this.scrollers.get('year')!.scrollTo(0, (solar.cYear - START_YEAR) * h, 500)
      monthScroll.scrollTo(0, (solar.cMonth - 1) * h, 500)
      dayScroll.scrollTo(0, (solar.cDay - 1) * h, 500)
    }
  }

  // ─── 面板事件（由 Vue 组件调用） ─────────────────────────────────────────

  /** 空方法，保留用于扩展 */
  private bindPanelEvents(): void {
    // 面板事件由外部 Vue 组件通过 confirm/cancel 方法触发
  }

  /** 确认选择 */
  confirm(): void {
    const result = this.getResult()
    this.options.onConfirm(result)
    this.emit('confirm', result)
  }

  /** 取消选择 */
  cancel(): void {
    this.options.onCancel()
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
    this.state.year = date.getFullYear()
    this.state.month = date.getMonth() + 1
    this.state.day = date.getDate()

    const h = this.itemHeight
    this.scrollers.get('year')?.scrollTo(0, (this.state.year - START_YEAR) * h, 300)
    this.scrollers.get('month')?.scrollTo(0, (this.state.month - 1) * h, 300)
    this.scrollers.get('day')?.scrollTo(0, (this.state.day - 1) * h, 300)
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
