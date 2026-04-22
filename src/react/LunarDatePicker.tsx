import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DatePickerCore } from '../core/date-picker/DatePickerCore'
import type { DateResult } from '../core/types'

interface LunarDatePickerProps {
  show?: boolean
  value?: Date
  showLunar?: boolean
  endYear?: number
  color?: string
  confirmText?: string
  cancelText?: string
  onUpdateShow?: (val: boolean) => void
  onUpdateValue?: (val: Date) => void
  onConfirm?: (result: DateResult) => void
  onCancel?: () => void
  onChange?: (result: DateResult) => void
}

export function LunarDatePicker({
  show = false,
  value = new Date(),
  showLunar = true,
  endYear = new Date().getFullYear(),
  color = '#D03F3F',
  confirmText = '确定',
  cancelText = '取消',
  onUpdateShow,
  onUpdateValue,
  onConfirm,
  onCancel,
  onChange
}: LunarDatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<DatePickerCore | null>(null)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [isLunar, setIsLunar] = useState(false)

  function initCore() {
    if (!containerRef.current) return
    coreRef.current?.destroy()
    setIsLunar(false)
    coreRef.current = new DatePickerCore(containerRef.current, {
      defaultDate: value,
      showLunar,
      endYear,
      primaryColor: color,
      onChange: result => onChange?.(result)
    })
  }

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        initCore()
        requestAnimationFrame(() => setAnimating(true))
      }, 0)
      return () => clearTimeout(timer)
    } else {
      setAnimating(false)
      const timer = setTimeout(() => {
        setVisible(false)
        coreRef.current?.destroy()
        coreRef.current = null
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [show, value, showLunar, endYear, color, onChange])

  useEffect(() => {
    return () => { coreRef.current?.destroy() }
  }, [])

  function toggleLunar() {
    const next = !isLunar
    setIsLunar(next)
    coreRef.current?.switchCalendarType(next ? 'lunar' : 'solar')
  }

  function handleConfirm() {
    if (!coreRef.current) return
    const result = coreRef.current.getResult()
    onUpdateValue?.(result.date)
    onUpdateShow?.(false)
    onConfirm?.(result)
  }

  function handleCancel() {
    onUpdateShow?.(false)
    onCancel?.()
  }

  if (!visible) return null

  return createPortal(
    <div className="ldp-overlay">
      <div
        className={`ldp-mask${animating ? '' : ' ldp-leave'}`}
        onClick={handleCancel}
      />
      <div
        className={`ldp-layout${animating ? ' ldp-show' : ''}`}
        style={{ '--ldp-primary': color } as React.CSSProperties}
        onClick={e => e.stopPropagation()}
      >
        <div className="ldp-header">
          <div className="ldp-cancel" onClick={handleCancel}>{cancelText}</div>
          <div />
          <div className="ldp-confirm" onClick={handleConfirm}>{confirmText}</div>
        </div>

        <div ref={containerRef} className="ldp-container" />

        {showLunar && (
          <div className="ldp-footer">
            <div
              className={`ldp-lunar-toggle${isLunar ? ' active' : ''}`}
              onClick={toggleLunar}
            >
              <div className="ldp-lunar-circle" />
              <span>农历</span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
