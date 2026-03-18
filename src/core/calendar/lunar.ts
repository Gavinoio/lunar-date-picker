import type { LunarInfo } from '../types'
import {
  lunarInfo,
  solarMonth,
  Gan,
  Zhi,
  Animals,
  solarTerm,
  sTermInfo,
  nStr1,
  nStr2,
  nStr3
} from './constants'

export class LunarCalendar {
  /** 返回农历y年一整年的总天数 */
  static lYearDays(y: number): number {
    let sum = 348
    for (let i = 0x8000; i > 0x8; i >>= 1) {
      sum += lunarInfo[y - 1900] & i ? 1 : 0
    }
    return sum + this.leapDays(y)
  }

  /** 返回农历y年闰月是哪个月；若y年没有闰月则返回0 */
  static leapMonth(y: number): number {
    return lunarInfo[y - 1900] & 0xf
  }

  /** 返回农历y年闰月的天数，若该年没有闰月则返回0 */
  static leapDays(y: number): number {
    if (this.leapMonth(y)) {
      return lunarInfo[y - 1900] & 0x10000 ? 30 : 29
    }
    return 0
  }

  /** 返回农历y年m月（非闰月）的总天数 */
  static monthDays(y: number, m: number): number {
    if (m > 12 || m < 1) return 0
    return lunarInfo[y - 1900] & (0x10000 >> m) ? 30 : 29
  }

  /** 返回公历y年m月的天数 */
  static solarDays(y: number, m: number): number {
    if (m > 12 || m < 1) return 0
    const ms = m - 1
    if (ms === 1) {
      return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28
    }
    return solarMonth[ms]
  }

  /** 农历年份转换为干支纪年 */
  static toGanZhiYear(lYear: number): string {
    let ganKey = (lYear - 3) % 10
    let zhiKey = (lYear - 3) % 12
    if (ganKey === 0) ganKey = 10
    if (zhiKey === 0) zhiKey = 12
    return Gan[ganKey - 1] + Zhi[zhiKey - 1]
  }

