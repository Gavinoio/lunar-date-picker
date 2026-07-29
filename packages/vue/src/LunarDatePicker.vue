<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
import { DatePickerCore } from '../../core/src/date-picker/DatePickerCore'
import { resolveLocale } from '../../core/src/locale'
import type { CalendarMode, CalendarType, DateResult, PickerLocale } from '../../core/src/types'

interface Props {
  show?: boolean
  value?: Date
  calendarMode?: CalendarMode
  defaultCalendar?: CalendarType
  startYear?: number
  endYear?: number
  color?: string
  locale?: PickerLocale
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
  calendarMode: 'switch',
  defaultCalendar: 'solar',
  startYear: undefined,
  endYear: () => new Date().getFullYear(),
  color: '#D03F3F',
  locale: undefined
})

const emit = defineEmits<Emits>()

const containerRef = ref<HTMLElement>()
const visible = ref(false)
const animating = ref(false)
const activeCalendar = ref<CalendarType>(getInitialCalendar(props.calendarMode, props.defaultCalendar))
const labels = computed(() => resolveLocale(props.locale))

let core: DatePickerCore | null = null

function getInitialCalendar(calendarMode: CalendarMode, defaultCalendar: CalendarType): CalendarType {
  if (calendarMode === 'solar') return 'solar'
  if (calendarMode === 'lunar') return 'lunar'
  return defaultCalendar
}

function initCore() {
  if (!containerRef.value) return
  core?.destroy()
  activeCalendar.value = getInitialCalendar(props.calendarMode, props.defaultCalendar)
  core = new DatePickerCore(containerRef.value, {
    defaultDate: props.value,
    calendarMode: props.calendarMode,
    defaultCalendar: props.defaultCalendar,
    startYear: props.startYear,
    endYear: props.endYear,
    primaryColor: props.color,
    locale: props.locale,
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

watch(
  () => props.value,
  val => {
    if (val && core) core.setDate(val)
  }
)

watch(
  () => [props.calendarMode, props.defaultCalendar] as const,
  ([calendarMode, defaultCalendar]) => {
    const nextCalendar = getInitialCalendar(calendarMode, defaultCalendar)
    activeCalendar.value = nextCalendar
    core?.switchCalendarType(nextCalendar)
  }
)

function toggleLunar() {
  activeCalendar.value = activeCalendar.value === 'lunar' ? 'solar' : 'lunar'
  core?.switchCalendarType(activeCalendar.value)
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
            {{ labels.cancel }}
          </div>
          <div />
          <div
            class="ldp-confirm"
            @click="handleConfirm"
          >
            {{ labels.confirm }}
          </div>
        </div>

        <div
          ref="containerRef"
          class="ldp-container"
        />

        <div
          v-if="calendarMode === 'switch'"
          class="ldp-footer"
        >
          <div
            class="ldp-lunar-toggle"
            :class="{ active: activeCalendar === 'lunar' }"
            @click="toggleLunar"
          >
            <div class="ldp-lunar-circle" />
            <span>{{ labels.lunar }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
