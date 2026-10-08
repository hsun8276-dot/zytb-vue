<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fillApi, type MajorMappingRow } from '@/api/fill'
import { useGx } from '../composables/useGx'
import GvPager from './GvPager.vue'

/** 参考系统 ViewMajorMapping.aspx: 招生专业包含的教育部专业 */
const props = defineProps<{ code: string; rid: string }>()
const { notify } = useGx()

const rows = ref<MajorMappingRow[]>([])
const page = ref(1)
const size = ref(10)
const paged = computed(() => rows.value.slice((page.value - 1) * size.value, page.value * size.value))

onMounted(async () => {
  try {
    rows.value = await fillApi.majorMapping(props.code, props.rid)
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
})
</script>

<template>
  <div class="bg-white p-3">
    <div class="card">
      <table class="table table-bordered table-sm table-hover table-light gv mb-0" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th style="width: 120px;">专业代号</th>
            <th>专业名称</th>
            <th style="width: 100px;">专业类型</th>
            <th style="width: 100px;">大类代码</th>
            <th>大类名称</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in paged" :key="r.MajorCode">
            <td>{{ r.MajorCode }}</td>
            <td>{{ r.MajorName }}</td>
            <td>{{ r.Level }}</td>
            <td>{{ r.DisciplineCode }}</td>
            <td>{{ r.DisciplineName }}</td>
          </tr>
          <tr v-if="rows.length === 0"><td colspan="5" class="text-center text-muted">没有可显示的数据</td></tr>
        </tbody>
      </table>
      <GvPager v-model:page="page" v-model:size="size" :total="rows.length" />
    </div>
  </div>
</template>
