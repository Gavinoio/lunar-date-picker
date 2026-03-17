<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { DateTimePickerCore } from '../core/datetime-picker/DateTimePickerCore'
import type { DateTimeResult } from '../core/types'
import type { PickerType, TimeField } from '../core/types'

interface Props {
  show?: boolean
  value?: Date
  type?: PickerType // 0: 只公历, 1: 公历+农历切换, 2: 默认农历
  timeFields?: TimeField[] // 要显示的时间字段，例如 ['hour', 'minute'] 或 ['hour', 'minute', 'second']
  showUnit?: boolean // 是否显示单位文字（年、月、日、时、分、秒）
  unclearFirst?: boolean // "不清楚"选项是否放在时间列的最前面
  endYear?: number
  color?: string
  confirmText?: string
  cancelText?: string
}

interface Emits {
  (e: 'update:show', val: boolean): void
  (e: 'update:value', val: Date): void
  (e: 'confirm', result: DateTimeResult): void
  (e: 'cancel'): void
  (e: 'change', result: DateTimeResult): void
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  value: () => new Date(),
  type: 1,
  timeFields: () => ['hour', 'minute'],
  showUnit: true,
  unclearFirst: false,
  endYear: () => new Date().getFullYear(),
  color: '#D03F3F',
  confirmText: '确定',
  cancelText: '取消'
})

const emit = defineEmits<Emits>()

const containerRef = ref<HTMLElement>()
const visible = ref(false)
const animating = ref(false)
const activeTab = ref<'solar' | 'lunar'>(props.type === 2 ? 'lunar' : 'solar')

let core: DateTimePickerCore | null = null

function initCore() {
  if (!containerRef.value) return
  core?.destroy()
  core = new DateTimePickerCore(containerRef.value, {
    defaultDate: props.value,
    type: props.type,
    timeFields: props.timeFields,
    showUnit: props.showUnit,
    unclearFirst: props.unclearFirst,
    endYear: props.endYear,
    primaryColor: props.color,
    onChange: result => emit('change', result),
    onConfirm: () => {},
    onCancel: () => {}
  })
}

watch(
  () => props.show,
  async val => {
    if (val) {
      visible.value = true
      await nextTick()
      initCore()
      requestAnimationFrame(() => {
        animating.value = true
      })
    } else {
      animating.value = false
      setTimeout(() => {
        visible.value = false
        core?.destroy()
        core = null
      }, 300)
    }
  }
)

watch(
  () => props.value,
  val => {
    if (val && core) core.setDate(val)
  }
)

watch(
  () => props.type,
  val => {
    activeTab.value = val === 2 ? 'lunar' : 'solar'
  }
)

function switchTab(tab: 'solar' | 'lunar') {
  if (activeTab.value === tab) return
  activeTab.value = tab
  core?.switchCalendarType(tab)
}

function handleConfirm() {
  if (!core) return
  const result = core.getResult()
  emit('update:value', result.date)
  emit('update:show', false)
  emit('confirm', result)
}

function handleCancel() {
  emit('update:show', false)
  emit('cancel')
}

onUnmounted(() => {
  core?.destroy()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="ldp-overlay"
    >
      <!-- 遮罩 -->
      <div
        class="ldp-mask"
        :class="{ 'ldp-leave': !animating }"
        @click="handleCancel"
      />

      <!-- 面板 -->
      <div
        class="ldp-layout"
        :class="{ 'ldp-show': animating }"
        :style="{ '--ldp-primary': color }"
        @click.stop
      >
        <!-- 头部 -->
        <div class="ldp-header">
          <div
            class="ldp-cancel"
            @click="handleCancel"
          >
            {{ cancelText }}
          </div>

          <!-- 公历/农历切换（type !== 0 时显示） -->
          <div
            v-if="type !== 0"
            class="ldp-btn-group"
          >
            <div
              class="ldp-solar-btn ldp-btn"
              :class="{ active: activeTab === 'solar' }"
              @click="switchTab('solar')"
            >
              公历
            </div>
            <div
              class="ldp-lunar-btn ldp-btn"
              :class="{ active: activeTab === 'lunar' }"
              @click="switchTab('lunar')"
            >
              农历
            </div>
          </div>
          <div v-else />

          <div
            class="ldp-confirm"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </div>
        </div>

        <!-- 滚动列容器 -->
        <div
          ref="containerRef"
          class="ldp-container"
        />
      </div>
    </div>
  </Teleport>
</template>
