<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { fillApi } from '@/api/fill'
import { useGx } from '../composables/useGx'

/** 参考系统 SetAspOtherFilter.aspx: 学制/学费/关键字筛选 */
const props = defineProps<{ code: string }>()
const emit = defineEmits<{ (e: 'saved'): void }>()
const { notify } = useGx()

const PRESETS: { value: string; label: string }[] = [
  { value: '中外合作', label: '中外合作' },
  { value: '专项', label: '专项' },
  { value: '预科', label: '预科' },
  { value: '少数民族', label: '少数民族' },
  { value: '八协$八省区对等协作计划', label: '八协' },
  { value: '日语', label: '日语' },
  { value: '俄语', label: '俄语' },
  { value: '法语', label: '法语' }
]

const loaded = ref(false)
const f = reactive({
  schoolLength: '-1',
  tuitionMin: '',
  tuitionMax: '',
  includeUnknownTuition: true,
  presetInclude: [] as string[],
  presetExclude: [] as string[],
  customInclude: '',
  customExclude: ''
})

function onInclude(v: string, checked: boolean) {
  f.presetInclude = checked ? [...f.presetInclude, v] : f.presetInclude.filter(x => x !== v)
  if (checked) f.presetExclude = f.presetExclude.filter(x => x !== v)
}

function onExclude(v: string, checked: boolean) {
  f.presetExclude = checked ? [...f.presetExclude, v] : f.presetExclude.filter(x => x !== v)
  if (checked) f.presetInclude = f.presetInclude.filter(x => x !== v)
}

function toNum(s: string) {
  const t = String(s ?? '').trim()
  return t === '' ? null : Number(t)
}

async function save() {
  const tmin = toNum(f.tuitionMin)
  const tmax = toNum(f.tuitionMax)
  if ((tmin !== null && Number.isNaN(tmin)) || (tmax !== null && Number.isNaN(tmax))) {
    notify('学费必须为数字！', '保存失败', 'danger', 0)
    return
  }
  try {
    await fillApi.saveOtherFilter(props.code, {
      schoolLength: f.schoolLength === '' ? 0 : Number(f.schoolLength),
      tuitionMin: tmin,
      tuitionMax: tmax,
      includeUnknownTuition: f.includeUnknownTuition,
      presetInclude: f.presetInclude,
      presetExclude: f.presetExclude,
      customInclude: f.customInclude,
      customExclude: f.customExclude
    })
    emit('saved')
    notify('其它筛选条件保存成功！', '保存成功', 'success', 1500)
  } catch (e) {
    notify(e instanceof Error ? `其它筛选条件保存失败！${e.message}` : '其它筛选条件保存失败！', '保存失败', 'danger', 0)
  }
}

defineExpose({ save })

onMounted(async () => {
  try {
    const r = await fillApi.otherFilter(props.code)
    f.schoolLength = r.schoolLength === 0 ? '' : String(r.schoolLength)
    f.tuitionMin = r.tuitionMin == null ? '' : String(r.tuitionMin)
    f.tuitionMax = r.tuitionMax == null ? '' : String(r.tuitionMax)
    f.includeUnknownTuition = r.includeUnknownTuition
    f.presetInclude = r.presetInclude
    f.presetExclude = r.presetExclude
    f.customInclude = r.customInclude
    f.customExclude = r.customExclude
    loaded.value = true
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
})
</script>

<template>
  <div class="p-2">
    <div class="row m-1 mb-2 mt-2">
      <label class="col-md-2 col-form-label font-weight-bold">学制：</label>
      <div class="col-md-5">
        <select v-model="f.schoolLength" class="form-control input-full">
          <option value="-1">【不限】</option>
          <option v-for="n in 9" :key="n" :value="String(n)">{{ n }}年</option>
          <option value="">未知</option>
        </select>
      </div>
    </div>

    <div class="row m-1 mb-2 mt-2">
      <label class="col-md-2 col-form-label font-weight-bold">学费从：</label>
      <div class="col-md-3">
        <input v-model="f.tuitionMin" type="text" class="form-control input-full" />
      </div>
      <label class="col-md-1 col-form-label font-weight-bold">到：</label>
      <div class="col-md-3">
        <input v-model="f.tuitionMax" type="text" class="form-control input-full" />
      </div>
      <div class="col-sm-3 form-check pt-0 pb-0 mt-1">
        <label class="form-check-label">
          <input v-model="f.includeUnknownTuition" class="form-check-input" type="checkbox" />
          <span class="form-check-sign">含学费未知</span>
        </label>
      </div>
    </div>

    <hr />

    <div class="row m-1 mt-2">
      <label class="col-md-7 col-form-label font-weight-bold pr-0">专业包含关键字：</label>
      <label class="col-md-5 col-form-label font-weight-bold pr-0">其它包含关键字（多关键字用逗号分隔）：</label>
    </div>
    <div class="row m-1">
      <div class="col-sm-7 form-group form-inline p-0">
        <label v-for="p in PRESETS" :key="p.value" class="col-3 d-block form-check-label m-0">
          <input class="form-check-input" type="checkbox" :checked="f.presetInclude.includes(p.value)"
                 @change="onInclude(p.value, ($event.target as HTMLInputElement).checked)" />
          <span class="form-check-sign">{{ p.label }}</span>
        </label>
      </div>
      <div class="col-md-5">
        <textarea v-model="f.customInclude" rows="3" cols="20" class="form-control input-full"></textarea>
      </div>
    </div>

    <hr />

    <div class="row m-1 mt-2">
      <label class="col-md-7 col-form-label font-weight-bold pr-0">专业不包含关键字：</label>
      <label class="col-md-5 col-form-label font-weight-bold pr-0">其它不包含关键字（多关键字用逗号分隔）：</label>
    </div>
    <div class="row m-1">
      <div class="col-sm-7 form-group form-inline p-0">
        <label v-for="p in PRESETS" :key="p.value" class="col-3 d-block form-check-label m-0">
          <input class="form-check-input" type="checkbox" :checked="f.presetExclude.includes(p.value)"
                 @change="onExclude(p.value, ($event.target as HTMLInputElement).checked)" />
          <span class="form-check-sign">{{ p.label }}</span>
        </label>
      </div>
      <div class="col-md-5">
        <textarea v-model="f.customExclude" rows="3" cols="20" class="form-control input-full"></textarea>
      </div>
    </div>
  </div>
</template>
