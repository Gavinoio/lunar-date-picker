import type { ScrollOptions } from './types'

// 常量定义
const MIN_MOVE_DISTANCE = 10 // 最小移动距离（px）
const QUICK_SWIPE_DURATION = 300 // 快速滑动的时间阈值（ms）
const INERTIA_MULTIPLIER = 10 // 惯性滚动的速度倍数

/**
 * 移动端触摸滚动控制类
 * 支持惯性滚动、边界回弹、步长吸附
 */
export class Scroll {
  private scroller: HTMLElement
  private childNode: HTMLElement
  private options: Required<ScrollOptions>

  private startPageY = 0
  private startTime = 0
  private endTime = 0
  private offsetTop = 0 // 上一次滚动位置

  private scrollerHeight = 0
  private childNodeHeight = 0
  private scrollHeight = 0
  private stepLen = 0

  // 保存绑定后的事件处理器引用，用于正确移除监听器
  private boundHandleTouchStart: (e: TouchEvent) => void
  private boundHandleTouchMove: (e: TouchEvent) => void
  private boundHandleTouchEnd: (e: TouchEvent) => void

  constructor(el: string | HTMLElement, options: ScrollOptions = {}) {
    this.scroller = typeof el === 'string' ? document.querySelector(el)! : el
    this.childNode = this.scroller.children[0] as HTMLElement

    this.options = {
      step: true,
      defaultPlace: 0,
      callback: () => {},
      ...options
    }

    this.scrollerHeight = this.scroller.clientHeight
    this.childNodeHeight = this.childNode.clientHeight
    this.scrollHeight = this.childNodeHeight - this.scrollerHeight

    const childNodes = this.childNode.childNodes
    this.stepLen = childNodes.length > 0 ? (childNodes[0] as HTMLElement).clientHeight : 0

    const defaultPlace = this.options.defaultPlace || 0
    this.scrollTo(0, defaultPlace)

    // 绑定事件处理器并保存引用
    this.boundHandleTouchStart = this.handleTouchStart.bind(this)
    this.boundHandleTouchMove = this.handleTouchMove.bind(this)
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this)

    this.bindEvents()
  }

  private bindEvents(): void {
    this.scroller.addEventListener('touchstart', this.boundHandleTouchStart, false)
    this.scroller.addEventListener('touchmove', this.boundHandleTouchMove, false)
    this.scroller.addEventListener('touchend', this.boundHandleTouchEnd, false)
  }

  private handleTouchStart(e: TouchEvent): void {
    e.stopPropagation()
    e.preventDefault()

    this.startTime = this.getTime()
    const touch = e.touches[0]
    this.startPageY = touch.pageY

    this.browserVendor('transition', 'none')
  }

  private handleTouchMove(e: TouchEvent): void {
    e.stopPropagation()
    e.preventDefault()

    const timestamp = this.getTime()
    const touch = e.touches[0]

    const diffPageY = touch.pageY - this.startPageY
    let movePageY = diffPageY + this.offsetTop

    // 最少移动指定距离
    if (
      timestamp - this.endTime > QUICK_SWIPE_DURATION &&
      Math.abs(diffPageY) < MIN_MOVE_DISTANCE
    ) {
      return
    }

    // 超过边缘滚动有阻力
    if (movePageY > 0) {
      movePageY /= 3
    } else if (Math.abs(movePageY) > Math.abs(this.scrollHeight)) {
      movePageY = Math.abs(this.scrollHeight) - Math.abs(movePageY)
      movePageY = movePageY / 3 - this.scrollHeight
    }

    this.browserVendor('transform', `translate(0, ${movePageY}px)`)
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.stopPropagation()
    e.preventDefault()

    this.endTime = this.getTime()
    const duration = this.endTime - this.startTime

    const touch = e.changedTouches[0]
    const offsetHeight = touch.pageY - this.startPageY
    this.offsetTop += offsetHeight

    if (this.offsetTop > 0 || Math.abs(this.offsetTop) > Math.abs(this.scrollHeight)) {
      // 上边缘&下边缘
      this.browserVendor('transition', 'all 500ms')
    } else if (duration < QUICK_SWIPE_DURATION) {
      // 惯性滚动
      const speed = Math.abs(offsetHeight) / duration
      let moveTime = duration * speed * 20
      moveTime = moveTime > 2000 ? 2000 : moveTime
      this.offsetTop += offsetHeight * speed * INERTIA_MULTIPLIER

      this.browserVendor('transitionProperty', 'all')
      this.browserVendor('transitionDuration', `${moveTime}ms`)
      this.browserVendor('transitionTimingFunction', 'cubic-bezier(0.1, 0.57, 0.1, 1)')
    } else {
      this.browserVendor('transition', 'all 500ms')
    }

    if (this.offsetTop > 0) {
      this.offsetTop = 0
    } else if (Math.abs(this.offsetTop) > Math.abs(this.scrollHeight)) {
      this.offsetTop = -this.scrollHeight
    }

    // 步长模式
    if (this.options.step && this.stepLen > 0) {
      const nowEndY = this.offsetTop
      const h = Math.abs(nowEndY % this.stepLen)
      const halfHeight = this.stepLen / 2

      const moveY = h >= halfHeight ? nowEndY - this.stepLen + h : nowEndY + h
      const index = parseInt(String(Math.abs(moveY) / this.stepLen))

      this.options.callback({
        index,
        node: this.childNode.childNodes as NodeListOf<ChildNode>
      })

      this.offsetTop = moveY
    }

    this.browserVendor('transform', `translate(0, ${this.offsetTop}px)`)
  }

  /** 滚动到指定位置 */
  scrollTo(_x: number, y: number, time?: number): void {
    if (time && time > 0) {
      this.browserVendor('transitionProperty', 'all')
      this.browserVendor('transitionDuration', `${time}ms`)
      this.browserVendor('transitionTimingFunction', 'cubic-bezier(0.1, 0.57, 0.1, 1)')
    } else {
      this.browserVendor('transition', 'none')
    }

    y = -y
    this.offsetTop = y
    this.browserVendor('transform', `translate(0, ${y}px)`)
  }

  /** 刷新 */
  refresh(): void {
    this.childNode = this.scroller.children[0] as HTMLElement
    this.startPageY = 0
    this.startTime = 0
    this.endTime = 0
    this.offsetTop = 0

    this.scrollerHeight = this.scroller.clientHeight
    this.childNodeHeight = this.childNode.clientHeight
    this.scrollHeight = this.childNodeHeight - this.scrollerHeight

    const childNodes = this.childNode.childNodes
    this.stepLen = childNodes.length > 0 ? (childNodes[0] as HTMLElement).clientHeight : 0

    this.scrollTo(0, 0, 500)
  }

  /** 销毁 */
  destroy(): void {
    this.scroller.removeEventListener('touchstart', this.boundHandleTouchStart)
    this.scroller.removeEventListener('touchmove', this.boundHandleTouchMove)
    this.scroller.removeEventListener('touchend', this.boundHandleTouchEnd)
  }

  /** 浏览器兼容 */
  private browserVendor(styleStr: string, value: string): void {
    const vendors = ['t', 'WebkitT', 'MozT', 'msT', 'OT']
    const elementStyle = this.childNode.style

    for (let i = 0; i < vendors.length; i++) {
      const styleObj = vendors[i] + styleStr.slice(1)
      if (styleObj in elementStyle) {
        (elementStyle as unknown as Record<string, string>)[styleObj] = value
      }
    }
  }

  /** 获取当前时间 */
  private getTime(): number {
    return Date.now()
  }
}
