import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DateTimePickerCore } from '../../core/src/datetime-picker/DateTimePickerCore'
import { resolveLocale } from '../../core/src/locale'
import type {
  CalendarMode,
  CalendarType,
  DateTimeResult,
  PickerLocale,
  TimeField
} from '../../core/src/types'

interface LunarDateTimePickerProps {
  show?: boolean
  value?: Date
  calendarMode?: CalendarMode
  defaultCalendar?: CalendarType
  timeFields?: TimeField[]
  showUnit?: boolean
  showUnclear?: boolean
  unclearPosition?: 'first' | 'last'
  startYear?: number
  endYear?: number
  color?: string
  locale?: PickerLocale
  onUpdateShow?: (val: boolean) => void
  onUpdateValue?: (val: Date) => void
  onConfirm?: (result: DateTimeResult) => void
  onCancel?: () => void
  onChange?: (result: DateTimeResult) => void
}

const DEFAULT_TIME_FIELDS: TimeField[] = ['hour', 'minute']

function getInitialCalendar(calendarMode: CalendarMode, defaultCalendar: CalendarType): CalendarType {
  if (calendarMode === 'solar') return 'solar'
  if (calendarMode === 'lunar') return 'lunar'
  return defaultCalendar
}

export function LunarDateTimePicker({
  show = false,
  value,
  calendarMode = 'switch',
  defaultCalendar = 'solar',
  timeFields,
  showUnit = true,
  showUnclear = true,
  unclearPosition = 'last',
  startYear,
  endYear,
  color = '#D03F3F',
  locale,
  onUpdateShow,
  onUpdateValue,
  onConfirm,
  onCancel,
  onChange
}: LunarDateTimePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<DateTimePickerCore | null>(null)
  const defaultValueRef = useRef<Date>(value ?? new Date())
  const resolvedValue = value ?? defaultValueRef.current
  const resolvedTimeFields = timeFields ?? DEFAULT_TIME_FIELDS
  const timeFieldsKey = resolvedTimeFields.join(',')
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState<CalendarType>(
    getInitialCalendar(calendarMode, defaultCalendar)
  )
  const labels = resolveLocale(locale)

  function initCore() {
    if (!containerRef.current) return
    coreRef.current?.destroy()
    setActiveTab(getInitialCalendar(calendarMode, defaultCalendar))
    coreRef.current = new DateTimePickerCore(containerRef.current, {
      defaultDate: resolvedValue,
      calendarMode,
      defaultCalendar,
      timeFields: resolvedTimeFields,
      showUnit,
      showUnclear,
      unclearPosition,
      startYear,
      endYear,
      primaryColor: color,
      locale,
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
  }, [
    show,
    resolvedValue,
    calendarMode,
    defaultCalendar,
    timeFieldsKey,
    showUnit,
    showUnclear,
    unclearPosition,
    startYear,
    endYear,
    color,
    locale,
    onChange
  ])

  useEffect(() => {
    if (resolvedValue && coreRef.current) coreRef.current.setDate(resolvedValue)
  }, [resolvedValue])

  useEffect(() => {
    const nextTab = getInitialCalendar(calendarMode, defaultCalendar)
    setActiveTab(nextTab)
    coreRef.current?.switchCalendarType(nextTab)
  }, [calendarMode, defaultCalendar])

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
          <div className="ldp-cancel" onClick={handleCancel}>{labels.cancel}</div>

          {calendarMode === 'switch' ? (
            <div className="ldp-btn-group">
              <div
                className={`ldp-solar-btn ldp-btn${activeTab === 'solar' ? ' active' : ''}`}
                onClick={() => switchTab('solar')}
              >
                {labels.solar}
              </div>
              <div
                className={`ldp-lunar-btn ldp-btn${activeTab === 'lunar' ? ' active' : ''}`}
                onClick={() => switchTab('lunar')}
              >
                {labels.lunar}
              </div>
            </div>
          ) : <div />}

          <div className="ldp-confirm" onClick={handleConfirm}>{labels.confirm}</div>
        </div>

        <div ref={containerRef} className="ldp-container" />
      </div>
    </div>,
    document.body
  )
}