  /** 公历月、日判断所属星座 */
  static toAstro(cMonth: number, cDay: number): string {
    const s = '魔羯水瓶双鱼白羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯'
    const arr = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22]
    return (
      s.slice(
        cMonth * 2 - (cDay < arr[cMonth - 1] ? 2 : 0),
        cMonth * 2 - (cDay < arr[cMonth - 1] ? 2 : 0) + 2
      ) + '座'
    )
  }

  /** 传入offset偏移量返回干支 */
  static toGanZhi(offset: number): string {
    return Gan[offset % 10] + Zhi[offset % 12]
  }

  /** 传入公历y年获得该年第n个节气的公历日期 */
  static getTerm(y: number, n: number): number {
    if (y < 1900 || y > 2100) return 0
    if (n < 1 || n > 24) return 0
    const _table = sTermInfo[y - 1900]
    const _info = [
      parseInt('0x' + _table.slice(0, 5), 16).toString(),
      parseInt('0x' + _table.slice(5, 10), 16).toString(),
      parseInt('0x' + _table.slice(10, 15), 16).toString(),
      parseInt('0x' + _table.slice(15, 20), 16).toString(),
      parseInt('0x' + _table.slice(20, 25), 16).toString(),
      parseInt('0x' + _table.slice(25, 30), 16).toString()
    ]
    const _calday = [
      _info[0].slice(0, 1),
      _info[0].slice(1, 3),
      _info[0].slice(3, 4),
      _info[0].slice(4, 6),
      _info[1].slice(0, 1),
      _info[1].slice(1, 3),
      _info[1].slice(3, 4),
      _info[1].slice(4, 6),
      _info[2].slice(0, 1),
      _info[2].slice(1, 3),
      _info[2].slice(3, 4),
      _info[2].slice(4, 6),
      _info[3].slice(0, 1),
      _info[3].slice(1, 3),
      _info[3].slice(3, 4),
      _info[3].slice(4, 6),
      _info[4].slice(0, 1),
      _info[4].slice(1, 3),
      _info[4].slice(3, 4),
      _info[4].slice(4, 6),
      _info[5].slice(0, 1),
      _info[5].slice(1, 3),
      _info[5].slice(3, 4),
      _info[5].slice(4, 6)
    ]
    return parseInt(_calday[n - 1])
  }

  /** 传入农历数字月份返回汉语通俗表示法 */
  static toChinaMonth(m: number): string {
    if (m > 12 || m < 1) return ''
    return nStr3[m - 1] + '月'
  }

  /** 传入农历日期数字返回汉字表示法 */
  static toChinaDay(d: number): string {
    switch (d) {
      case 10:
        return '初十'
      case 20:
        return '二十'
      case 30:
        return '三十'
      default:
        return nStr2[Math.floor(d / 10)] + nStr1[d % 10]
    }
  }

  /** 年份转生肖 */
  static getAnimal(y: number): string {
    return Animals[(y - 4) % 12]
  }

  /** 传入阳历年月日获得详细的公历、农历object信息 */
  static solar2lunar(y: number, m: number, d: number): LunarInfo | null {
    if (y < 1900 || y > 2100) return null
    if (y === 1900 && m === 1 && d < 31) return null

    const objDate = new Date(y, parseInt(String(m)) - 1, d)
    let i: number,
      leap = 0,
      temp = 0

    const cy = objDate.getFullYear()
    const cm = objDate.getMonth() + 1
    const cd = objDate.getDate()

    // 验证日期是否被 Date 对象自动修正（如 2024-02-30 会变成 2024-03-01）
    if (cy !== y || cm !== m || cd !== d) return null

    let offset =
      (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) -
        Date.UTC(1900, 0, 31)) /
      86400000

    for (i = 1900; i < 2101 && offset > 0; i++) {
      temp = this.lYearDays(i)
      offset -= temp
    }
    if (offset < 0) {
      offset += temp
      i--
    }

    const isTodayObj = new Date()
    const isToday =
      isTodayObj.getFullYear() === cy &&
      isTodayObj.getMonth() + 1 === cm &&
      isTodayObj.getDate() === cd

    const nWeek = objDate.getDay()
    const cWeek = nStr1[nWeek]
    const adjustedNWeek = nWeek === 0 ? 7 : nWeek

    const year = i
    leap = this.leapMonth(i)
    let isLeap = false

    for (i = 1; i < 13 && offset > 0; i++) {
      if (leap > 0 && i === leap + 1 && !isLeap) {
        --i
        isLeap = true
        temp = this.leapDays(year)
      } else {
        temp = this.monthDays(year, i)
      }
      if (isLeap && i === leap + 1) isLeap = false
      offset -= temp
    }

    if (offset === 0 && leap > 0 && i === leap + 1) {
      if (isLeap) {
        isLeap = false
      } else {
        isLeap = true
        --i
      }
    }
    if (offset < 0) {
      offset += temp
      --i
    }

    const month = i
    const day = offset + 1
    const sm = cm - 1
    const gzY = this.toGanZhiYear(year)
    const firstNode = this.getTerm(cy, cm * 2 - 1)
    const secondNode = this.getTerm(cy, cm * 2)
    let gzM = this.toGanZhi((cy - 1900) * 12 + cm + 11)
    if (cd >= firstNode) {
      gzM = this.toGanZhi((cy - 1900) * 12 + cm + 12)
    }

    let isTerm = false
    let Term: string | null = null
    if (firstNode === cd) {
      isTerm = true
      Term = solarTerm[cm * 2 - 2]
    }
    if (secondNode === cd) {
      isTerm = true
      Term = solarTerm[cm * 2 - 1]
    }

    const dayCyclical = Date.UTC(cy, sm, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10
    const gzD = this.toGanZhi(dayCyclical + cd - 1)
    const astro = this.toAstro(cm, cd)

    return {
      lYear: year,
      lMonth: month,
      lDay: day,
      Animal: this.getAnimal(year),
      IMonthCn: (isLeap ? '闰' : '') + this.toChinaMonth(month),
      IDayCn: this.toChinaDay(day),
      cYear: cy,
      cMonth: cm,
      cDay: cd,
      gzYear: gzY,
      gzMonth: gzM,
      gzDay: gzD,
      isToday,
      isLeap,
      nWeek: adjustedNWeek,
      ncWeek: '星期' + cWeek,
      isTerm,
      Term,
      astro
    }
  }

  /** 传入农历年月日获得详细的公历、农历object信息 */
  static lunar2solar(y: number, m: number, d: number, isLeapMonth = false): LunarInfo | null {
    const leapMonth = this.leapMonth(y)
    if (isLeapMonth && leapMonth !== m) return null
    if ((y === 2100 && m === 12 && d > 1) || (y === 1900 && m === 1 && d < 31)) return null

    const day = this.monthDays(y, m)
    const _day = isLeapMonth ? this.leapDays(y) : day
    if (y < 1900 || y > 2100 || d > _day) return null

    let offset = 0
    for (let i = 1900; i < y; i++) {
      offset += this.lYearDays(i)
    }

    let leap = 0,
      isAdd = false
    for (let i = 1; i < m; i++) {
      leap = this.leapMonth(y)
      if (!isAdd && leap <= i && leap > 0) {
        offset += this.leapDays(y)
        isAdd = true
      }
      offset += this.monthDays(y, i)
    }

    if (isLeapMonth) offset += day

    const stmap = Date.UTC(1900, 1, 30, 0, 0, 0)
    const calObj = new Date((offset + d - 31) * 86400000 + stmap)
    const cY = calObj.getUTCFullYear()
    const cM = calObj.getUTCMonth() + 1
    const cD = calObj.getUTCDate()

    return this.solar2lunar(cY, cM, cD)
  }
}
