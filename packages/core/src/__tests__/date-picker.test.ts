import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveLocale } from '../locale'
import { DatePickerCore } from '../date-picker/DatePickerCore'

describe('DatePickerCore', () => {
  let container: HTMLElement
  let picker: DatePickerCore

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该在本地化字段为 undefined 时保留默认文案，并应用用户传入文案', () => {
    const locale = resolveLocale({
      confirm: undefined,
      cancel: undefined,
      solar: 'Solar',
      lunar: 'Lunar'
    })

    expect(locale.confirm).toBe('确定')
    expect(locale.cancel).toBe('取消')
    expect(locale.solar).toBe('Solar')
    expect(locale.lunar).toBe('Lunar')
  })

  it('应该正确初始化', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1)
    })

    expect(picker).toBeDefined()
    expect(container.children.length).toBeGreaterThan(0)
  })

  it('应该返回正确的日期结果', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1)
    })

    const result = picker.getResult()
    expect(result).toBeDefined()
    expect(result.date).toBeInstanceOf(Date)
    expect(result.solar).toBeDefined()
    expect(result.lunar).toBeDefined()
  })

  it('应该支持切换日历类型', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1)
    })

    picker.switchCalendarType('lunar')
    const result = picker.getResult()
    expect(result).toBeDefined()

    picker.switchCalendarType('solar')
    const result2 = picker.getResult()
    expect(result2).toBeDefined()
  })

  it('应该支持设置日期', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1)
    })

    const newDate = new Date(2024, 5, 15)
    picker.setDate(newDate)

    const result = picker.getResult()
    expect(result.solar.year).toBe(2024)
    expect(result.solar.month).toBe(6) // 月份是1-based
    expect(result.solar.day).toBe(15)
  })

  it('应该支持自定义起始年份', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(1905, 0, 1),
      startYear: 1900,
      endYear: 1910
    })

    const yearItems = container.querySelectorAll('.ldp-year-wrapper li')
    expect(yearItems[0]?.textContent).toBe('1900年')
    expect(picker.getResult().solar.year).toBe(1905)
  })

  it('should clamp endYear to the current year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 29))

    picker = new DatePickerCore(container, {
      defaultDate: new Date(2026, 0, 1),
      startYear: 2024,
      endYear: 2101
    })

    const yearItems = container.querySelectorAll('.ldp-year-wrapper li')
    const lastYear = yearItems[yearItems.length - 1] as HTMLElement
    expect(lastYear.dataset.value).toBe('2026')
  })

  it('should clamp startYear to the supported minimum year', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(1905, 0, 1),
      startYear: 1800,
      endYear: 1910
    })

    const yearItems = container.querySelectorAll('.ldp-year-wrapper li')
    const firstYear = yearItems[0] as HTMLElement
    expect(firstYear.dataset.value).toBe('1900')
    expect(picker.getResult().solar.year).toBe(1905)
  })

  it('should reset crossed year ranges to the supported range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 29))

    picker = new DatePickerCore(container, {
      defaultDate: new Date(2026, 0, 1),
      startYear: 2030,
      endYear: 2020
    })

    const yearItems = container.querySelectorAll('.ldp-year-wrapper li')
    const firstYear = yearItems[0] as HTMLElement
    const lastYear = yearItems[yearItems.length - 1] as HTMLElement
    expect(firstYear.dataset.value).toBe('1900')
    expect(lastYear.dataset.value).toBe('2026')
  })

  it('应该拒绝不在年份范围内的默认日期', () => {
    expect(
      () =>
        new DatePickerCore(container, {
          defaultDate: new Date(1905, 0, 1),
          startYear: 1910
        })
    ).toThrow('defaultDate year must be between')
  })

  it('今天文案应该使用内置兜底', () => {
    const today = new Date()
    picker = new DatePickerCore(container, {
      defaultDate: today
    })

    const todayItem = container.querySelector(
      `.ldp-day-wrapper li[data-value="${today.getDate()}"]`
    )
    expect(todayItem?.textContent).toBe('今天')
  })

  it('应该在农历模式下正确设置公历日期', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1),
      calendarMode: 'switch',
      defaultCalendar: 'lunar'
    })

    picker.setDate(new Date(2024, 0, 15))

    const result = picker.getResult()
    expect(result.solar.year).toBe(2024)
    expect(result.solar.month).toBe(1)
    expect(result.solar.day).toBe(15)
  })

  it('应该支持事件监听', () => {
    let called = false
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1),
      onChange: (result) => {
        expect(result).toBeDefined()
        called = true
      }
    })

    // 通过 on 方法注册监听器
    picker.on('change', (result) => {
      expect(result).toBeDefined()
    })

    picker.switchCalendarType('lunar')

    expect(called).toBe(true)
  })

  it('应该支持确认和取消回调', () => {
    let confirmed = false
    let canceled = false
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1),
      onConfirm: result => {
        expect(result.solar.year).toBe(2024)
        confirmed = true
      },
      onCancel: () => {
        canceled = true
      }
    })

    picker.confirm()
    picker.cancel()

    expect(confirmed).toBe(true)
    expect(canceled).toBe(true)
  })

  it('应该正确销毁', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1)
    })

    picker.destroy()
    expect(container.innerHTML).toBe('')
  })
})
