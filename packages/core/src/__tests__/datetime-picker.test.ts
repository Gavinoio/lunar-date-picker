import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DateTimePickerCore } from '../datetime-picker/DateTimePickerCore'

describe('DateTimePickerCore', () => {
  let container: HTMLElement
  let picker: DateTimePickerCore

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该正确初始化', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30)
    })

    expect(picker).toBeDefined()
    expect(container.children.length).toBeGreaterThan(0)
  })

  it('应该返回正确的日期时间结果', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30),
      timeFields: ['hour', 'minute']
    })

    const result = picker.getResult()
    expect(result).toBeDefined()
    expect(result.date).toBeInstanceOf(Date)
    expect(result.solar).toBeDefined()
    expect(result.lunar).toBeDefined()
    expect(result.hour).toBeDefined()
    expect(result.minute).toBeDefined()
  })

  it('应该支持只显示小时', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30),
      timeFields: ['hour']
    })

    const result = picker.getResult()
    expect(result.hour).toBeDefined()
    expect(result.minute).toBeUndefined()
    expect(result.second).toBeUndefined()
  })

  it('应该支持显示秒', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30, 45),
      timeFields: ['hour', 'minute', 'second']
    })

    const result = picker.getResult()
    expect(result.hour).toBeDefined()
    expect(result.minute).toBeDefined()
    expect(result.second).toBeDefined()
  })

  it('应该允许省略配置参数', () => {
    picker = new DateTimePickerCore(container)

    expect(picker.getResult()).toBeDefined()
  })

  it('应该支持"不清楚"选项', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1),
      timeFields: ['hour', 'minute', 'second'],
      unclearPosition: 'first'
    })

    const result = picker.getResult()
    expect(result.hour).toBe('不清楚')
    expect(result.minute).toBe('不清楚')
    expect(result.second).toBe('不清楚')
  })

  it('不清楚展示文案应该使用内置兜底', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1),
      timeFields: ['hour'],
      unclearPosition: 'first'
    })

    expect(container.querySelector('.ldp-hour-wrapper li')?.textContent).toBe('不清楚')
    expect(picker.getResult().hour).toBe('不清楚')
  })

  it('应该拒绝不在年份范围内的默认日期', () => {
    expect(
      () =>
        new DateTimePickerCore(container, {
          defaultDate: new Date(1905, 0, 1),
          startYear: 1910
        })
    ).toThrow('defaultDate year must be between')
  })

  it('should clamp endYear to the current year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 29))

    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2026, 0, 1),
      startYear: 2024,
      endYear: 2101
    })

    const yearItems = container.querySelectorAll('.ldp-year-wrapper li')
    const lastYear = yearItems[yearItems.length - 1] as HTMLElement
    expect(lastYear.dataset.value).toBe('2026')
  })

  it('should clamp startYear to the supported minimum year', () => {
    picker = new DateTimePickerCore(container, {
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

    picker = new DateTimePickerCore(container, {
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

  it('应该支持隐藏"不清楚"选项', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 8, 15, 30),
      timeFields: ['hour', 'minute', 'second'],
      showUnclear: false,
      unclearPosition: 'first'
    })

    const result = picker.getResult()
    expect(result.hour).toBe(8)
    expect(result.minute).toBe(15)
    expect(result.second).toBe(30)
  })

  it('应该支持切换日历类型', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30),
      calendarMode: 'switch'
    })

    picker.switchCalendarType('lunar')
    const result = picker.getResult()
    expect(result).toBeDefined()

    picker.switchCalendarType('solar')
    const result2 = picker.getResult()
    expect(result2).toBeDefined()
  })

  it('应该支持设置日期', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30)
    })

    const newDate = new Date(2024, 5, 15, 14, 45)
    picker.setDate(newDate)

    const result = picker.getResult()
    expect(result.solar.year).toBe(2024)
    expect(result.solar.month).toBe(6)
    expect(result.solar.day).toBe(15)
    expect(result.hour).toBe(14)
    expect(result.minute).toBe(45)
  })

  it('应该在农历模式下正确设置公历日期和时间', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30),
      calendarMode: 'switch',
      defaultCalendar: 'lunar',
      timeFields: ['hour', 'minute']
    })

    picker.setDate(new Date(2024, 0, 15, 14, 45))

    const result = picker.getResult()
    expect(result.solar.year).toBe(2024)
    expect(result.solar.month).toBe(1)
    expect(result.solar.day).toBe(15)
    expect(result.hour).toBe(14)
    expect(result.minute).toBe(45)
  })

  it('应该触发 onChange、confirm 和 cancel 回调', () => {
    let changed = false
    let confirmed = false
    let canceled = false
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30),
      calendarMode: 'switch',
      onChange: result => {
        expect(result).toBeDefined()
        changed = true
      },
      onConfirm: result => {
        expect(result).toBeDefined()
        confirmed = true
      },
      onCancel: () => {
        canceled = true
      }
    })

    picker.switchCalendarType('lunar')
    picker.confirm()
    picker.cancel()

    expect(changed).toBe(true)
    expect(confirmed).toBe(true)
    expect(canceled).toBe(true)
  })

  it('应该正确销毁', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30)
    })

    picker.destroy()
    expect(container.innerHTML).toBe('')
  })
})
