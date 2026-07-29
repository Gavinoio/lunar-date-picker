import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DatePickerCore } from '../../core/src/date-picker/DatePickerCore'
import { resolveLocale } from '../../core/src/locale'
import type { CalendarMode, CalendarType, DateResult, PickerLocale } from '../../core/src/types'

interface LunarDatePickerProps {
  show?: boolean
  value?: Date
  calendarMode?: CalendarMode
  defaultCalendar?: CalendarType
  startYear?: number
  endYear?: number
  color?: string
  locale?: PickerLocale
  onUpdateShow?: (val: boolean) => void
  onUpdateValue?: (val: Date) => void
  onConfirm?: (result: DateResult) => void
  onCancel?: () => void
  onChange?: (result: DateResult) => void
}

function getInitialCalendar(calendarMode: CalendarMode, defaultCalendar: CalendarType): CalendarType {
  if (calendarMode === 'solar') return 'solar'
  if (calendarMode === 'lunar') return 'lunar'
  return defaultCalendar
}

export function LunarDatePicker({
  show = false,
  value,
  calendarMode = 'switch',
  defaultCalendar = 'solar',
  startYear,
  endYear,
  color = '#D03F3F',
  locale,
  onUpdateShow,
  onUpdateValue,
  onConfirm,
  onCancel,
  onChange
}: LunarDatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<DatePickerCore | null>(null)
  const defaultValueRef = useRef<Date>(value ?? new Date())
  const resolvedValue = value ?? defaultValueRef.current
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [activeCalendar, setActiveCalendar] = useState<CalendarType>(
    getInitialCalendar(calendarMode, defaultCalendar)
  )
  const labels = resolveLocale(locale)

  function initCore() {
    if (!containerRef.current) return
    coreRef.current?.destroy()
    const initialCalendar = getInitialCalendar(calendarMode, defaultCalendar)
    setActiveCalendar(initialCalendar)
    coreRef.current = new DatePickerCore(containerRef.current, {
      defaultDate: resolvedValue,
      calendarMode,
      defaultCalendar,
      startYear,
      endYear,
      primaryColor: color,
      locale,
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
  }, [show, resolvedValue, calendarMode, defaultCalendar, startYear, endYear, color, locale, onChange])

  useEffect(() => {
    return () => { coreRef.current?.destroy() }
  }, [])

  function toggleLunar() {
    const next = activeCalendar === 'lunar' ? 'solar' : 'lunar'
    setActiveCalendar(next)
    coreRef.current?.switchCalendarType(next)
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
          <div className="ldp-cancel" onClick={handleCancel}>{labels.cancel}</div>
          <div />
          <div className="ldp-confirm" onClick={handleConfirm}>{labels.confirm}</div>
        </div>

        <div ref={containerRef} className="ldp-container" />

        {calendarMode === 'switch' && (
          <div className="ldp-footer">
            <div
              className={`ldp-lunar-toggle${activeCalendar === 'lunar' ? ' active' : ''}`}
              onClick={toggleLunar}
            >
              <div className="ldp-lunar-circle" />
              <span>{labels.lunar}</span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
