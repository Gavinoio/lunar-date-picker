# lunar-date-picker

移动端公历/农历日期选择器，支持 Vue 3 和 React 18

[![npm version](https://img.shields.io/npm/v/lunar-date-picker.svg)](https://www.npmjs.com/package/lunar-date-picker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 特性

- 📅 两个组件：`LunarDatePicker`（日期）、`LunarDateTimePicker`（日期时间）
- 🌙 支持公历/农历切换
- 📱 移动端优化的触摸滚动
- 🎨 可自定义主题色
- 📦 TypeScript 类型支持
- ⚡️ CSS 自动注入，开箱即用
- 🌲 支持 Tree-shaking
- ✅ 单元测试覆盖

## 在线演示

- [Vue 3 版本](https://gavinoio.github.io/lunar-date-picker/vue/)
- [React 版本](https://gavinoio.github.io/lunar-date-picker/react/)

## 安装

使用 npm：
```bash
npm install lunar-date-picker
```

使用 yarn：
```bash
yarn add lunar-date-picker
```

使用 pnpm：
```bash
pnpm add lunar-date-picker
```

## Vue 3 使用

### LunarDatePicker（日期选择器）

```vue
<script setup>
import { ref } from 'vue'
import { LunarDatePicker } from 'lunar-date-picker/vue'

const show = ref(false)
const date = ref(new Date())

function onConfirm(result) {
  console.log('选中日期:', result)
}
</script>

<template>
  <button @click="show = true">选择日期</button>

  <LunarDatePicker
    v-model:show="show"
    v-model:value="date"
    :show-lunar="true"
    :end-year="2030"
    color="#D03F3F"
    confirm-text="确定"
    cancel-text="取消"
    @confirm="onConfirm"
    @cancel="() => console.log('取消')"
    @change="(result) => console.log('变化:', result)"
  />
</template>
```

### LunarDateTimePicker（日期时间选择器）

```vue
<script setup>
import { ref } from 'vue'
import { LunarDateTimePicker } from 'lunar-date-picker/vue'

const show = ref(false)
const date = ref(new Date())

function onConfirm(result) {
  console.log('选中日期时间:', result)
}
</script>

<template>
  <button @click="show = true">选择日期时间</button>

  <LunarDateTimePicker
    v-model:show="show"
    v-model:value="date"
    :type="1"
    :time-fields="['hour', 'minute']"
    :show-unit="true"
    :unclear-first="false"
    :end-year="2030"
    color="#D03F3F"
    confirm-text="确定"
    cancel-text="取消"
    @confirm="onConfirm"
  />
</template>
```

## API 文档

### LunarDatePicker Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | `false` | 是否显示选择器（支持 v-model） |
| `value` | `Date` | `new Date()` | 当前选中的日期（支持 v-model） |
| `showLunar` | `boolean` | `true` | 是否显示农历切换按钮 |
| `endYear` | `number` | `当前年份` | 年份选择的最大年份 |
| `color` | `string` | `'#D03F3F'` | 主题色 |
| `confirmText` | `string` | `'确定'` | 确认按钮文字 |
| `cancelText` | `string` | `'取消'` | 取消按钮文字 |

### LunarDatePicker Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:show` | `(value: boolean)` | 显示状态变化时触发 |
| `update:value` | `(value: Date)` | 选中日期变化时触发 |
| `confirm` | `(result: DateResult)` | 点击确定按钮时触发 |
| `cancel` | `()` | 点击取消按钮时触发 |
| `change` | `(result: DateResult)` | 滚动选择变化时触发 |

### LunarDateTimePicker Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `boolean` | `false` | 是否显示选择器（支持 v-model） |
| `value` | `Date` | `new Date()` | 当前选中的日期时间（支持 v-model） |
| `type` | `0 \| 1 \| 2` | `1` | 日历类型（见下方说明） |
| `timeFields` | `TimeField[]` | `['hour', 'minute']` | 要显示的时间字段 |
| `showUnit` | `boolean` | `true` | 是否显示单位文字（年、月、日、时、分、秒） |
| `unclearFirst` | `boolean` | `false` | "不清楚"选项是否放在时间列的最前面 |
| `endYear` | `number` | `当前年份` | 年份选择的最大年份 |
| `color` | `string` | `'#D03F3F'` | 主题色 |
| `confirmText` | `string` | `'确定'` | 确认按钮文字 |
| `cancelText` | `string` | `'取消'` | 取消按钮文字 |

### LunarDateTimePicker Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:show` | `(value: boolean)` | 显示状态变化时触发 |
| `update:value` | `(value: Date)` | 选中日期时间变化时触发 |
| `confirm` | `(result: DateTimeResult)` | 点击确定按钮时触发 |
| `cancel` | `()` | 点击取消按钮时触发 |
| `change` | `(result: DateTimeResult)` | 滚动选择变化时触发 |

### type 参数说明

| 值 | 行为 |
|----|------|
| `0` | 隐藏切换按钮，只显示公历 |
| `1` | 显示切换按钮，默认公历（默认值） |
| `2` | 显示切换按钮，默认农历 |

### timeFields 参数说明

`timeFields` 是一个数组，用于控制显示哪些时间字段：

- `['hour']` - 只显示小时
- `['hour', 'minute']` - 显示小时和分钟（默认）
- `['hour', 'minute', 'second']` - 显示小时、分钟和秒

### 返回值类型

#### DateResult

```typescript
interface DateResult {
  date: Date              // JavaScript Date 对象
  solar: {
    year: number          // 公历年
    month: number         // 公历月（1-12）
    day: number           // 公历日
    week: number          // 星期（0-6，0=周日）
    weekCn: string        // 星期中文（'周一'）
    astro: string         // 星座（'白羊座'）
  }
  lunar: {
    year: number          // 农历年
    month: number         // 农历月
    day: number           // 农历日
    isLeap: boolean       // 是否闰月
    yearCn: string        // 农历年干支（'甲子'）
    monthCn: string       // 农历月中文（'正月'）
    dayCn: string         // 农历日中文（'初一'）
    animal: string        // 生肖（'鼠'）
    gzMonth: string       // 干支月（'丙寅'）
    gzDay: string         // 干支日（'甲子'）
    isTerm: boolean       // 是否节气
    term: string | null   // 节气名称（'立春'）
  }
  isToday: boolean        // 是否今天
}
```

#### DateTimeResult

```typescript
interface DateTimeResult extends DateResult {
  hour?: number | '不清楚'      // 小时（0-23）或"不清楚"
  minute?: number | '不清楚'    // 分钟（0-59）或"不清楚"
  second?: number               // 秒（0-59）
}
```

## React 使用

### LunarDatePicker（日期选择器）

```tsx
import { useState } from 'react'
import { LunarDatePicker } from 'lunar-date-picker/react'

function App() {
  const [show, setShow] = useState(false)
  const [date, setDate] = useState(new Date())

  function onConfirm(result) {
    console.log('选中日期:', result)
  }

  return (
    <>
      <button onClick={() => setShow(true)}>选择日期</button>

      <LunarDatePicker
        show={show}
        value={date}
        showLunar={true}
        endYear={2030}
        color="#D03F3F"
        confirmText="确定"
        cancelText="取消"
        onUpdateShow={setShow}
        onUpdateValue={setDate}
        onConfirm={onConfirm}
        onCancel={() => console.log('取消')}
        onChange={(result) => console.log('变化:', result)}
      />
    </>
  )
}
```

### LunarDateTimePicker（日期时间选择器）

```tsx
import { useState } from 'react'
import { LunarDateTimePicker } from 'lunar-date-picker/react'

function App() {
  const [show, setShow] = useState(false)
  const [date, setDate] = useState(new Date())

  function onConfirm(result) {
    console.log('选中日期时间:', result)
  }

  return (
    <>
      <button onClick={() => setShow(true)}>选择日期时间</button>

      <LunarDateTimePicker
        show={show}
        value={date}
        type={1}
        timeFields={['hour', 'minute']}
        showUnit={true}
        unclearFirst={false}
        endYear={2030}
        color="#D03F3F"
        confirmText="确定"
        cancelText="取消"
        onUpdateShow={setShow}
        onUpdateValue={setDate}
        onConfirm={onConfirm}
      />
    </>
  )
}
```

### React Props 说明

React 组件的 Props 与 Vue 组件基本一致，主要区别：

- Vue 使用 `v-model:show` 和 `v-model:value`，React 使用 `show`/`onUpdateShow` 和 `value`/`onUpdateValue`
- Vue 使用 `@confirm`、`@cancel`、`@change`，React 使用 `onConfirm`、`onCancel`、`onChange`
- React 组件的属性使用驼峰命名（如 `showLunar`），Vue 组件使用短横线命名（如 `show-lunar`）

## 核心 API

如果你想在原生 JavaScript 或其他框架中使用，可以直接使用核心类：

```javascript
import { DatePickerCore, DateTimePickerCore } from 'lunar-date-picker'
import 'lunar-date-picker/style.css' // 核心 API 需要手动导入样式

const container = document.getElementById('picker')
const picker = new DatePickerCore(container, {
  defaultDate: new Date(),
  showLunar: true,
  endYear: 2030,
  primaryColor: '#D03F3F',
  onChange: (result) => console.log(result),
  onConfirm: (result) => console.log(result),
  onCancel: () => console.log('cancel')
})

// 获取当前选中的结果
const result = picker.getResult()

// 切换日历类型
picker.switchCalendarType('lunar')

// 设置日期
picker.setDate(new Date())

// 销毁实例
picker.destroy()
```

## 本地开发与测试

### 构建项目

```bash
npm run build
```

### 在本地项目中测试

**方法 1：使用 npm pack（推荐）**

```bash
# 在库目录中打包
npm pack

# 在你的测试项目中安装
npm install /path/to/lunar-date-picker-1.0.0.tgz
```

**方法 2：使用 npm link**

```bash
# 在库目录中创建全局链接
npm link

# 在你的测试项目中链接
npm link lunar-date-picker
```

### 运行示例

```bash
# Vue 示例
cd examples/vue-demo
npm install
npm run dev

# React 示例
cd examples/react-demo
npm install
npm run dev
```

## License

MIT
