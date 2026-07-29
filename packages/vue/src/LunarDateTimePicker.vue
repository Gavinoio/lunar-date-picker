<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
import { DateTimePickerCore } from '../../core/src/datetime-picker/DateTimePickerCore'
import { resolveLocale } from '../../core/src/locale'
import type {
  CalendarMode,
  CalendarType,
  DateTimeResult,
  PickerLocale,
  TimeField
} from '../../core/src/types'

interface Props {
  show?: boolean
  value?: Date
  calendarMode?: CalendarMode
  defaultCalendar?: CalendarType
  timeFields?: TimeField[]
  showUnit?: boolean
  showUnclear?: boolean
  unclearPosition?: 'first' | 'last'
  startYear?: number
  endYear?: number
  color?: string
  locale?: PickerLocale
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
  calendarMode: 'switch',
  defaultCalendar: 'solar',
  timeFields: () => ['hour', 'minute'],
  showUnit: true,
  showUnclear: true,
  unclearPosition: 'last',
  startYear: undefined,
  endYear: () => new Date().getFullYear(),
  color: '#D03F3F',
  locale: undefined
})

const emit = defineEmits<Emits>()

const containerRef = ref<HTMLElement>()
const visible = ref(false)
const animating = ref(false)
const activeTab = ref<CalendarType>(getInitialCalendar(props.calendarMode, props.defaultCalendar))
const labels = computed(() => resolveLocale(props.locale))

let core: DateTimePickerCore | null = null

function getInitialCalendar(calendarMode: CalendarMode, defaultCalendar: CalendarType): CalendarType {
  if (calendarMode === 'solar') return 'solar'
  if (calendarMode === 'lunar') return 'lunar'
  return defaultCalendar
}

function initCore() {
  if (!containerRef.value) return
  core?.destroy()
  activeTab.value = getInitialCalendar(props.calendarMode, props.defaultCalendar)
  core = new DateTimePickerCore(containerRef.value, {
    defaultDate: props.value,
    calendarMode: props.calendarMode,
    defaultCalendar: props.defaultCalendar,
    timeFields: props.timeFields,
    showUnit: props.showUnit,
    showUnclear: props.showUnclear,
    unclearPosition: props.unclearPosition,
    startYear: props.startYear,
    endYear: props.endYear,
    primaryColor: props.color,
    locale: props.locale,
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
  () => [props.calendarMode, props.defaultCalendar] as const,
  ([calendarMode, defaultCalendar]) => {
    const nextTab = getInitialCalendar(calendarMode, defaultCalendar)
    activeTab.value = nextTab
    core?.switchCalendarType(nextTab)
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

          <div
            v-if="calendarMode === 'switch'"
            class="ldp-btn-group"
          >
            <div
              class="ldp-solar-btn ldp-btn"
              :class="{ active: activeTab === 'solar' }"
              @click="switchTab('solar')"
            >
              {{ labels.solar }}
            </div>
            <div
              class="ldp-lunar-btn ldp-btn"
              :class="{ active: activeTab === 'lunar' }"
              @click="switchTab('lunar')"
            >
              {{ labels.lunar }}
            </div>
          </div>
          <div v-else />

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
      </div>
    </div>
  </Teleport>
</template>
