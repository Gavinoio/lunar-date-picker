<script setup lang="ts">
import { ref } from 'vue'
import { LunarDateTimePicker, LunarDatePicker } from '../../../packages/vue/src'
import type { DateResult, DateTimeResult, PickerLocale } from '../../../packages/vue/src'
import logoUrl from '../../../assets/lunar-picker-logo.svg'

type PickerResult = DateResult | DateTimeResult
type DemoKey =
  | 'datetimeSwitch'
  | 'datetimeLunar'
  | 'datetimeSecond'
  | 'datetimeTheme'
  | 'datetimeLocale'
  | 'datetimeRange'
  | 'dateSwitch'
  | 'dateLocale'
  | 'dateRange'

const englishLocale: PickerLocale = {
  confirm: 'Apply',
  cancel: 'Close',
  solar: 'Solar',
  lunar: 'Lunar'
}

const codeSnippets: Record<DemoKey, string> = {
  datetimeSwitch: `// script setup
import { ref } from 'vue'
import { LunarDateTimePicker } from 'lunar-picker/vue'
// 通常无需手动引入；样式未自动加载时再引入：
// import 'lunar-picker/style.css'

const show = ref(false)
const value = ref(new Date())

// template
  <button @click="show = true">选择日期时间</button>
  <LunarDateTimePicker
    v-model:show="show"
    v-model:value="value"
    calendar-mode="switch"
    default-calendar="solar"
    @confirm="result => console.log(result)"
  />`,
  datetimeLunar: `<LunarDateTimePicker
  v-model:show="show"
  v-model:value="value"
  calendar-mode="switch"
  default-calendar="lunar"
  @confirm="handleConfirm"
/>`,
  datetimeSecond: `<LunarDateTimePicker
  v-model:show="show"
  v-model:value="value"
  calendar-mode="switch"
  :time-fields="['hour', 'minute', 'second']"
  unclear-position="first"
  @confirm="handleConfirm"
/>`,
  datetimeTheme: `<LunarDateTimePicker
  v-model:show="show"
  v-model:value="value"
  calendar-mode="switch"
  color="#2563EB"
  @confirm="handleConfirm"
/>`,
  datetimeLocale: `// script setup
const locale = {
  confirm: 'Apply',
  cancel: 'Close',
  solar: 'Solar',
  lunar: 'Lunar'
}

// template
  <LunarDateTimePicker
    v-model:show="show"
    v-model:value="value"
    calendar-mode="switch"
    :time-fields="['hour', 'minute']"
    unclear-position="first"
    :locale="locale"
    color="#16A34A"
    @confirm="handleConfirm"
  />`,
  datetimeRange: `<LunarDateTimePicker
  v-model:show="show"
  v-model:value="value"
  calendar-mode="switch"
  :start-year="2020"
  :end-year="2026"
  :time-fields="['hour', 'minute']"
  color="#7C3AED"
  @confirm="handleConfirm"
/>`,
  dateSwitch: `import { LunarDatePicker } from 'lunar-picker/vue'

<LunarDatePicker
  v-model:show="show"
  v-model:value="value"
  calendar-mode="switch"
  @confirm="handleConfirm"
/>`,
  dateLocale: `// script setup
const locale = {
  confirm: 'Apply',
  cancel: 'Close',
  solar: 'Solar',
  lunar: 'Lunar'
}

// template
  <LunarDatePicker
    v-model:show="show"
    v-model:value="value"
    calendar-mode="switch"
    :locale="locale"
    color="#16A34A"
    @confirm="handleConfirm"
  />`,
  dateRange: `<LunarDatePicker
  v-model:show="show"
  v-model:value="value"
  calendar-mode="switch"
  default-calendar="lunar"
  :start-year="2020"
  :end-year="2026"
  color="#7C3AED"
  @confirm="handleConfirm"
/>`
}

const visible = ref<Record<DemoKey, boolean>>({
  datetimeSwitch: false,
  datetimeLunar: false,
  datetimeSecond: false,
  datetimeTheme: false,
  datetimeLocale: false,
  datetimeRange: false,
  dateSwitch: false,
  dateLocale: false,
  dateRange: false
})

