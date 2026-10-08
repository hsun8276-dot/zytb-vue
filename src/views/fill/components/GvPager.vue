<script setup lang="ts">
import { computed, ref } from 'vue'

/** DevExpress Bootstrap GridView 底部分页条 */
const props = withDefaults(defineProps<{ total: number; page: number; size: number; sizes?: number[] }>(), {
  sizes: () => [10, 20, 50]
})

const emit = defineEmits<{ (e: 'update:page', v: number): void; (e: 'update:size', v: number): void }>()

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.size)))
const open = ref(false)

const numbers = computed(() => {
  const n = pages.value
  const cur = props.page
  if (n <= 9) return Array.from({ length: n }, (_, i) => i + 1)
  const start = Math.max(1, Math.min(cur - 4, n - 8))
  return Array.from({ length: 9 }, (_, i) => start + i)
})

function go(p: number) {
  if (p >= 1 && p <= pages.value && p !== props.page) emit('update:page', p)
}

function pick(s: number) {
  open.value = false
  emit('update:size', s)
  emit('update:page', 1)
}
</script>

<template>
  <div class="card-body">
    <nav class="dxbs-pager d-flex align-items-center" style="width: 100%;">
      <div class="summary form-inline form-group mb-0 mr-3">
        <div class="form-control-plaintext">第 {{ page }} / {{ pages }} 页 ({{ total }} 项)</div>
      </div>
      <ul class="pagination mb-0">
        <li :class="['page-item', { disabled: page <= 1 }]"><a class="page-link" href="javascript:void(0)" @click="go(page - 1)">上一页</a></li>
        <li v-for="n in numbers" :key="n" :class="['page-item page-number', { active: n === page }]">
          <a class="page-link" href="javascript:void(0)" @click="go(n)">{{ n }}</a>
        </li>
        <li :class="['page-item', { disabled: page >= pages }]"><a class="page-link" href="javascript:void(0)" @click="go(page + 1)">下一页</a></li>
      </ul>
      <div class="form-inline form-group page-size ml-auto mb-0">
        <label class="col-form-label mr-1">页尺寸：</label>
        <div class="input-group position-relative">
          <input class="form-control" type="text" readonly :value="size" style="width: 60px;" />
          <div class="input-group-append">
            <span class="btn btn-secondary dropdown-toggle" @click="open = !open"></span>
          </div>
          <ul v-if="open" class="dropdown-menu show" style="position: absolute; top: 100%; right: 0; left: auto;">
            <li v-for="s in sizes" :key="s"><a class="dropdown-item" href="javascript:void(0)" @click="pick(s)">{{ s }}</a></li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>
