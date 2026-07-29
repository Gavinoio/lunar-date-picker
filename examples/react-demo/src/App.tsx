import { useState } from 'react'
import { LunarDatePicker, LunarDateTimePicker } from '../../../packages/react/src'
import type { DateResult, DateTimeResult, PickerLocale } from '../../../packages/react/src'
import logoUrl from '../../../assets/lunar-picker-logo.svg'

type PickerResult = DateResult | DateTimeResult

interface DemoItemProps {
  label: string
  title: string
  desc: string
  buttonText: string
  tags?: string[]
  usage: string
  usageDefaultExpanded?: boolean
  buttonTone?: 'red' | 'blue' | 'green' | 'purple'
  result: string
  onOpen: () => void
}

const englishLocale: PickerLocale = {
  confirm: 'Apply',
  cancel: 'Close',
  solar: 'Solar',
  lunar: 'Lunar'
}

const reactUsage = {
  datetimeSwitch: `import { useState } from 'react'
import { LunarDateTimePicker } from 'lunar-picker/react'
// 通常无需手动引入；样式未自动加载时再引入：
// import 'lunar-picker/style.css'

export default function Demo() {
  const [show, setShow] = useState(false)
  const [value, setValue] = useState(new Date())

  return (
    <>
      <button onClick={() => setShow(true)}>选择日期时间</button>
      <LunarDateTimePicker
        show={show}
        value={value}
        calendarMode="switch"
        defaultCalendar="solar"
        onUpdateShow={setShow}
        onUpdateValue={setValue}
        onConfirm={result => console.log(result)}
      />
    </>
  )
}`,
  datetimeLunar: `<LunarDateTimePicker
  show={show}
  value={value}
  calendarMode="switch"
  defaultCalendar="lunar"
  onUpdateShow={setShow}
  onUpdateValue={setValue}
  onConfirm={handleConfirm}
/>`,
  datetimeSecond: `<LunarDateTimePicker
  show={show}
  value={value}
  calendarMode="switch"
  timeFields={['hour', 'minute', 'second']}
  unclearPosition="first"
  onUpdateShow={setShow}
  onUpdateValue={setValue}
  onConfirm={handleConfirm}
/>`,
  datetimeTheme: `<LunarDateTimePicker
  show={show}
  value={value}
  calendarMode="switch"
  color="#2563EB"
  onUpdateShow={setShow}
  onUpdateValue={setValue}
  onConfirm={handleConfirm}
/>`,
  datetimeLocale: `const locale = {
  confirm: 'Apply',
  cancel: 'Close',
  solar: 'Solar',
  lunar: 'Lunar'
}

<LunarDateTimePicker
  show={show}
  value={value}
  calendarMode="switch"
  timeFields={['hour', 'minute']}
  unclearPosition="first"
  locale={locale}
  color="#16A34A"
  onUpdateShow={setShow}
  onUpdateValue={setValue}
  onConfirm={handleConfirm}
/>`,
  datetimeRange: `<LunarDateTimePicker
  show={show}
  value={value}
  calendarMode="switch"
  startYear={2020}
  endYear={2026}
  timeFields={['hour', 'minute']}
  color="#7C3AED"
  onUpdateShow={setShow}
  onUpdateValue={setValue}
  onConfirm={handleConfirm}
/>`,
  dateSwitch: `import { LunarDatePicker } from 'lunar-picker/react'

<LunarDatePicker
  show={show}
  value={value}
  calendarMode="switch"
  onUpdateShow={setShow}
  onUpdateValue={setValue}
  onConfirm={handleConfirm}
/>`,
  dateLocale: `const locale = {
  confirm: 'Apply',
  cancel: 'Close',
  solar: 'Solar',
  lunar: 'Lunar'
}

<LunarDatePicker
  show={show}
  value={value}
  calendarMode="switch"
  locale={locale}
  color="#16A34A"
  onUpdateShow={setShow}
  onUpdateValue={setValue}
  onConfirm={handleConfirm}
/>`,
  dateRange: `<LunarDatePicker
  show={show}
  value={value}
  calendarMode="switch"
  defaultCalendar="lunar"
  startYear={2020}
  endYear={2026}
  color="#7C3AED"
  onUpdateShow={setShow}
  onUpdateValue={setValue}
  onConfirm={handleConfirm}
/>`
} satisfies Record<string, string>

