<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { fillApi, type DictOption, type MajorFilterItem } from '@/api/fill'
import { useGx } from '../composables/useGx'
import GvPager from './GvPager.vue'

/** 参考系统 SetAspMajorFilter.aspx: 专业白名单筛选 */
const props = defineProps<{ code: string }>()
const { notify, confirm, alert } = useGx()

const categories = ref<DictOption[]>([])
const disciplines = ref<DictOption[]>([])
const category = ref('')
const discipline = ref('')
const majorName = ref('')

const candidates = ref<MajorFilterItem[]>([])
const overflow = ref(false)
const checkedCandidates = ref<number[]>([])

const rows = ref<MajorFilterItem[]>([])
const checkedRows = ref<number[]>([])
const page = ref(1)
const size = ref(10)

const disciplineOptions = computed(() =>
  category.value ? disciplines.value.filter(d => d.code.startsWith(category.value)) : disciplines.value)

/** 每行 4 格, 首格为【全部选择】 */
const candidateRows = computed(() => {
  const cells: (MajorFilterItem | 'all' | null)[] = ['all', ...candidates.value]
  while (cells.length % 4 !== 0) cells.push(null)
  const out: (MajorFilterItem | 'all' | null)[][] = []
  for (let i = 0; i < cells.length; i += 4) out.push(cells.slice(i, i + 4))
  return out
})

const allChecked = computed(() =>
  candidates.value.length > 0 && checkedCandidates.value.length === candidates.value.length)

const pagedRows = computed(() => rows.value.slice((page.value - 1) * size.value, page.value * size.value))
const pageAllChecked = computed(() =>
  pagedRows.value.length > 0 && pagedRows.value.every(r => checkedRows.value.includes(r.id)))

function toggleAllCandidates(v: boolean) {
  checkedCandidates.value = v ? candidates.value.map(c => c.id) : []
}

function togglePageRows(v: boolean) {
  const ids = pagedRows.value.map(r => r.id)
  checkedRows.value = v
    ? Array.from(new Set([...checkedRows.value, ...ids]))
    : checkedRows.value.filter(id => !ids.includes(id))
}

