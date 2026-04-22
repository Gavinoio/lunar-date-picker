import { useState } from 'react'
import { LunarDatePicker, LunarDateTimePicker } from '../../../src/react'
import type { DateResult, DateTimeResult } from '../../../src/react'

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

export default function App() {
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [show3, setShow3] = useState(false)
  const [show4, setShow4] = useState(false)
  const [show5, setShow5] = useState(false)
  const [show6, setShow6] = useState(false)

  const [date1, setDate1] = useState(new Date())
  const [date2, setDate2] = useState(new Date())
  const [date3, setDate3] = useState(new Date())
  const [date4, setDate4] = useState(new Date())
  const [date5, setDate5] = useState(new Date())
  const [date6, setDate6] = useState(new Date())

  const [result1, setResult1] = useState('')
  const [result2, setResult2] = useState('')
  const [result3, setResult3] = useState('')
  const [result4, setResult4] = useState('')
  const [result5, setResult5] = useState('')
  const [result6, setResult6] = useState('')

  const fmt = (r: DateResult | DateTimeResult) => JSON.stringify(r, null, 2)

  return (
    <>
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">🌙</div>
          <div className="header-text">
            <h1>Lunar Date Picker （React）</h1>
            <p>移动端公历/农历日期选择器</p>
          </div>
        </div>
      </div>

      <div className="demo-container">
        {/* LunarDateTimePicker */}
        <div className="component-section">
          <div className="demo-card">
            <div className="section-header">
              <div className="card-label">LunarDateTimePicker</div>
              <h2 className="section-title">日期时间选择器</h2>
              <p className="section-desc">支持公历/农历切换，可选择日期和时间</p>
            </div>

            <div className="demo-item">
              <div className="card-body">
                <div className="card-header">
                  <div className="card-info">
                    <h3 className="card-title">公历+农历切换</h3>
                    <p className="card-desc">支持公历/农历切换，显示时分</p>
                  </div>
                </div>
                <button className="demo-button" onClick={() => setShow1(true)}>
                  选择日期时间
                </button>
                <ResultBox result={result1} />
              </div>
              <LunarDateTimePicker
                show={show1}
                value={date1}
                type={1}
                onUpdateShow={setShow1}
                onUpdateValue={setDate1}
                onConfirm={r => setResult1(fmt(r))}
              />
            </div>

            <div className="demo-item">
              <div className="card-body">
                <div className="card-header">
                  <div className="card-info">
                    <h3 className="card-title">默认农历模式</h3>
                    <p className="card-desc">打开时默认显示农历日期</p>
                  </div>
                </div>
                <button className="demo-button" onClick={() => setShow2(true)}>
                  选择农历日期
                </button>
                <ResultBox result={result2} />
              </div>
              <LunarDateTimePicker
                show={show2}
                value={date2}
                type={2}
                onUpdateShow={setShow2}
                onUpdateValue={setDate2}
                onConfirm={r => setResult2(fmt(r))}
              />
            </div>

            <div className="demo-item">
              <div className="card-body">
                <div className="card-header">
                  <div className="card-info">
                    <h3 className="card-title">纯公历模式</h3>
                    <p className="card-desc">不显示公历/农历切换按钮</p>
                  </div>
                </div>
                <button className="demo-button" onClick={() => setShow5(true)}>
                  选择公历日期
                </button>
                <ResultBox result={result5} />
              </div>
              <LunarDateTimePicker
                show={show5}
                value={date5}
                type={0}
                onUpdateShow={setShow5}
                onUpdateValue={setDate5}
                onConfirm={r => setResult5(fmt(r))}
              />
            </div>

            <div className="demo-item">
              <div className="card-body">
                <div className="card-header">
                  <div className="card-info">
                    <h3 className="card-title">精确到秒</h3>
                    <p className="card-desc">显示时、分、秒三个时间字段</p>
                  </div>
                </div>
                <button className="demo-button" onClick={() => setShow6(true)}>
                  选择精确时间
                </button>
                <ResultBox result={result6} />
              </div>
              <LunarDateTimePicker
                show={show6}
                value={date6}
                type={1}
                timeFields={['hour', 'minute', 'second']}
                onUpdateShow={setShow6}
                onUpdateValue={setDate6}
                onConfirm={r => setResult6(fmt(r))}
              />
            </div>
          </div>
        </div>

        {/* LunarDatePicker */}
        <div className="component-section">
          <div className="demo-card">
            <div className="section-header">
              <div className="card-label">LunarDatePicker</div>
              <h2 className="section-title">日期选择器</h2>
              <p className="section-desc">只选择日期，不包含时间</p>
            </div>

            <div className="demo-item">
              <div className="card-body">
                <div className="card-header">
                  <div className="card-info">
                    <h3 className="card-title">公历+农历切换</h3>
                    <p className="card-desc">支持公历/农历切换</p>
                  </div>
                </div>
                <button className="demo-button" onClick={() => setShow3(true)}>
                  选择日期
                </button>
                <ResultBox result={result3} />
              </div>
              <LunarDatePicker
                show={show3}
                value={date3}
                onUpdateShow={setShow3}
                onUpdateValue={setDate3}
                onConfirm={r => setResult3(fmt(r))}
              />
            </div>

            <div className="demo-item">
              <div className="card-body">
                <div className="card-header">
                  <div className="card-info">
                    <h3 className="card-title">纯公历模式</h3>
                    <p className="card-desc">不显示农历切换，纯公历日期</p>
                  </div>
                </div>
                <button className="demo-button" onClick={() => setShow4(true)}>
                  选择日期
                </button>
                <ResultBox result={result4} />
              </div>
              <LunarDatePicker
                show={show4}
                value={date4}
                showLunar={false}
                onUpdateShow={setShow4}
                onUpdateValue={setDate4}
                onConfirm={r => setResult4(fmt(r))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="github-link">
        <a href="https://github.com/Gavinoio/lunar-date-picker" target="_blank" rel="noreferrer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          View on GitHub
        </a>
      </div>
    </>
  )
}
