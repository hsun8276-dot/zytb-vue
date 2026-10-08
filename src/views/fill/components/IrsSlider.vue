<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/** ion.rangeSlider 2.3.1 单值模式的 DOM/定位复刻(flat / round 皮肤) */
const props = withDefaults(defineProps<{
  modelValue: number
  min: number
  max: number
  skin?: 'flat' | 'round'
  hideMinMax?: boolean
  hideFromTo?: boolean
  postfix?: string
}>(), {
  skin: 'flat',
  hideMinMax: false,
  hideFromTo: false,
  postfix: ''
})

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>()

const root = ref<HTMLElement | null>(null)
const width = ref(0)
const handleWidth = computed(() => (props.skin === 'round' ? 24 : 16))
let ro: ResizeObserver | null = null

onMounted(() => {
  if (!root.value) return
  width.value = root.value.clientWidth
  ro = new ResizeObserver(() => { width.value = root.value?.clientWidth ?? 0 })
  ro.observe(root.value)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  stopDrag()
})

const value = computed(() => Math.min(Math.max(props.modelValue, props.min), props.max))
const pHandle = computed(() => (width.value ? (handleWidth.value / width.value) * 100 : 0))
const percent = computed(() => (props.max === props.min ? 0 : ((value.value - props.min) / (props.max - props.min)) * 100))
const pFake = computed(() => (percent.value / 100) * (100 - pHandle.value))

function valueAt(clientX: number) {
  const el = root.value
  if (!el) return value.value
  const rect = el.getBoundingClientRect()
  const usable = rect.width - handleWidth.value
  if (usable <= 0) return props.min
  const ratio = Math.min(Math.max((clientX - rect.left - handleWidth.value / 2) / usable, 0), 1)
  return Math.round(props.min + ratio * (props.max - props.min))
}

function update(clientX: number) {
  const v = valueAt(clientX)
  if (v !== props.modelValue) emit('update:modelValue', v)
}

function onMove(e: PointerEvent) { update(e.clientX) }

function stopDrag() {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', stopDrag)
}

function startDrag(e: PointerEvent) {
  e.preventDefault()
  update(e.clientX)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', stopDrag)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') emit('update:modelValue', Math.max(value.value - 1, props.min))
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') emit('update:modelValue', Math.min(value.value + 1, props.max))
}
</script>

<template>
  <span ref="root" :class="['irs', 'irs--' + skin]" @pointerdown="startDrag">
    <span class="irs">
      <span class="irs-line" tabindex="0" @keydown="onKey"></span>
      <span class="irs-min" :style="{ visibility: hideMinMax ? 'hidden' : 'visible' }">{{ min }}{{ postfix }}</span>
      <span class="irs-max" :style="{ visibility: hideMinMax ? 'hidden' : 'visible' }">{{ max }}{{ postfix }}</span>
      <span class="irs-from" style="visibility: hidden;">0</span>
      <span class="irs-to" style="visibility: hidden;">0</span>
      <span
        class="irs-single"
        :style="{
          visibility: hideFromTo ? 'hidden' : 'visible',
          left: pFake + pHandle / 2 + '%',
          transform: 'translateX(-50%)'
        }"
      >{{ value }}{{ postfix }}</span>
    </span>
    <span class="irs-grid"></span>
    <span class="irs-bar irs-bar--single" :style="{ left: '0px', width: pFake + pHandle / 2 + '%' }"></span>
    <span class="irs-shadow shadow-single"></span>
    <span class="irs-handle single" :style="{ left: pFake + '%' }"><i></i><i></i><i></i></span>
  </span>
</template>
