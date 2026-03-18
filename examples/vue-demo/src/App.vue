<script setup lang="ts">
import { ref } from 'vue'
import { LunarDateTimePicker, LunarDatePicker } from '../../../src/vue'
import '../../../src/styles/index.css'

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
const show4 = ref(false)
const show5 = ref(false)
const show6 = ref(false)

const date1 = ref(new Date())
const date2 = ref(new Date())
const date3 = ref(new Date())
const date4 = ref(new Date())
const date5 = ref(new Date())
const date6 = ref(new Date())

const result1 = ref('')
const result2 = ref('')
const result3 = ref('')
const result4 = ref('')
const result5 = ref('')
const result6 = ref('')

const expanded1 = ref(true)
const expanded2 = ref(true)
const expanded3 = ref(true)
const expanded4 = ref(true)
const expanded5 = ref(true)
const expanded6 = ref(true)

function formatResult(result: any) {
  return JSON.stringify(result, null, 2)
}

function handleConfirm1(result: any) {
  result1.value = formatResult(result)
  expanded1.value = true
}
function handleConfirm2(result: any) {
  result2.value = formatResult(result)
  expanded2.value = true
}
function handleConfirm3(result: any) {
  result3.value = formatResult(result)
  expanded3.value = true
}
function handleConfirm4(result: any) {
  result4.value = formatResult(result)
  expanded4.value = true
}
function handleConfirm5(result: any) {
  result5.value = formatResult(result)
  expanded5.value = true
}
function handleConfirm6(result: any) {
  result6.value = formatResult(result)
  expanded6.value = true
}
</script>

<template>
  <div class="page-header">
    <div class="header-content">
      <div class="header-icon">🌙</div>
      <div class="header-text">
        <h1>Lunar Date Picker</h1>
        <p>移动端公历/农历日期选择器</p>
      </div>
    </div>
  </div>

  <div class="demo-container">
    <!-- LunarDateTimePicker 组件示例 -->
    <div class="component-section">
      <div class="demo-card">
        <div class="section-header">
          <div class="card-label">LunarDateTimePicker</div>
          <h2 class="section-title">日期时间选择器</h2>
          <p class="section-desc">支持公历/农历切换，可选择日期和时间</p>
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <h3 class="card-title">公历+农历切换</h3>
                <p class="card-desc">支持公历/农历切换，显示时分</p>
              </div>
            </div>
            <button class="demo-button" @click="show1 = true">选择日期时间</button>
            <div v-if="result1" class="result-box">
              <div class="result-header" @click="expanded1 = !expanded1">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded1 }">▼</span>
              </div>
              <div v-show="expanded1" class="result-content">
                <pre>{{ result1 }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="show1"
            v-model:value="date1"
            :type="1"
            @confirm="handleConfirm1"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <h3 class="card-title">默认农历模式</h3>
                <p class="card-desc">打开时默认显示农历日期</p>
              </div>
            </div>
            <button class="demo-button" @click="show2 = true">选择农历日期</button>
            <div v-if="result2" class="result-box">
              <div class="result-header" @click="expanded2 = !expanded2">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded2 }">▼</span>
              </div>
              <div v-show="expanded2" class="result-content">
                <pre>{{ result2 }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="show2"
            v-model:value="date2"
            :type="2"
            @confirm="handleConfirm2"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <h3 class="card-title">纯公历模式</h3>
                <p class="card-desc">不显示公历/农历切换按钮</p>
              </div>
            </div>
            <button class="demo-button" @click="show5 = true">选择公历日期</button>
            <div v-if="result5" class="result-box">
              <div class="result-header" @click="expanded5 = !expanded5">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded5 }">▼</span>
              </div>
              <div v-show="expanded5" class="result-content">
                <pre>{{ result5 }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="show5"
            v-model:value="date5"
            :type="0"
            @confirm="handleConfirm5"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <h3 class="card-title">精确到秒</h3>
                <p class="card-desc">显示时、分、秒三个时间字段</p>
              </div>
            </div>
            <button class="demo-button" @click="show6 = true">选择精确时间</button>
            <div v-if="result6" class="result-box">
              <div class="result-header" @click="expanded6 = !expanded6">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded6 }">▼</span>
              </div>
              <div v-show="expanded6" class="result-content">
                <pre>{{ result6 }}</pre>
              </div>
            </div>
          </div>
          <LunarDateTimePicker
            v-model:show="show6"
            v-model:value="date6"
            :type="1"
            :time-fields="['hour', 'minute', 'second']"
            @confirm="handleConfirm6"
          />
        </div>
      </div>
    </div>

    <!-- LunarDatePicker 组件示例 -->
    <div class="component-section">
      <div class="demo-card">
        <div class="section-header">
          <div class="card-label">LunarDatePicker</div>
          <h2 class="section-title">日期选择器</h2>
          <p class="section-desc">只选择日期，不包含时间</p>
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <h3 class="card-title">公历+农历切换</h3>
                <p class="card-desc">支持公历/农历切换</p>
              </div>
            </div>
            <button class="demo-button" @click="show3 = true">选择日期</button>
            <div v-if="result3" class="result-box">
              <div class="result-header" @click="expanded3 = !expanded3">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded3 }">▼</span>
              </div>
              <div v-show="expanded3" class="result-content">
                <pre>{{ result3 }}</pre>
              </div>
            </div>
          </div>
          <LunarDatePicker
            v-model:show="show3"
            v-model:value="date3"
            @confirm="handleConfirm3"
          />
        </div>

        <div class="demo-item">
          <div class="card-body">
            <div class="card-header">
              <div class="card-info">
                <h3 class="card-title">纯公历模式</h3>
                <p class="card-desc">不显示农历切换，纯公历日期</p>
              </div>
            </div>
            <button class="demo-button" @click="show4 = true">选择日期</button>
            <div v-if="result4" class="result-box">
              <div class="result-header" @click="expanded4 = !expanded4">
                <span class="result-title">返回数据</span>
                <span class="result-toggle" :class="{ expanded: expanded4 }">▼</span>
              </div>
              <div v-show="expanded4" class="result-content">
                <pre>{{ result4 }}</pre>
              </div>
            </div>
          </div>
          <LunarDatePicker
            v-model:show="show4"
            v-model:value="date4"
            :show-lunar="false"
            @confirm="handleConfirm4"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="github-link">
    <a href="https://github.com/Gavinoio/lunar-date-picker" target="_blank">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
      View on GitHub
    </a>
  </div>
</template>
