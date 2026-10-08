<script setup lang="ts">
/** Bootstrap 4 模态框结构(data-backdrop="static"), 直接渲染在 .gx 作用域内 */
withDefaults(defineProps<{
  show: boolean
  title?: string
  size?: '' | 'modal-lg' | 'modal-xl'
  dialogStyle?: Record<string, string>
  contentStyle?: Record<string, string>
  bodyStyle?: Record<string, string>
  bodyClass?: string
  footerClass?: string
  closable?: boolean
  headless?: boolean
}>(), {
  title: '',
  size: '',
  closable: true,
  headless: false,
  bodyClass: '',
  footerClass: ''
})

const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <template v-if="show">
    <div class="modal d-block" tabindex="-1" role="dialog">
      <div :class="['modal-dialog', size]" role="document" :style="dialogStyle">
        <div class="modal-content" :style="contentStyle">
          <div v-if="!headless" class="modal-header">
            <h4 class="modal-title">{{ title }}</h4>
            <button v-if="closable" type="button" class="close" aria-label="Close" @click="emit('close')">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div :class="['modal-body', bodyClass]" :style="bodyStyle">
            <slot />
          </div>
          <div v-if="$slots.footer" :class="['modal-footer', footerClass]">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop show"></div>
  </template>
</template>