async function search() {
  try {
    const r = await fillApi.dictMajors({ category: category.value, discipline: discipline.value, name: majorName.value.trim() })
    candidates.value = r.list
    overflow.value = r.overflow
    checkedCandidates.value = []
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
}

async function loadRows() {
  try {
    rows.value = await fillApi.majorFilter(props.code)
    checkedRows.value = checkedRows.value.filter(id => rows.value.some(r => r.id === id))
    const pages = Math.max(1, Math.ceil(rows.value.length / size.value))
    if (page.value > pages) page.value = pages
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
}

async function addChecked() {
  if (checkedCandidates.value.length === 0) {
    await alert('提示', '请先勾选您要添加的专业。', 'btn btn-info')
    return
  }
  try {
    await fillApi.addMajorFilter(props.code, checkedCandidates.value)
    notify('专业添加成功！', '成功', 'success', 1000)
  } catch (e) {
    notify(e, '失败', 'danger', 0)
  }
  checkedCandidates.value = []
  await loadRows()
}

async function removeOne(id: number) {
  if (!(await confirm('确认删除', '您真的要从过滤条件中移除当前专业吗？'))) return
  try {
    await fillApi.removeMajorFilter(props.code, [id])
    notify('专业移除成功！', '成功', 'success', 1000)
  } catch (e) {
    notify(e, '失败', 'danger', 0)
  }
  await loadRows()
}

async function removeChecked() {
  if (checkedRows.value.length === 0) {
    await alert('提示', '请先选择您要删除的记录。', 'btn btn-info')
    return
  }
  if (!(await confirm('确认删除', '您确认要移除选中的专业吗？', { confirmText: '确认删除' }))) return
  try {
    await fillApi.removeMajorFilter(props.code, checkedRows.value)
    notify('选中专业移除成功！', '成功', 'success', 1000)
  } catch (e) {
    notify(e, '失败', 'danger', 0)
  }
  checkedRows.value = []
  await loadRows()
}

async function removeAll() {
  if (!(await confirm('确认移除', '您确认要移除全部专业吗？', { confirmText: '确认移除' }))) return
  try {
    await fillApi.clearMajorFilter(props.code)
    notify('全部专业移除成功！', '成功', 'success', 1000)
  } catch (e) {
    notify(e, '失败', 'danger', 0)
  }
  checkedRows.value = []
  await loadRows()
}

watch(category, () => {
  discipline.value = ''
  search()
})
watch(discipline, () => search())

onMounted(async () => {
  try {
    const o = await fillApi.dictOptions()
    categories.value = o.categories
    disciplines.value = o.disciplines
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
  await Promise.all([search(), loadRows()])
})
</script>

<template>
  <div class="p-2">
    <div class="row m-1 mb-2 mt-2">
      <div class="col-sm-3 p-0">
        <div class="form-group form-inline p-0">
          <label class="col-md-5 col-form-label">学科门类：</label>
          <div class="col-md-7">
            <select v-model="category" class="form-control input-full">
              <option value="">【全部】</option>
              <option v-for="c in categories" :key="c.code" :value="c.code">{{ c.name }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="col-sm-3 p-0">
        <div class="form-group form-inline p-0">
          <label class="col-md-5 col-form-label">一级学科：</label>
          <div class="col-md-7">
            <select v-model="discipline" class="form-control input-full">
              <option value="">【全部】</option>
              <option v-for="d in disciplineOptions" :key="d.code" :value="d.code">{{ d.name }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="col-sm-4 p-0">
        <div class="form-group form-inline p-0">
          <label class="col-md-5 col-form-label">专业名称：</label>
          <div class="col-md-7">
            <input v-model="majorName" type="text" class="form-control input-full" @keydown.enter.prevent="search" />
          </div>
        </div>
      </div>
      <div class="col-sm-2">
        <a href="javascript:void(0);" class="btn btn-sm btn-secondary" @click.prevent="search"><i class="fas fa-search mr-2"></i>检索</a>
      </div>
    </div>

    <div class="row m-1 mb-2 mt-3">
      <div class="col-12 overflow-auto border rounded" style="height: 160px;">
        <table class="w-100 major-list mt-3 mb-2">
          <tbody>
            <tr v-for="(r, ri) in candidateRows" :key="ri">
              <td v-for="(c, ci) in r" :key="ci" style="width: 25%;">
                <div v-if="c === 'all'" class="form-check p-0">
                  <label class="form-check-label">
                    <input class="form-check-input" type="checkbox" :checked="allChecked"
                           @change="toggleAllCandidates(($event.target as HTMLInputElement).checked)" />
                    <span class="form-check-sign">【全部选择】</span>
                  </label>
                </div>
                <div v-else-if="c" class="form-check p-0">
                  <label class="form-check-label">
                    <input v-model="checkedCandidates" class="form-check-input" type="checkbox" :value="c.id" />
                    <span class="form-check-sign">{{ c.majorCode }} - {{ c.majorName }}</span>
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="row m-1 mb-2 mt-3">
      <div class="col p-0">
        <a href="javascript:void(0);" class="btn btn-sm btn-primary ml-2" @click.prevent="addChecked"><i class="fas fa-plus mr-2"></i>添加</a>
        <a href="javascript:void(0);" class="btn btn-sm btn-warning ml-1" @click.prevent="removeChecked"><i class="fas fa-trash-alt mr-2"></i>移除选中专业</a>
        <a href="javascript:void(0);" class="btn btn-sm btn-danger ml-1" @click.prevent="removeAll"><i class="fas fa-trash-alt mr-2"></i>全部移除</a>
        <span v-if="overflow" class="text-warning pt-2 ml-4"><strong>警告：</strong>满足筛选条件的专业过多，只显示前 200 个。</span>
      </div>
    </div>

    <div class="row m-1 mb-2 mt-3">
      <div class="col-12 p-0">
        <div class="card">
          <table class="table table-bordered table-sm table-hover gv mb-0" style="border-collapse: collapse;">
            <thead>
              <tr>
                <th style="width: 50px;">
                  <div class="form-check form-check-inline m-0">
                    <input class="position-static form-check-input" type="checkbox" :checked="pageAllChecked"
                           @change="togglePageRows(($event.target as HTMLInputElement).checked)" />
                  </div>
                </th>
                <th style="width: 80px;">操作</th>
                <th>专业代码</th>
                <th>专业名称</th>
                <th>所属一级学科</th>
                <th>所属专业门类</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in pagedRows" :key="r.id">
                <td align="center">
                  <div class="form-check form-check-inline m-0">
                    <input v-model="checkedRows" class="position-static form-check-input" type="checkbox" :value="r.id" />
                  </div>
                </td>
                <td align="center"><a href="javascript:void(0);" class="btn btn-sm btn-warning" @click.prevent="removeOne(r.id)">删除</a></td>
                <td>{{ r.majorCode }}</td>
                <td>{{ r.majorName }}</td>
                <td>{{ r.discipline }}</td>
                <td>{{ r.category }}</td>
              </tr>
              <tr v-if="rows.length === 0">
                <td colspan="6" class="text-center text-muted">没有可显示的数据</td>
              </tr>
            </tbody>
          </table>
          <GvPager v-model:page="page" v-model:size="size" :total="rows.length" />
        </div>
      </div>
    </div>
  </div>
</template>
