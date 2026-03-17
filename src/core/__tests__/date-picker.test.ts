import { describe, it, expect, beforeEach } from 'vitest'
import { DatePickerCore } from '../date-picker/DatePickerCore'

describe('DatePickerCore', () => {
  let container: HTMLElement
  let picker: DatePickerCore

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
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

  it('应该支持事件监听', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1)
    })

    let called = false
    picker.on('change', (result) => {
      expect(result).toBeDefined()
      called = true
    })

    // 触发变化
    picker.setDate(new Date(2024, 1, 1))
    expect(called).toBe(true)
  })

  it('应该正确销毁', () => {
    picker = new DatePickerCore(container, {
      defaultDate: new Date(2024, 0, 1)
    })

    picker.destroy()
    expect(container.innerHTML).toBe('')
  })
})
