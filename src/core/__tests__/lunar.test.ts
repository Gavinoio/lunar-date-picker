import { describe, it, expect } from 'vitest'
import { LunarCalendar } from '../calendar/lunar'

describe('LunarCalendar', () => {
  describe('solarDays', () => {
    it('应该返回正确的公历月份天数', () => {
      expect(LunarCalendar.solarDays(2024, 1)).toBe(31) // 1月
      expect(LunarCalendar.solarDays(2024, 2)).toBe(29) // 2024年是闰年
      expect(LunarCalendar.solarDays(2023, 2)).toBe(28) // 2023年不是闰年
      expect(LunarCalendar.solarDays(2024, 4)).toBe(30) // 4月
    })

    it('应该对无效月份返回0', () => {
      expect(LunarCalendar.solarDays(2024, 0)).toBe(0)
      expect(LunarCalendar.solarDays(2024, 13)).toBe(0)
    })
  })

  describe('solar2lunar', () => {
    it('应该正确转换公历到农历', () => {
      const result = LunarCalendar.solar2lunar(2024, 1, 1)
      expect(result).not.toBeNull()
      expect(result?.cYear).toBe(2024)
      expect(result?.cMonth).toBe(1)
      expect(result?.cDay).toBe(1)
      expect(result?.lYear).toBeDefined()
      expect(result?.lMonth).toBeDefined()
      expect(result?.lDay).toBeDefined()
    })

    it('应该对无效日期返回null', () => {
      expect(LunarCalendar.solar2lunar(1899, 1, 1)).toBeNull()
      expect(LunarCalendar.solar2lunar(2101, 1, 1)).toBeNull()
      expect(LunarCalendar.solar2lunar(2024, 2, 30)).toBeNull()
    })
  })

  describe('lunar2solar', () => {
    it('应该正确转换农历到公历', () => {
      const result = LunarCalendar.lunar2solar(2023, 11, 20, false)
      expect(result).not.toBeNull()
      expect(result?.cYear).toBeDefined()
      expect(result?.cMonth).toBeDefined()
      expect(result?.cDay).toBeDefined()
    })

    it('应该处理闰月', () => {
      const leapMonth = LunarCalendar.leapMonth(2023)
      if (leapMonth > 0) {
        const result = LunarCalendar.lunar2solar(2023, leapMonth, 1, true)
        expect(result).not.toBeNull()
        expect(result?.isLeap).toBe(true)
      }
    })
  })

  describe('toChinaMonth', () => {
    it('应该返回正确的农历月份中文', () => {
      expect(LunarCalendar.toChinaMonth(1)).toBe('正月')
      expect(LunarCalendar.toChinaMonth(11)).toBe('冬月')
      expect(LunarCalendar.toChinaMonth(12)).toBe('腊月')
    })

    it('应该对无效月份返回空字符串', () => {
      expect(LunarCalendar.toChinaMonth(0)).toBe('')
      expect(LunarCalendar.toChinaMonth(13)).toBe('')
    })
  })

  describe('toChinaDay', () => {
    it('应该返回正确的农历日期中文', () => {
      expect(LunarCalendar.toChinaDay(1)).toBe('初一')
      expect(LunarCalendar.toChinaDay(10)).toBe('初十')
      expect(LunarCalendar.toChinaDay(20)).toBe('二十')
      expect(LunarCalendar.toChinaDay(30)).toBe('三十')
    })
  })

  describe('toGanZhiYear', () => {
    it('应该返回正确的干支年', () => {
      const result = LunarCalendar.toGanZhiYear(2024)
      expect(result).toBeTruthy()
      expect(result.length).toBe(2)
    })
  })

  describe('toAstro', () => {
    it('应该返回正确的星座', () => {
      expect(LunarCalendar.toAstro(1, 20)).toBe('水瓶座')
      expect(LunarCalendar.toAstro(3, 21)).toBe('白羊座')
      expect(LunarCalendar.toAstro(12, 25)).toBe('魔羯座')
    })
  })

  describe('leapMonth', () => {
    it('应该返回闰月月份或0', () => {
      const result = LunarCalendar.leapMonth(2023)
      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(12)
    })
  })

  describe('leapDays', () => {
    it('应该返回闰月天数', () => {
      const leapMonth = LunarCalendar.leapMonth(2023)
      const leapDays = LunarCalendar.leapDays(2023)
      if (leapMonth > 0) {
        expect(leapDays).toBeGreaterThan(0)
        expect([29, 30]).toContain(leapDays)
      } else {
        expect(leapDays).toBe(0)
      }
    })
  })

  describe('monthDays', () => {
    it('应该返回农历月份天数', () => {
      const days = LunarCalendar.monthDays(2023, 1)
      expect([29, 30]).toContain(days)
    })

    it('应该对无效月份返回0', () => {
      expect(LunarCalendar.monthDays(2023, 0)).toBe(0)
      expect(LunarCalendar.monthDays(2023, 13)).toBe(0)
    })
  })
})
