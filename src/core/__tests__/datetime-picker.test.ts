import { describe, it, expect, beforeEach } from 'vitest'
import { DateTimePickerCore } from '../datetime-picker/DateTimePickerCore'

describe('DateTimePickerCore', () => {
  let container: HTMLElement
  let picker: DateTimePickerCore

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
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

  it('应该支持"不清楚"选项', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1),
      timeFields: ['hour', 'minute'],
      unclearFirst: true
    })

    const result = picker.getResult()
    expect(result).toBeDefined()
  })

  it('应该支持切换日历类型', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30),
      type: 1
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
  })

  it('应该正确销毁', () => {
    picker = new DateTimePickerCore(container, {
      defaultDate: new Date(2024, 0, 1, 12, 30)
    })

    picker.destroy()
    expect(container.innerHTML).toBe('')
  })
})
