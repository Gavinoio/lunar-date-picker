import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DateTimePickerCore } from '../core/datetime-picker/DateTimePickerCore'
import type { DateTimeResult, PickerType, TimeField } from '../core/types'

interface LunarDateTimePickerProps {
  show?: boolean
  value?: Date
  type?: PickerType
  timeFields?: TimeField[]
  showUnit?: boolean
  unclearFirst?: boolean
  endYear?: number
  color?: string
  confirmText?: string
  cancelText?: string
  onUpdateShow?: (val: boolean) => void
  onUpdateValue?: (val: Date) => void
  onConfirm?: (result: DateTimeResult) => void
  onCancel?: () => void
  onChange?: (result: DateTimeResult) => void
}

function typeToTab(type: PickerType): 'solar' | 'lunar' {
  return type === 2 ? 'lunar' : 'solar'
}

export function LunarDateTimePicker({
  show = false,
  value = new Date(),
  type = 1,
  timeFields = ['hour', 'minute'],
  showUnit = true,
  unclearFirst = false,
  endYear = new Date().getFullYear(),
  color = '#D03F3F',
  confirmText = '确定',
  cancelText = '取消',
  onUpdateShow,
  onUpdateValue,
  onConfirm,
  onCancel,
  onChange
}: LunarDateTimePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<DateTimePickerCore | null>(null)
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState<'solar' | 'lunar'>(typeToTab(type))

  function initCore() {
    if (!containerRef.current) return
    coreRef.current?.destroy()
    setActiveTab(typeToTab(type))
    coreRef.current = new DateTimePickerCore(containerRef.current, {
      defaultDate: value,
      type,
      timeFields,
      showUnit,
      unclearFirst,
      endYear,
      primaryColor: color,
      onChange: result => onChange?.(result),
      onConfirm: () => {},
      onCancel: () => {}
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
  }, [show, value, timeFields, showUnit, unclearFirst, endYear, color, onChange])

  useEffect(() => {
    if (value && coreRef.current) coreRef.current.setDate(value)
  }, [value])

  useEffect(() => {
    const nextTab = typeToTab(type)
    setActiveTab(nextTab)
    coreRef.current?.switchCalendarType(nextTab)
  }, [type])

  useEffect(() => {
    return () => { coreRef.current?.destroy() }
  }, [])

  function switchTab(tab: 'solar' | 'lunar') {
    if (activeTab === tab) return
    setActiveTab(tab)
    coreRef.current?.switchCalendarType(tab)
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

          {type !== 0 ? (
            <div className="ldp-btn-group">
              <div
                className={`ldp-solar-btn ldp-btn${activeTab === 'solar' ? ' active' : ''}`}
                onClick={() => switchTab('solar')}
              >
                公历
              </div>
              <div
                className={`ldp-lunar-btn ldp-btn${activeTab === 'lunar' ? ' active' : ''}`}
                onClick={() => switchTab('lunar')}
              >
                农历
              </div>
            </div>
          ) : <div />}

          <div className="ldp-confirm" onClick={handleConfirm}>{confirmText}</div>
        </div>

        <div ref={containerRef} className="ldp-container" />
      </div>
    </div>,
    document.body
  )
}
