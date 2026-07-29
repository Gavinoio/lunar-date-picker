# lunar-picker

<p align="center">
  <img src="./assets/lunar-picker-logo.svg" width="112" height="112" alt="lunar-picker logo">
</p>

移动端公历 / 农历日期选择器，支持 Vue 3、React 18、React 19，也提供不依赖框架的 Core API。适合需要在移动端选择公历日期、农历日期、日期时间、生肖干支、节气等信息的业务场景。

[![npm version](https://img.shields.io/npm/v/lunar-picker.svg)](https://www.npmjs.com/package/lunar-picker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 在线演示

- [Vue 3 Demo](https://gavinoio.github.io/lunar-picker/vue/)
- [React Demo](https://gavinoio.github.io/lunar-picker/react/)

## 支持能力

- `LunarDatePicker`：日期选择器，只选择年、月、日。
- `LunarDateTimePicker`：日期时间选择器，可选择年、月、日、时、分、秒。
- 支持 `solar`、`lunar`、`switch` 三种日历模式。
- 支持默认打开公历或农历。
- 支持公历 / 农历互相切换，并返回同一日期对应的完整公历、农历信息。
- 支持农历闰月、中文农历月日、生肖、干支、星座、节气。
- 支持年份范围配置，范围会自动归一到 `1900 ~ min(当前年份, 2100)`。
- 支持移动端滚轮交互和底部弹出面板。
- 支持主题色 `color` 自定义。
- 支持 `locale` 统一配置确认、取消、公历、农历文案。
- 支持日期时间选择器按需显示 `hour`、`minute`、`second`。
- 支持日期时间选择器显示或隐藏“不清楚”选项。
- 支持 TypeScript 类型导出。
- 支持 Vue、React、Core 三种按需入口。
- 浏览器组件入口会自动加载样式，同时保留 `lunar-picker/style.css` 手动引入方式。

## 2.0 升级内容

### 新增能力

- 新增 React 19 支持，同时继续兼容 React 18。
- 新增 `LunarDatePicker` 和 `LunarDateTimePicker` 的统一 `locale` 参数。
- 新增 `calendarMode` 和 `defaultCalendar`，更清晰地表达“只公历、只农历、公历农历切换”和默认打开哪种日历。
- `LunarDateTimePicker` 支持 `startYear` / `endYear` 年份范围。
- 新增浏览器条件导出，Vue / React 组件入口在常规构建工具中会自动携带样式。
- 新增独立 `style.css` 子路径，适合 Core API 或样式未自动加载的构建环境。
- 新增 package exports 校验脚本，发布前检查核心产物、框架入口和样式入口是否完整。
- Demo 补充了主题色、locale、年份范围、日期选择器、日期时间选择器等完整案例。

### 修复和优化

- 修复自定义 `locale` 后确认、取消文案可能丢失的问题；未传入的文案会回退到默认中文。
- 修复年份范围可以超过当前年份的问题。默认最大年份为当前年份，且不会超过算法支持上限 `2100`。
- 修复 `startYear` 小于算法支持范围时的边界问题。小于 `1900` 会按 `1900` 处理。
- 修复 `startYear > endYear` 时年份列异常的问题。此时会回退到完整可用年份范围。
- 优化 React 组件默认值处理，避免未受控 value 在重复渲染时被新的 `new Date()` 干扰。
- 优化 Vue 组件对 `value`、`calendarMode`、`defaultCalendar` 的响应。
- 优化按需引入和打包产物结构，减少用户为了样式额外踩坑的概率。
- README 和 Demo 已补齐 `LunarDatePicker` 的 `locale` 用法。

### 移除和替换的参数

2.0 对部分参数做了语义化整理，旧参数不再推荐使用：

| 旧参数 | 所属组件 | 2.0 替换方式 |
| --- | --- | --- |
| `showLunar` | `LunarDatePicker` | 使用 `calendarMode`。`showLunar={false}` 对应 `calendarMode="solar"`；`showLunar={true}` 对应 `calendarMode="switch"` |
| `type` | `LunarDateTimePicker` | 使用 `calendarMode` + `defaultCalendar`。`type={0}` 对应 `calendarMode="solar"`；`type={1}` 对应 `calendarMode="switch" defaultCalendar="solar"`；`type={2}` 对应 `calendarMode="switch" defaultCalendar="lunar"` |
| `unclearFirst` | `LunarDateTimePicker` | 使用 `unclearPosition`。`unclearFirst={true}` 对应 `unclearPosition="first"`；`unclearFirst={false}` 对应 `unclearPosition="last"` |
| `confirmText` | `LunarDatePicker` / `LunarDateTimePicker` | 使用 `locale.confirm` |
| `cancelText` | `LunarDatePicker` / `LunarDateTimePicker` | 使用 `locale.cancel` |

2.0 不再保留 1.x 的旧参数兼容逻辑，请统一使用上表中的新参数。

## 安装

```bash
npm install lunar-picker
```

```bash
yarn add lunar-picker
```

```bash
pnpm add lunar-picker
```

## 导入方式

Vue：

```ts
import { LunarDatePicker, LunarDateTimePicker } from 'lunar-picker/vue'
```

React：

```ts
import { LunarDatePicker, LunarDateTimePicker } from 'lunar-picker/react'
```

Core：

```ts
import { DatePickerCore, DateTimePickerCore } from 'lunar-picker'
```

## 样式说明

使用 Vue / React 组件入口时，常规浏览器构建工具会自动加载组件样式：

```ts
import { LunarDatePicker } from 'lunar-picker/vue'
import { LunarDateTimePicker } from 'lunar-picker/react'
```

如果你的构建环境没有处理包内样式，或者你直接使用 Core API，可以手动引入：

```ts
import 'lunar-picker/style.css'
```

这两种方式都支持。组件项目一般直接使用框架入口即可；Core API 或特殊打包环境再手动引入样式。

## Vue 3 用法

### 日期选择

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LunarDatePicker } from 'lunar-picker/vue'

const show = ref(false)
const value = ref(new Date())
</script>

<template>
  <button @click="show = true">选择日期</button>

  <LunarDatePicker
    v-model:show="show"
    v-model:value="value"
    calendar-mode="switch"
    default-calendar="solar"
    :start-year="2020"
    :end-year="2026"
    color="#D03F3F"
    @confirm="result => console.log(result)"
  />
</template>
```

### 日期时间选择

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LunarDateTimePicker } from 'lunar-picker/vue'

const show = ref(false)
const value = ref(new Date())
</script>

<template>
  <button @click="show = true">选择日期时间</button>

  <LunarDateTimePicker
    v-model:show="show"
    v-model:value="value"
    calendar-mode="switch"
    default-calendar="lunar"
    :time-fields="['hour', 'minute', 'second']"
    :show-unclear="true"
    unclear-position="last"
    @confirm="result => console.log(result)"
  />
</template>
```

## React 用法

### 日期选择

```tsx
import { useState } from 'react'
import { LunarDatePicker } from 'lunar-picker/react'

export function App() {
  const [show, setShow] = useState(false)
  const [value, setValue] = useState(new Date())

  return (
    <>
      <button onClick={() => setShow(true)}>选择日期</button>

      <LunarDatePicker
        show={show}
        value={value}
        calendarMode="switch"
        defaultCalendar="solar"
        startYear={2020}
        endYear={2026}
        color="#D03F3F"
        onUpdateShow={setShow}
        onUpdateValue={setValue}
        onConfirm={result => console.log(result)}
      />
    </>
  )
}
```

### 日期时间选择

```tsx
import { useState } from 'react'
import { LunarDateTimePicker } from 'lunar-picker/react'

export function App() {
  const [show, setShow] = useState(false)
  const [value, setValue] = useState(new Date())

  return (
    <>
      <button onClick={() => setShow(true)}>选择日期时间</button>

      <LunarDateTimePicker
        show={show}
        value={value}
        calendarMode="switch"
        defaultCalendar="lunar"
        timeFields={['hour', 'minute', 'second']}
        showUnclear={true}
        unclearPosition="last"
        onUpdateShow={setShow}
        onUpdateValue={setValue}
        onConfirm={result => console.log(result)}
      />
    </>
  )
}
```

## 常用配置

### 日历模式

```tsx
<LunarDatePicker calendarMode="solar" />
<LunarDatePicker calendarMode="lunar" />
<LunarDatePicker calendarMode="switch" defaultCalendar="lunar" />
```

| 值 | 说明 |
| --- | --- |
| `solar` | 只使用公历 |
| `lunar` | 只使用农历 |
| `switch` | 允许用户在公历和农历之间切换 |

`defaultCalendar` 只在 `calendarMode="switch"` 时表达默认打开的日历类型。

### 年份范围

```tsx
<LunarDatePicker startYear={2020} endYear={2026} />
<LunarDateTimePicker startYear={2020} endYear={2026} />
```

农历算法支持 `1900` 到 `2100` 年。组件会把年份选择范围归一到 `1900 ~ min(当前年份, 2100)`：

- `startYear` 默认是 `1910`，小于 `1900` 时按 `1900` 处理。
- `endYear` 默认是当前年份，大于当前年份或大于 `2100` 时按可用最大年份处理。
- 如果 `startYear > endYear`，会回退到完整可用年份范围。

### 自定义主题色

```tsx
<LunarDatePicker color="#2563EB" />
<LunarDateTimePicker color="#16A34A" />
```

`color` 会影响确认按钮、切换按钮和选中态主色。

### 自定义文案

```ts
const locale = {
  confirm: 'Apply',
  cancel: 'Close',
  solar: 'Solar',
  lunar: 'Lunar'
}
```

React：

```tsx
<LunarDatePicker locale={locale} />
<LunarDateTimePicker locale={locale} />
```

Vue：

```vue
<LunarDatePicker :locale="locale" />
<LunarDateTimePicker :locale="locale" />
```

`LunarDatePicker` 和 `LunarDateTimePicker` 都支持 `locale`。目前只支持 `confirm`、`cancel`、`solar`、`lunar` 四个文案；没有传入的字段会自动使用默认中文文案。

### 时间字段

`timeFields` 只适用于 `LunarDateTimePicker`。

```ts
type TimeField = 'hour' | 'minute' | 'second'
```

```tsx
<LunarDateTimePicker timeFields={['hour']} />
<LunarDateTimePicker timeFields={['hour', 'minute']} />
<LunarDateTimePicker timeFields={['hour', 'minute', 'second']} />
```

默认值是 `['hour', 'minute']`。

### 不清楚选项

`showUnclear` 和 `unclearPosition` 只适用于 `LunarDateTimePicker`。

```tsx
<LunarDateTimePicker showUnclear={false} />
<LunarDateTimePicker showUnclear unclearPosition="first" />
<LunarDateTimePicker showUnclear unclearPosition="last" />
```

Vue：

```vue
<LunarDateTimePicker :show-unclear="false" />
<LunarDateTimePicker show-unclear unclear-position="first" />
```

当某个时间字段选择“不清楚”时，返回结果中对应字段为 `'不清楚'`。为了生成合法的 JavaScript `Date`，`result.date` 中对应时间值会按 `0` 兜底。

## API

### 通用 Props

`LunarDatePicker` 和 `LunarDateTimePicker` 都支持：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `show` | `boolean` | `false` | 是否显示选择器 |
| `value` | `Date` | `new Date()` | 当前选中日期 |
| `calendarMode` | `'solar' \| 'lunar' \| 'switch'` | `'switch'` | 日历模式 |
| `defaultCalendar` | `'solar' \| 'lunar'` | `'solar'` | 切换模式下默认打开的日历 |
| `startYear` | `number` | `1910` | 年份选择的起始年份，低于 `1900` 会按 `1900` 处理 |
| `endYear` | `number` | 当前年份 | 年份选择的最大年份，高于当前年份或 `2100` 会按可用最大年份处理 |
| `color` | `string` | `'#D03F3F'` | 主题色 |
| `locale` | `PickerLocale` | 中文文案 | 配置确认、取消、公历、农历文案 |

### LunarDateTimePicker 专属 Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `timeFields` | `TimeField[]` | `['hour', 'minute']` | 显示哪些时间字段 |
| `showUnit` | `boolean` | `true` | 是否显示年、月、日、时、分、秒单位 |
| `showUnclear` | `boolean` | `true` | 是否显示“不清楚”选项 |
| `unclearPosition` | `'first' \| 'last'` | `'last'` | “不清楚”选项位置 |

### Vue 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:show` | `boolean` | 显示状态变化 |
| `update:value` | `Date` | 确认后的日期值 |
| `confirm` | `DateResult` / `DateTimeResult` | 点击确认 |
| `cancel` | 无 | 点击取消或遮罩关闭 |
| `change` | `DateResult` / `DateTimeResult` | 滚动选择变化 |

### React 回调

| 属性 | 参数 | 说明 |
| --- | --- | --- |
| `onUpdateShow` | `boolean` | 显示状态变化 |
| `onUpdateValue` | `Date` | 确认后的日期值 |
| `onConfirm` | `DateResult` / `DateTimeResult` | 点击确认 |
| `onCancel` | 无 | 点击取消或遮罩关闭 |
| `onChange` | `DateResult` / `DateTimeResult` | 滚动选择变化 |

## 类型

```ts
type CalendarType = 'solar' | 'lunar'
type CalendarMode = 'solar' | 'lunar' | 'switch'
type TimeField = 'hour' | 'minute' | 'second'
type TimeValue = number | '不清楚'

interface PickerLocale {
  confirm?: string
  cancel?: string
  solar?: string
  lunar?: string
}
```

```ts
interface DateResult {
  date: Date
  solar: {
    year: number
    month: number
    day: number
    week: number
    weekCn: string
    astro: string
  }
  lunar: {
    year: number
    month: number
    day: number
    isLeap: boolean
    yearCn: string
    monthCn: string
    dayCn: string
    animal: string
    gzMonth: string
    gzDay: string
    isTerm: boolean
    term: string | null
  }
  isToday: boolean
}

interface DateTimeResult extends DateResult {
  hour?: TimeValue
  minute?: TimeValue
  second?: TimeValue
}
```

## Core API

Core API 适合不使用 Vue / React，或需要接入自定义 UI 的场景。使用 Core API 时需要自己提供容器节点，并手动引入样式。

```ts
import { DatePickerCore } from 'lunar-picker'
import 'lunar-picker/style.css'

const picker = new DatePickerCore(document.querySelector('#picker')!, {
  defaultDate: new Date(),
  calendarMode: 'switch',
  defaultCalendar: 'solar',
  startYear: 2020,
  endYear: 2026,
  primaryColor: '#D03F3F',
  locale: {
    confirm: '确定',
    cancel: '取消',
    solar: '公历',
    lunar: '农历'
  },
  onChange(result) {
    console.log(result)
  }
})

picker.switchCalendarType('lunar')
const result = picker.getResult()
picker.destroy()
```

`DateTimePickerCore` 支持同样的日期配置，并额外支持 `timeFields`、`showUnit`、`showUnclear`、`unclearPosition`。

## 兼容说明

- 农历转换算法支持 `1900` 到 `2100` 年。
- 年份列默认不会超过当前年份。
- `locale` 不包含“今天”和“不清楚”文案配置。
- 2.0 不再支持 `confirmText` / `cancelText`，请使用 `locale.confirm` / `locale.cancel`。
- Vue / React 入口适合组件开发；Core 入口适合自定义渲染或非框架项目。

## 本地开发

```bash
npm install
npm run dev:vue
npm run dev:react
```

构建和校验：

```bash
npm run lint
npm test -- --run
npm run build
npm run test:package
```

## License

MIT