function ResultBox({ result }: { result: string }) {
  const [expanded, setExpanded] = useState(true)
  if (!result) return null
  return (
    <div className="result-box">
      <div className="result-header" onClick={() => setExpanded(v => !v)}>
        <span className="result-title">返回数据</span>
        <span className={`result-toggle${expanded ? ' expanded' : ''}`}>▼</span>
      </div>
      {expanded && (
        <div className="result-content">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  )
}

function UsageBox({
  usage,
  defaultExpanded = false
}: {
  usage: string
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  return (
    <div className="usage-box">
      <button
        className="usage-header"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(v => !v)}
      >
        <span className="usage-title">用法</span>
        <span className={`result-toggle${expanded ? ' expanded' : ''}`}>▼</span>
      </button>
      {expanded && (
        <pre>
          <code>{usage}</code>
        </pre>
      )}
    </div>
  )
}

function DemoItem({
  label,
  title,
  desc,
  buttonText,
  tags = [],
  usage,
  usageDefaultExpanded = false,
  buttonTone = 'red',
  result,
  onOpen
}: DemoItemProps) {
  return (
    <div className="demo-item">
      <div className="card-body">
        <div className="card-header">
          <div className="card-info">
            <span className="case-label">{label}</span>
            <h3 className="card-title">{title}</h3>
            <p className="card-desc">{desc}</p>
            {tags.length > 0 && (
              <div className="feature-tags">
                {tags.map(tag => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <UsageBox usage={usage} defaultExpanded={usageDefaultExpanded} />
        <button className={`demo-button tone-${buttonTone}`} onClick={onOpen}>
          {buttonText}
        </button>
        <ResultBox result={result} />
      </div>
    </div>
  )
}

export default function App() {
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [dates, setDates] = useState<Record<string, Date>>({
    datetimeSwitch: new Date(),
    datetimeLunar: new Date(),
    datetimeSecond: new Date(),
    datetimeTheme: new Date(),
    datetimeLocale: new Date(),
    datetimeRange: new Date(2026, 5, 16, 16, 24),
    dateSwitch: new Date(),
    dateLocale: new Date(),
    dateRange: new Date(2026, 5, 16)
  })
  const [results, setResults] = useState<Record<string, string>>({})

  const fmt = (r: PickerResult) => JSON.stringify(r, null, 2)
  const open = (key: string) => setVisible(v => ({ ...v, [key]: true }))
  const setShow = (key: string) => (show: boolean) => setVisible(v => ({ ...v, [key]: show }))
  const setDate = (key: string) => (date: Date) => setDates(v => ({ ...v, [key]: date }))
  const setResult = (key: string) => (result: PickerResult) =>
    setResults(v => ({ ...v, [key]: fmt(result) }))

  return (
    <>
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <img src={logoUrl} alt="Lunar Picker" />
          </div>
          <div className="header-text">
            <h1>Lunar Date Picker （React）</h1>
            <p>移动端公历/农历日期选择器，多模式、多文案、多主题演示</p>
          </div>
          <div className="header-badges">
            <span className="header-badge badge-react">React 18/19</span>
            <span className="header-badge badge-package">lunar-picker 2.0.0</span>
          </div>
        </div>
      </div>

      <div className="demo-container">
        <div className="component-section">
          <div className="demo-card">
            <div className="section-header">
              <div className="card-label">LunarDateTimePicker</div>
              <h2 className="section-title">日期时间选择器</h2>
              <p className="section-desc">覆盖切换模式、时间字段、不清楚选项、主题色和文案定制</p>
            </div>

            <DemoItem
              label="基础"
              title="公历 + 农历切换"
              desc="默认打开公历，支持切换农历，显示小时和分钟。"
              buttonText="选择日期时间"
              tags={['calendarMode=switch', 'timeFields=hour/minute']}
              usage={reactUsage.datetimeSwitch}
              result={results.datetimeSwitch}
              onOpen={() => open('datetimeSwitch')}
            />
            <LunarDateTimePicker
              show={visible.datetimeSwitch}
              value={dates.datetimeSwitch}
              calendarMode="switch"
              defaultCalendar="solar"
              onUpdateShow={setShow('datetimeSwitch')}
              onUpdateValue={setDate('datetimeSwitch')}
              onConfirm={setResult('datetimeSwitch')}
            />

            <DemoItem
              label="农历"
              title="默认农历模式"
              desc="打开面板后优先展示农历列，仍可切回公历。"
              buttonText="选择农历日期"
              tags={['defaultCalendar=lunar']}
              usage={reactUsage.datetimeLunar}
              result={results.datetimeLunar}
              onOpen={() => open('datetimeLunar')}
            />
            <LunarDateTimePicker
              show={visible.datetimeLunar}
              value={dates.datetimeLunar}
              calendarMode="switch"
              defaultCalendar="lunar"
              onUpdateShow={setShow('datetimeLunar')}
              onUpdateValue={setDate('datetimeLunar')}
              onConfirm={setResult('datetimeLunar')}
            />

            <DemoItem
              label="时间"
              title="精确到秒 + 不清楚置顶"
              desc="显示时、分、秒，并把“不清楚”选项放在每列第一项。"
              buttonText="选择精确时间"
              tags={['timeFields=hour/minute/second', 'unclearPosition=first']}
              usage={reactUsage.datetimeSecond}
              result={results.datetimeSecond}
              onOpen={() => open('datetimeSecond')}
            />
            <LunarDateTimePicker
              show={visible.datetimeSecond}
              value={dates.datetimeSecond}
              calendarMode="switch"
              timeFields={['hour', 'minute', 'second']}
              unclearPosition="first"
              onUpdateShow={setShow('datetimeSecond')}
              onUpdateValue={setDate('datetimeSecond')}
              onConfirm={setResult('datetimeSecond')}
            />

            <DemoItem
              label="主题"
              title="自定义主题色"
              desc="通过 color 修改确认按钮、切换按钮和选中态主色。"
              buttonText="打开蓝色主题"
              buttonTone="blue"
              tags={['color=#2563EB']}
              usage={reactUsage.datetimeTheme}
              result={results.datetimeTheme}
              onOpen={() => open('datetimeTheme')}
            />
            <LunarDateTimePicker
              show={visible.datetimeTheme}
              value={dates.datetimeTheme}
              calendarMode="switch"
              color="#2563EB"
              onUpdateShow={setShow('datetimeTheme')}
              onUpdateValue={setDate('datetimeTheme')}
              onConfirm={setResult('datetimeTheme')}
            />

            <DemoItem
              label="文案"
              title="自定义 locale"
              desc="统一替换确认、取消、公历、农历四个面板文案。"
              buttonText="Open picker"
              buttonTone="green"
              tags={['locale.confirm=Apply', 'locale.solar=Solar']}
              usage={reactUsage.datetimeLocale}
              result={results.datetimeLocale}
              onOpen={() => open('datetimeLocale')}
            />
            <LunarDateTimePicker
              show={visible.datetimeLocale}
              value={dates.datetimeLocale}
              calendarMode="switch"
              timeFields={['hour', 'minute']}
              unclearPosition="first"
              locale={englishLocale}
              color="#16A34A"
              onUpdateShow={setShow('datetimeLocale')}
              onUpdateValue={setDate('datetimeLocale')}
              onConfirm={setResult('datetimeLocale')}
            />

            <DemoItem
              label="范围"
              title="年份范围 + 时间选择"
              desc="LunarDateTimePicker 同样支持 startYear/endYear，限制年份列在 2020-2026 内。"
              buttonText="选择范围内日期时间"
              buttonTone="purple"
              tags={['startYear=2020', 'endYear=2026', 'timeFields=hour/minute']}
              usage={reactUsage.datetimeRange}
              result={results.datetimeRange}
              onOpen={() => open('datetimeRange')}
            />
            <LunarDateTimePicker
              show={visible.datetimeRange}
              value={dates.datetimeRange}
              calendarMode="switch"
              startYear={2020}
              endYear={2026}
              timeFields={['hour', 'minute']}
              color="#7C3AED"
              onUpdateShow={setShow('datetimeRange')}
              onUpdateValue={setDate('datetimeRange')}
              onConfirm={setResult('datetimeRange')}
            />
          </div>
        </div>

        <div className="component-section">
          <div className="demo-card">
            <div className="section-header">
              <div className="card-label">LunarDatePicker</div>
              <h2 className="section-title">日期选择器</h2>
              <p className="section-desc">展示日期-only 场景、农历切换、年份范围和主题色</p>
            </div>

            <DemoItem
              label="日期"
              title="公历 + 农历切换"
              desc="只选择日期，不包含任何时间字段。"
              buttonText="选择日期"
              tags={['DateResult', 'calendarMode=switch']}
              usage={reactUsage.dateSwitch}
              result={results.dateSwitch}
              onOpen={() => open('dateSwitch')}
            />
            <LunarDatePicker
              show={visible.dateSwitch}
              value={dates.dateSwitch}
              calendarMode="switch"
              onUpdateShow={setShow('dateSwitch')}
              onUpdateValue={setDate('dateSwitch')}
              onConfirm={setResult('dateSwitch')}
            />

            <DemoItem
              label="文案"
              title="自定义 locale"
              desc="LunarDatePicker 同样支持替换确认、取消、公历、农历四个文案。"
              buttonText="Open date picker"
              buttonTone="green"
              tags={['locale.confirm=Apply', 'locale.solar=Solar']}
              usage={reactUsage.dateLocale}
              result={results.dateLocale}
              onOpen={() => open('dateLocale')}
            />
            <LunarDatePicker
              show={visible.dateLocale}
              value={dates.dateLocale}
              calendarMode="switch"
              locale={englishLocale}
              color="#16A34A"
              onUpdateShow={setShow('dateLocale')}
              onUpdateValue={setDate('dateLocale')}
              onConfirm={setResult('dateLocale')}
            />

            <DemoItem
              label="范围"
              title="年份范围 + 自定义主题色"
              desc="限制在 2020-2026 年内选择，并使用紫色主题。"
              buttonText="选择范围内日期"
              buttonTone="purple"
              tags={['startYear=2020', 'endYear=2026', 'color=#7C3AED']}
              usage={reactUsage.dateRange}
              result={results.dateRange}
              onOpen={() => open('dateRange')}
            />
            <LunarDatePicker
              show={visible.dateRange}
              value={dates.dateRange}
              calendarMode="switch"
              defaultCalendar="lunar"
              startYear={2020}
              endYear={2026}
              color="#7C3AED"
              onUpdateShow={setShow('dateRange')}
              onUpdateValue={setDate('dateRange')}
              onConfirm={setResult('dateRange')}
            />
          </div>
        </div>
      </div>

      <div className="github-link">
        <a href="https://github.com/Gavinoio/lunar-picker" target="_blank" rel="noreferrer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          View on GitHub
        </a>
      </div>
    </>
  )
}
