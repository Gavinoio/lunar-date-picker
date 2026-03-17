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

function handleConfirm1(result: any) {
  result1.value = JSON.stringify({ date: result.date.toLocaleString('zh-CN'), solar: result.solar, lunar: result.lunar, hour: result.hour, minute: result.minute }, null, 2)
}
function handleConfirm2(result: any) {
  result2.value = JSON.stringify({ date: result.date.toLocaleString('zh-CN'), lunar: result.lunar }, null, 2)
}
function handleConfirm3(result: any) {
  result3.value = JSON.stringify({ date: result.date.toLocaleString('zh-CN'), solar: result.solar, lunar: result.lunar }, null, 2)
}
function handleConfirm4(result: any) {
  result4.value = JSON.stringify({ date: result.date.toLocaleString('zh-CN'), solar: result.solar }, null, 2)
}
function handleConfirm5(result: any) {
  result5.value = JSON.stringify({ date: result.date.toLocaleString('zh-CN'), solar: result.solar, lunar: result.lunar, hour: result.hour, minute: result.minute }, null, 2)
}
function handleConfirm6(result: any) {
  result6.value = JSON.stringify({ date: result.date.toLocaleString('zh-CN'), solar: result.solar, lunar: result.lunar, hour: result.hour, minute: result.minute, second: result.second }, null, 2)
}
</script>

<template>
  <div class="demo-container">
    <h1>🌙 Lunar Date Picker Demo</h1>

    <div class="demo-section">
      <h2>1. DateTimePicker（公历+农历切换）</h2>
      <button @click="show1 = true">选择日期时间</button>
      <div v-if="result1" class="result"><pre>{{ result1 }}</pre></div>
      <LunarDateTimePicker v-model:show="show1" v-model:value="date1" :type="1" @confirm="handleConfirm1" />
    </div>

    <div class="demo-section">
      <h2>2. DateTimePicker（默认农历）</h2>
      <button @click="show2 = true">选择日期时间（农历）</button>
      <div v-if="result2" class="result"><pre>{{ result2 }}</pre></div>
      <LunarDateTimePicker v-model:show="show2" v-model:value="date2" :type="2" @confirm="handleConfirm2" />
    </div>

    <div class="demo-section">
      <h2>3. DateTimePicker（不显示公历农历切换按钮）</h2>
      <button @click="show5 = true">选择日期时间（无切换按钮）</button>
      <div v-if="result5" class="result"><pre>{{ result5 }}</pre></div>
      <LunarDateTimePicker v-model:show="show5" v-model:value="date5" :type="0" @confirm="handleConfirm5" />
    </div>

    <div class="demo-section">
      <h2>4. DateTimePicker（显示时分秒）</h2>
      <button @click="show6 = true">选择日期时间（含秒）</button>
      <div v-if="result6" class="result"><pre>{{ result6 }}</pre></div>
      <LunarDateTimePicker v-model:show="show6" v-model:value="date6" :type="1" :time-fields="['hour', 'minute', 'second']" @confirm="handleConfirm6" />
    </div>

    <div class="demo-section">
      <h2>5. DatePicker（只选日期）</h2>
      <button @click="show3 = true">选择日期</button>
      <div v-if="result3" class="result"><pre>{{ result3 }}</pre></div>
      <LunarDatePicker v-model:show="show3" v-model:value="date3" @confirm="handleConfirm3" />
    </div>

    <div class="demo-section">
      <h2>6. DatePicker（不显示农历切换按钮）</h2>
      <button @click="show4 = true">选择日期</button>
      <div v-if="result4" class="result"><pre>{{ result4 }}</pre></div>
      <LunarDatePicker v-model:show="show4" v-model:value="date4" :show-lunar="false" @confirm="handleConfirm4" />
    </div>
  </div>
</template>