const dates = ref<Record<DemoKey, Date>>({
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

const results = ref<Record<DemoKey, string>>({
  datetimeSwitch: '',
  datetimeLunar: '',
  datetimeSecond: '',
  datetimeTheme: '',
  datetimeLocale: '',
  datetimeRange: '',
  dateSwitch: '',
  dateLocale: '',
  dateRange: ''
})

const expanded = ref<Record<DemoKey, boolean>>({
  datetimeSwitch: true,
  datetimeLunar: true,
  datetimeSecond: true,
  datetimeTheme: true,
  datetimeLocale: true,
  datetimeRange: true,
  dateSwitch: true,
  dateLocale: true,
  dateRange: true
})

const usageExpanded = ref<Record<DemoKey, boolean>>({
  datetimeSwitch: false,
  datetimeLunar: false,
  datetimeSecond: false,
  datetimeTheme: false,
  datetimeLocale: false,
  datetimeRange: false,
  dateSwitch: false,
  dateLocale: false,
  dateRange: false
})

function open(key: DemoKey) {
  visible.value[key] = true
}

function handleConfirm(key: DemoKey, result: PickerResult) {
  results.value[key] = JSON.stringify(result, null, 2)
  expanded.value[key] = true
}
</script>

<template>
  <div class="page-header">
    <div class="header-content">
      <div class="header-icon">
        <img :src="logoUrl" alt="Lunar Picker" />
      </div>
      <div class="header-text">
        <h1>Lunar Date Picker （Vue）</h1>
        <p>移动端公历/农历日期选择器，多模式、多文案、多主题演示</p>
      </div>
      <div class="header-badges">
        <span class="header-badge badge-vue">Vue 3</span>
        <span class="header-badge badge-package">lunar-picker 2.0.0</span>
      </div>
    </div>
  </div>

  <div class="demo-container">
    <div class="component-section">
      <div class="demo-card">
        <div class="section-header">
          <div class="card-label">LunarDateTimePicker</div>
          <h2 class="section-title">日期时间选择器</h2>
          <p class="section-desc">覆盖切换模式、时间字段、不清楚选项、主题色和文案定制</p>
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <span class="case-label">基础</span>
                <h3 class="card-title">公历 + 农历切换</h3>
                <p class="card-desc">默认打开公历，支持切换农历，显示小时和分钟。</p>
                <div class="feature-tags">
                  <span>calendarMode=switch</span>
                  <span>timeFields=hour/minute</span>
                </div>
              </div>
            </div>
            <div class="usage-box">
              <button
                class="usage-header"
                type="button"
                :aria-expanded="usageExpanded.datetimeSwitch"
                @click="usageExpanded.datetimeSwitch = !usageExpanded.datetimeSwitch"
              >
                <span class="usage-title">用法</span>
                <span class="result-toggle" :class="{ expanded: usageExpanded.datetimeSwitch }"
                  >▼</span
                >
              </button>
              <pre
                v-show="usageExpanded.datetimeSwitch"
              ><code>{{ codeSnippets.datetimeSwitch }}</code></pre>
            </div>
            <button class="demo-button tone-red" @click="open('datetimeSwitch')">
              选择日期时间
            </button>
            <div v-if="results.datetimeSwitch" class="result-box">
              <div
                class="result-header"
                @click="expanded.datetimeSwitch = !expanded.datetimeSwitch"
              >
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded.datetimeSwitch }">▼</span>
              </div>
              <div v-show="expanded.datetimeSwitch" class="result-content">
                <pre>{{ results.datetimeSwitch }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="visible.datetimeSwitch"
            v-model:value="dates.datetimeSwitch"
            calendar-mode="switch"
            default-calendar="solar"
            @confirm="result => handleConfirm('datetimeSwitch', result)"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <span class="case-label">农历</span>
                <h3 class="card-title">默认农历模式</h3>
                <p class="card-desc">打开面板后优先展示农历列，仍可切回公历。</p>
                <div class="feature-tags">
                  <span>defaultCalendar=lunar</span>
                </div>
              </div>
            </div>
            <div class="usage-box">
              <button
                class="usage-header"
                type="button"
                :aria-expanded="usageExpanded.datetimeLunar"
                @click="usageExpanded.datetimeLunar = !usageExpanded.datetimeLunar"
              >
                <span class="usage-title">用法</span>
                <span class="result-toggle" :class="{ expanded: usageExpanded.datetimeLunar }"
                  >▼</span
                >
              </button>
              <pre
                v-show="usageExpanded.datetimeLunar"
              ><code>{{ codeSnippets.datetimeLunar }}</code></pre>
            </div>
            <button class="demo-button tone-red" @click="open('datetimeLunar')">
              选择农历日期
            </button>
            <div v-if="results.datetimeLunar" class="result-box">
              <div class="result-header" @click="expanded.datetimeLunar = !expanded.datetimeLunar">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded.datetimeLunar }">▼</span>
              </div>
              <div v-show="expanded.datetimeLunar" class="result-content">
                <pre>{{ results.datetimeLunar }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="visible.datetimeLunar"
            v-model:value="dates.datetimeLunar"
            calendar-mode="switch"
            default-calendar="lunar"
            @confirm="result => handleConfirm('datetimeLunar', result)"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <span class="case-label">时间</span>
                <h3 class="card-title">精确到秒 + 不清楚置顶</h3>
                <p class="card-desc">显示时、分、秒，并把“不清楚”选项放在每列第一项。</p>
                <div class="feature-tags">
                  <span>timeFields=hour/minute/second</span>
                  <span>unclearPosition=first</span>
                </div>
              </div>
            </div>
            <div class="usage-box">
              <button
                class="usage-header"
                type="button"
                :aria-expanded="usageExpanded.datetimeSecond"
                @click="usageExpanded.datetimeSecond = !usageExpanded.datetimeSecond"
              >
                <span class="usage-title">用法</span>
                <span class="result-toggle" :class="{ expanded: usageExpanded.datetimeSecond }"
                  >▼</span
                >
              </button>
              <pre
                v-show="usageExpanded.datetimeSecond"
              ><code>{{ codeSnippets.datetimeSecond }}</code></pre>
            </div>
            <button class="demo-button tone-red" @click="open('datetimeSecond')">
              选择精确时间
            </button>
            <div v-if="results.datetimeSecond" class="result-box">
              <div
                class="result-header"
                @click="expanded.datetimeSecond = !expanded.datetimeSecond"
              >
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded.datetimeSecond }">▼</span>
              </div>
              <div v-show="expanded.datetimeSecond" class="result-content">
                <pre>{{ results.datetimeSecond }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="visible.datetimeSecond"
            v-model:value="dates.datetimeSecond"
            calendar-mode="switch"
            :time-fields="['hour', 'minute', 'second']"
            unclear-position="first"
            @confirm="result => handleConfirm('datetimeSecond', result)"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <span class="case-label">主题</span>
                <h3 class="card-title">自定义主题色</h3>
                <p class="card-desc">通过 color 修改确认按钮、切换按钮和选中态主色。</p>
                <div class="feature-tags">
                  <span>color=#2563EB</span>
                </div>
              </div>
            </div>
            <div class="usage-box">
              <button
                class="usage-header"
                type="button"
                :aria-expanded="usageExpanded.datetimeTheme"
                @click="usageExpanded.datetimeTheme = !usageExpanded.datetimeTheme"
              >
                <span class="usage-title">用法</span>
                <span class="result-toggle" :class="{ expanded: usageExpanded.datetimeTheme }"
                  >▼</span
                >
              </button>
              <pre
                v-show="usageExpanded.datetimeTheme"
              ><code>{{ codeSnippets.datetimeTheme }}</code></pre>
            </div>
            <button class="demo-button tone-blue" @click="open('datetimeTheme')">
              打开蓝色主题
            </button>
            <div v-if="results.datetimeTheme" class="result-box">
              <div class="result-header" @click="expanded.datetimeTheme = !expanded.datetimeTheme">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded.datetimeTheme }">▼</span>
              </div>
              <div v-show="expanded.datetimeTheme" class="result-content">
                <pre>{{ results.datetimeTheme }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="visible.datetimeTheme"
            v-model:value="dates.datetimeTheme"
            calendar-mode="switch"
            color="#2563EB"
            @confirm="result => handleConfirm('datetimeTheme', result)"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <span class="case-label">文案</span>
                <h3 class="card-title">自定义 locale</h3>
                <p class="card-desc">统一替换确认、取消、公历、农历四个面板文案。</p>
                <div class="feature-tags">
                  <span>locale.confirm=Apply</span>
                  <span>locale.solar=Solar</span>
                </div>
              </div>
            </div>
            <div class="usage-box">
              <button
                class="usage-header"
                type="button"
                :aria-expanded="usageExpanded.datetimeLocale"
                @click="usageExpanded.datetimeLocale = !usageExpanded.datetimeLocale"
              >
                <span class="usage-title">用法</span>
                <span class="result-toggle" :class="{ expanded: usageExpanded.datetimeLocale }"
                  >▼</span
                >
              </button>
              <pre
                v-show="usageExpanded.datetimeLocale"
              ><code>{{ codeSnippets.datetimeLocale }}</code></pre>
            </div>
            <button class="demo-button tone-green" @click="open('datetimeLocale')">
              Open picker
            </button>
            <div v-if="results.datetimeLocale" class="result-box">
              <div
                class="result-header"
                @click="expanded.datetimeLocale = !expanded.datetimeLocale"
              >
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded.datetimeLocale }">▼</span>
              </div>
              <div v-show="expanded.datetimeLocale" class="result-content">
                <pre>{{ results.datetimeLocale }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="visible.datetimeLocale"
            v-model:value="dates.datetimeLocale"
            calendar-mode="switch"
            :time-fields="['hour', 'minute']"
            unclear-position="first"
            :locale="englishLocale"
            color="#16A34A"
            @confirm="result => handleConfirm('datetimeLocale', result)"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <span class="case-label">范围</span>
                <h3 class="card-title">年份范围 + 时间选择</h3>
                <p class="card-desc">
                  LunarDateTimePicker 同样支持 startYear/endYear，限制年份列在 2020-2026 内。
                </p>
                <div class="feature-tags">
                  <span>startYear=2020</span>
                  <span>endYear=2026</span>
                  <span>timeFields=hour/minute</span>
                </div>
              </div>
            </div>
            <div class="usage-box">
              <button
                class="usage-header"
                type="button"
                :aria-expanded="usageExpanded.datetimeRange"
                @click="usageExpanded.datetimeRange = !usageExpanded.datetimeRange"
              >
                <span class="usage-title">用法</span>
                <span class="result-toggle" :class="{ expanded: usageExpanded.datetimeRange }"
                  >▼</span
                >
              </button>
              <pre
                v-show="usageExpanded.datetimeRange"
              ><code>{{ codeSnippets.datetimeRange }}</code></pre>
            </div>
            <button class="demo-button tone-purple" @click="open('datetimeRange')">
              选择范围内日期时间
            </button>
            <div v-if="results.datetimeRange" class="result-box">
              <div class="result-header" @click="expanded.datetimeRange = !expanded.datetimeRange">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded.datetimeRange }">▼</span>
              </div>
              <div v-show="expanded.datetimeRange" class="result-content">
                <pre>{{ results.datetimeRange }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="visible.datetimeRange"
            v-model:value="dates.datetimeRange"
            calendar-mode="switch"
            :start-year="2020"
            :end-year="2026"
            :time-fields="['hour', 'minute']"
            color="#7C3AED"
            @confirm="result => handleConfirm('datetimeRange', result)"
          />
        </div>
      </div>
    </div>

    <div class="component-section">
      <div class="demo-card">
        <div class="section-header">
          <div class="card-label">LunarDatePicker</div>
          <h2 class="section-title">日期选择器</h2>
          <p class="section-desc">展示日期-only 场景、农历切换、年份范围和主题色</p>
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <span class="case-label">日期</span>
                <h3 class="card-title">公历 + 农历切换</h3>
                <p class="card-desc">只选择日期，不包含任何时间字段。</p>
                <div class="feature-tags">
                  <span>DateResult</span>
                  <span>calendarMode=switch</span>
                </div>
              </div>
            </div>
            <div class="usage-box">
              <button
                class="usage-header"
                type="button"
                :aria-expanded="usageExpanded.dateSwitch"
                @click="usageExpanded.dateSwitch = !usageExpanded.dateSwitch"
              >
                <span class="usage-title">用法</span>
                <span class="result-toggle" :class="{ expanded: usageExpanded.dateSwitch }">▼</span>
              </button>
              <pre
                v-show="usageExpanded.dateSwitch"
              ><code>{{ codeSnippets.dateSwitch }}</code></pre>
            </div>
            <button class="demo-button tone-red" @click="open('dateSwitch')">选择日期</button>
            <div v-if="results.dateSwitch" class="result-box">
              <div class="result-header" @click="expanded.dateSwitch = !expanded.dateSwitch">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded.dateSwitch }">▼</span>
              </div>
              <div v-show="expanded.dateSwitch" class="result-content">
                <pre>{{ results.dateSwitch }}</pre>
              </div>
            </div>
          </div>
          <LunarDatePicker
            v-model:show="visible.dateSwitch"
            v-model:value="dates.dateSwitch"
            calendar-mode="switch"
            @confirm="result => handleConfirm('dateSwitch', result)"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <span class="case-label">文案</span>
                <h3 class="card-title">自定义 locale</h3>
                <p class="card-desc">
                  LunarDatePicker 同样支持替换确认、取消、公历、农历四个文案。
                </p>
                <div class="feature-tags">
                  <span>locale.confirm=Apply</span>
                  <span>locale.solar=Solar</span>
                </div>
              </div>
            </div>
            <div class="usage-box">
              <button
                class="usage-header"
                type="button"
                :aria-expanded="usageExpanded.dateLocale"
                @click="usageExpanded.dateLocale = !usageExpanded.dateLocale"
              >
                <span class="usage-title">用法</span>
                <span class="result-toggle" :class="{ expanded: usageExpanded.dateLocale }">▼</span>
              </button>
              <pre
                v-show="usageExpanded.dateLocale"
              ><code>{{ codeSnippets.dateLocale }}</code></pre>
            </div>
            <button class="demo-button tone-green" @click="open('dateLocale')">
              Open date picker
            </button>
            <div v-if="results.dateLocale" class="result-box">
              <div class="result-header" @click="expanded.dateLocale = !expanded.dateLocale">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded.dateLocale }">▼</span>
              </div>
              <div v-show="expanded.dateLocale" class="result-content">
                <pre>{{ results.dateLocale }}</pre>
              </div>
            </div>
          </div>
          <LunarDatePicker
            v-model:show="visible.dateLocale"
            v-model:value="dates.dateLocale"
            calendar-mode="switch"
            :locale="englishLocale"
            color="#16A34A"
            @confirm="result => handleConfirm('dateLocale', result)"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <span class="case-label">范围</span>
                <h3 class="card-title">年份范围 + 自定义主题色</h3>
                <p class="card-desc">限制在 2020-2026 年内选择，并使用紫色主题。</p>
                <div class="feature-tags">
                  <span>startYear=2020</span>
                  <span>endYear=2026</span>
                  <span>color=#7C3AED</span>
                </div>
              </div>
            </div>
            <div class="usage-box">
              <button
                class="usage-header"
                type="button"
                :aria-expanded="usageExpanded.dateRange"
                @click="usageExpanded.dateRange = !usageExpanded.dateRange"
              >
                <span class="usage-title">用法</span>
                <span class="result-toggle" :class="{ expanded: usageExpanded.dateRange }">▼</span>
              </button>
              <pre v-show="usageExpanded.dateRange"><code>{{ codeSnippets.dateRange }}</code></pre>
            </div>
            <button class="demo-button tone-purple" @click="open('dateRange')">
              选择范围内日期
            </button>
            <div v-if="results.dateRange" class="result-box">
              <div class="result-header" @click="expanded.dateRange = !expanded.dateRange">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded.dateRange }">▼</span>
              </div>
              <div v-show="expanded.dateRange" class="result-content">
                <pre>{{ results.dateRange }}</pre>
              </div>
            </div>
          </div>
          <LunarDatePicker
            v-model:show="visible.dateRange"
            v-model:value="dates.dateRange"
            calendar-mode="switch"
            default-calendar="lunar"
            :start-year="2020"
            :end-year="2026"
            color="#7C3AED"
            @confirm="result => handleConfirm('dateRange', result)"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="github-link">
    <a href="https://github.com/Gavinoio/lunar-picker" target="_blank">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
      View on GitHub
    </a>
  </div>
</template>
