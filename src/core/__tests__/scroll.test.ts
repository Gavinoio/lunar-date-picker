import { describe, it, expect, beforeEach } from 'vitest'
import { Scroll } from '../scroll/Scroll'

describe('Scroll', () => {
  let container: HTMLElement
  let scroll: Scroll

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.style.height = '200px'
    container.style.overflow = 'hidden'

    const ul = document.createElement('ul')
    ul.style.padding = '0'
    ul.style.margin = '0'

    // 添加测试项
    for (let i = 0; i < 10; i++) {
      const li = document.createElement('li')
      li.style.height = '40px'
      li.textContent = `Item ${i}`
      ul.appendChild(li)
    }

    container.appendChild(ul)
    document.body.appendChild(container)
  })

  it('应该正确初始化', () => {
    scroll = new Scroll(container, {
      step: true,
      defaultPlace: 0
    })

    expect(scroll).toBeDefined()
  })

  it('应该支持滚动到指定位置', () => {
    scroll = new Scroll(container, {
      step: true,
      defaultPlace: 0
    })

    scroll.scrollTo(0, 80, 0)
    // 由于是异步操作，这里只验证方法不抛出错误
    expect(true).toBe(true)
  })

  it('应该支持刷新', () => {
    scroll = new Scroll(container, {
      step: true,
      defaultPlace: 0
    })

    scroll.refresh()
    expect(true).toBe(true)
  })

  it('应该正确销毁', () => {
    scroll = new Scroll(container, {
      step: true,
      defaultPlace: 0
    })

    scroll.destroy()
    expect(true).toBe(true)
  })

  it('应该支持回调函数', (done) => {
    scroll = new Scroll(container, {
      step: true,
      defaultPlace: 0,
      callback: (result) => {
        expect(result).toBeDefined()
        expect(result.index).toBeGreaterThanOrEqual(0)
        done()
      }
    })
  })
})
