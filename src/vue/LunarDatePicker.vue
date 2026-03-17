<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { DatePickerCore } from '../core/date-picker/DatePickerCore'
import type { DateResult } from '../core/types'

interface Props {
  show?: boolean
  value?: Date
  showLunar?: boolean
  endYear?: number
  color?: string
  confirmText?: string
  cancelText?: string
}

interface Emits {
  (e: 'update:show', val: boolean): void
  (e: 'update:value', val: Date): void
  (e: 'confirm', result: DateResult): void
  (e: 'cancel'): void
  (e: 'change', result: DateResult): void
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  value: () => new Date(),
  showLunar: true,
  endYear: () => new Date().getFullYear(),
  color: '#D03F3F',
  confirmText: '确定',
  cancelText: '取消'
})

const emit = defineEmits<Emits>()

const containerRef = ref<HTMLElement>()
const visible = ref(false)
const animating = ref(false)
const isLunar = ref(false)

let core: DatePickerCore | null = null

function initCore() {
  if (!containerRef.value) return
  core?.destroy()
  isLunar.value = false
  core = new DatePickerCore(containerRef.value, {
    defaultDate: props.value,
    showLunar: props.showLunar,
    endYear: props.endYear,
    primaryColor: props.color,
    onChange: result => emit('change', result)
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

function toggleLunar() {
  isLunar.value = !isLunar.value
  core?.switchCalendarType(isLunar.value ? 'lunar' : 'solar')
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

onUnmounted(() => core?.destroy())
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="ldp-overlay"
    >
      <div
        class="ldp-mask"
        :class="{ 'ldp-leave': !animating }"
        @click="handleCancel"
      />
      <div
        class="ldp-layout"
        :class="{ 'ldp-show': animating }"
        :style="{ '--ldp-primary': color }"
        @click.stop
      >
        <div class="ldp-header">
          <div
            class="ldp-cancel"
            @click="handleCancel"
          >
            {{ cancelText }}
          </div>
          <div />
          <div
            class="ldp-confirm"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </div>
        </div>

        <div
          ref="containerRef"
          class="ldp-container"
        />

        <div
          v-if="showLunar"
          class="ldp-footer"
        >
          <div
            class="ldp-lunar-toggle"
            :class="{ active: isLunar }"
            @click="toggleLunar"
          >
            <div class="ldp-lunar-circle" />
            <span>农历</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
