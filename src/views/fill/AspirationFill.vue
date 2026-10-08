<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './styles/gx.scss'
import { fillApi, type FillHeader, type MajorRow, type OneClickInfo, type UnivGroupKey } from '@/api/fill'
import { useGx } from './composables/useGx'
import GxOverlays from './components/GxOverlays.vue'
import GxModal from './components/GxModal.vue'
import IrsSlider from './components/IrsSlider.vue'
import MajorRowView from './components/MajorRow.vue'
import DebutRow from './components/DebutRow.vue'
import StudentInfoPanel from './components/StudentInfoPanel.vue'
import MajorFilterPanel from './components/MajorFilterPanel.vue'
import OtherFilterPanel from './components/OtherFilterPanel.vue'
import UnvDetailPanel from './components/UnvDetailPanel.vue'
import MajorDetailPanel from './components/MajorDetailPanel.vue'
import MajorMappingPanel from './components/MajorMappingPanel.vue'
import ReorderPanel from './components/ReorderPanel.vue'
import ReportPanel from './components/ReportPanel.vue'

/** 参考系统 AspMng.aspx: 志愿填报主页面(?split=1 为分屏显示的只读已选志愿) */
const route = useRoute()
const code = String(route.params.code)
const split = route.query.split === '1'
const { notify, confirm, alert, showLoading, hideLoading } = useGx()

const h = ref<FillHeader | null>(null)
const tab = ref(0)
const sidebar = ref(false)

const years = computed(() => (h.value ? [h.value.year - 1, h.value.year - 2, h.value.year - 3] : []))
const groupText = computed(() => (h.value ? h.value.groupName || h.value.firstSubject + '组' : ''))
const headerBg = computed(() => ['bg-primary', 'bg-secondary', '', 'bg-warning'][tab.value])

/* ---------------- 列表数据 ---------------- */
const selected = ref<MajorRow[]>([])
const selectedIds = computed(() => new Set(selected.value.map(m => m.RecruitMajorID)))
const recmd = ref<MajorRow[]>([])
const unvMajors = ref<MajorRow[]>([])
const debutMajors = ref<MajorRow[]>([])

const totalRecommendText = ref('')
const totalSelectedText = ref('')

const RECMD_PAGE = 100
let recmdPage = 0
let recmdTotal = 0
let recmdLoading = false

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(`gx-fill-${code}`) : null
function broadcast() {
  channel?.postMessage('refresh')
}

async function refreshSelected() {
  selected.value = await fillApi.selected(code)
  totalSelectedText.value = `已选 ${selected.value.length} 条`
  checkedIds.value = checkedIds.value.filter(id => selectedIds.value.has(id))
}

async function loadRecommendPage(reset: boolean) {
  if (recmdLoading) return
  if (!reset && recmdPage > 0 && recmd.value.length >= recmdTotal) return
  recmdLoading = true
  try {
    const page = reset ? 1 : recmdPage + 1
    const r = await fillApi.recommendList(code, page, RECMD_PAGE)
    recmd.value = reset ? r.list : recmd.value.concat(r.list)
    recmdPage = page
    recmdTotal = r.total
  } finally {
    recmdLoading = false
  }
}

const unvQuery = reactive({ unvName: '', majorName: '', city: '', maxMark: '' })
const debutQuery = reactive({ unvName: '', majorName: '', city: '' })

async function refreshUnv() {
  const m = Number(unvQuery.maxMark)
  unvMajors.value = await fillApi.searchUnv(code, {
    unvName: unvQuery.unvName,
    majorName: unvQuery.majorName,
    city: unvQuery.city,
    maxMark: unvQuery.maxMark.trim() !== '' && !Number.isNaN(m) ? m : null
  })
}

async function refreshDebut() {
  debutMajors.value = await fillApi.searchDebut(code, { ...debutQuery })
}

async function refreshAll() {
  await refreshSelected()
  if (split) return
  await loadRecommendPage(true)
  await refreshUnv()
  await refreshDebut()
}

function clearUnvQuery() {
  Object.assign(unvQuery, { unvName: '', majorName: '', city: '', maxMark: '' })
}

function clearDebutQuery() {
  Object.assign(debutQuery, { unvName: '', majorName: '', city: '' })
}

async function searchUnv() {
  try {
    await refreshUnv()
  } catch (e) {
    notify(e, '错误', 'danger', 0)
  }
}

async function searchDebut() {
  try {
    await refreshDebut()
  } catch (e) {
    notify(e, '错误', 'danger', 0)
  }
}

async function refreshScreen() {
  try {
    await refreshAll()
    notify('屏幕数据刷新成功！', '成功', 'success', 2000)
    broadcast()
  } catch (e) {
    notify(e, '错误', 'danger', 0)
  }
}

function onScroll() {
  if (tab.value !== 0) return
  const el = document.documentElement
  if (el.scrollTop + window.innerHeight >= el.scrollHeight - 600) void loadRecommendPage(false)
}

/* ---------------- 智能筛选 / 一键填报 ---------------- */
const upper = ref(60)
const lower = ref(60)

async function confirmRecommend() {
  const hasRecommend = (h.value?.recommendCount ?? 0) > 0
  if (hasRecommend && !(await confirm('操作存在风险', '这将导致删除所有现有推荐专业，您真的确认要这么做吗？'))) return
  showLoading('正在检索数据，请等待...')
  try {
    const r = await fillApi.recommend(code, upper.value, lower.value)
    if (h.value) h.value.recommendCount = r.recordCount
    await loadRecommendPage(true)
    totalRecommendText.value = `共计筛选出 ${r.recordCount} 条满足条件的记录`
    hideLoading()
    notify(`共筛选出 ${r.recordCount} 条满足条件的记录。`, '操作成功', 'success', 2000)
  } catch (e) {
    hideLoading()
    notify(e, '发生错误', 'danger', 0)
  }
}

const oneClick = reactive({ show: false, count: 0, info: null as OneClickInfo | null })

async function openOneClick() {
  try {
    const info = await fillApi.oneClickInfo(code)
    oneClick.info = info
    oneClick.count = info.init
    oneClick.show = true
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
}

async function confirmOneClick() {
  try {
    const r = await fillApi.oneClick(code, oneClick.count)
    await refreshAll()
    oneClick.show = false
    notify(`已自动填报 ${r.added} 个专业。`, '一键生成成功', 'success', 2000)
    broadcast()
  } catch (e) {
    oneClick.show = false
    notify(e, '发生错误', 'danger', 0)
  }
}

/* ---------------- 添加 / 移除 / 高亮 ---------------- */
async function addMajor(rid: string) {
  try {
    await fillApi.addSelected(code, rid)
    await refreshSelected()
    notify('专业已成功添加到志愿列表！', '成功', 'success', 2000)
    broadcast()
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
}

async function removeMajor(rid: string) {
  try {
    await fillApi.removeSelected(code, rid)
    selected.value = selected.value.filter(m => m.RecruitMajorID !== rid)
    checkedIds.value = checkedIds.value.filter(id => id !== rid)
    totalSelectedText.value = `已选 ${selected.value.length} 条`
    notify('专业已从志愿列表中移除！', '成功', 'success', 2000)
    broadcast()
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
}

async function removeAll() {
  if (!(await confirm('删除确认', '您真的要将所有选好的志愿全部删除吗？'))) return
  try {
    await fillApi.removeAll(code)
    selected.value = []
    checkedIds.value = []
    totalSelectedText.value = '已选 0 条'
    notify('所有志愿已全部删除！', '成功', 'success', 2000)
    broadcast()
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
}

async function clearNew() {
  try {
    await fillApi.clearNew(code)
    selected.value.forEach(m => (m.IsNew = false))
    notify('高亮状态已清除！', '成功', 'success', 2000)
    broadcast()
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
}

/* ---------------- 查看结果: 过滤 / 勾选导出 ---------------- */
const resultInput = reactive({ unv: '', major: '' })
const resultFilter = reactive({ unv: '', major: '' })
const checkedIds = ref<string[]>([])

const visibleSelected = computed(() =>
  selected.value
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => {
      const mf = resultFilter.major
      return (item.UnvName ?? '').includes(resultFilter.unv) &&
        ((item.MajorName ?? '').includes(mf) || (item.RecruitPlanExplain ?? '').includes(mf) || (item.MajorDirection ?? '').includes(mf))
    })
)

function applyResultFilter() {
  resultFilter.unv = resultInput.unv
  resultFilter.major = resultInput.major
}

function clearResultFilter() {
  resultInput.unv = ''
  resultInput.major = ''
  applyResultFilter()
}

function onCheck(rid: string, v: boolean) {
  checkedIds.value = v ? [...checkedIds.value, rid] : checkedIds.value.filter(id => id !== rid)
}

async function exportChecked() {
  if (checkedIds.value.length === 0) {
    await alert('未勾选志愿', '请先勾选需要导出的志愿！')
    return
  }
  const order = selected.value.map(m => m.RecruitMajorID).filter(id => checkedIds.value.includes(id))
  try {
    await fillApi.export(code, order)
  } catch (e) {
    notify(e, '导出失败', 'danger', 0)
  }
}

async function exportAll() {
  try {
    await fillApi.export(code)
  } catch (e) {
    notify(e, '导出失败', 'danger', 0)
  }
}

function openSplit() {
  const url = `${window.location.origin}/fill/${code}?split=1`
  window.open(url, '_blank')
}

/* ---------------- 院校筛选 ---------------- */
const UNV_GROUPS: { key: UnivGroupKey; label: string; cls: string; title: string; text: string }[] = [
  { key: 'province', label: '地区选择', cls: 'province-filter', title: '未选省份', text: '请至少选择一个省份！' },
  { key: 'unv_type', label: '院校类型', cls: 'unv-type-filter', title: '未选院校类型', text: '请至少选择一个院校类型！' },
  { key: 'unv_attribute', label: '院校性质', cls: 'unv-attribute-filter', title: '未选院校性质', text: '请至少选择一个院校性质！' },
  { key: 'unv_nature', label: '院校属性', cls: 'unv-nature-filter', title: '未选院校属性', text: '请至少选择一个院校属性！' }
]

const emptyGroups = (): Record<UnivGroupKey, string[]> => ({ province: [], unv_type: [], unv_attribute: [], unv_nature: [] })
const unvOptions = ref<Record<UnivGroupKey, string[]>>(emptyGroups())
const unvSaved = ref<Record<UnivGroupKey, string[]>>(emptyGroups())
const unvWork = ref<Record<UnivGroupKey, string[]>>(emptyGroups())
const showUnvFilter = ref(false)

function rowsOf(list: string[]) {
  const rows: (string | null)[][] = []
  for (let i = 0; i < list.length; i += 10) {
    const r: (string | null)[] = list.slice(i, i + 10)
    while (r.length < 10) r.push(null)
    rows.push(r)
  }
  return rows
}

function isChecked(k: UnivGroupKey, v: string) {
  return !unvWork.value[k].includes(v)
}

function toggleItem(k: UnivGroupKey, v: string, on: boolean) {
  const ex = unvWork.value[k].filter(x => x !== v)
  unvWork.value[k] = on ? ex : [...ex, v]
}

function allChecked(k: UnivGroupKey) {
  return unvWork.value[k].length === 0
}

function toggleAll(k: UnivGroupKey, on: boolean) {
  unvWork.value[k] = on ? [] : [...unvOptions.value[k]]
}

function copyGroups(src: Record<UnivGroupKey, string[]>) {
  return { province: [...src.province], unv_type: [...src.unv_type], unv_attribute: [...src.unv_attribute], unv_nature: [...src.unv_nature] }
}

async function loadUnvFilter() {
  const r = await fillApi.univFilter(code)
  unvOptions.value = r.options
  unvSaved.value = copyGroups(r.excluded)
  unvWork.value = copyGroups(r.excluded)
}

function cancelUnvFilter() {
  unvWork.value = copyGroups(unvSaved.value)
  showUnvFilter.value = false
}

async function saveUnvFilter() {
  for (const g of UNV_GROUPS) {
    if (unvOptions.value[g.key].every(v => unvWork.value[g.key].includes(v))) {
      await alert(g.title, g.text)
      return
    }
  }
  try {
    await fillApi.saveUnivFilter(code, unvWork.value)
    unvSaved.value = copyGroups(unvWork.value)
    showUnvFilter.value = false
    notify('院校筛选条件保存成功！', '保存成功', 'success', 1500)
  } catch {
    unvWork.value = copyGroups(unvSaved.value)
    showUnvFilter.value = false
    notify('院校筛选条件保存失败！', '保存失败', 'danger', 0)
  }
}

/* ---------------- 其它弹窗 ---------------- */
const showMajorFilter = ref(false)
const showOtherFilter = ref(false)
const otherRef = ref<InstanceType<typeof OtherFilterPanel> | null>(null)
const unvDetailId = ref('')
const majorDetailId = ref('')
const mappingId = ref('')
const showReport = ref(false)
const reportRef = ref<InstanceType<typeof ReportPanel> | null>(null)

/* ---------------- 排序 ---------------- */
const reorder = reactive({ show: false, variant: 'new' as 'new' | 'old', key: 0, target: '', method: '1' })
const reorderRef = ref<InstanceType<typeof ReorderPanel> | null>(null)

function openReorder(variant: 'new' | 'old') {
  reorder.variant = variant
  reorder.key++
  reorder.target = ''
  reorder.show = true
}

function applyOrder(ids: string[]) {
  const map = new Map(selected.value.map(m => [m.RecruitMajorID, m]))
  selected.value = ids.map(id => map.get(id)).filter((m): m is MajorRow => !!m)
}

function moveSelected() {
  const v = reorder.target
  reorder.target = ''
  void reorderRef.value?.moveBefore(v)
}

async function saveReorder() {
  const ids = reorderRef.value?.getOrderedIds() ?? []
  try {
    await fillApi.saveOrder(code, ids)
    reorder.show = false
    applyOrder(ids)
    notify('排序结果保存成功！', '保存成功', 'success', 2000)
    broadcast()
  } catch {
    notify('排序结果保存失败！', '保存失败', 'danger', 0)
  }
}

async function autoOrder() {
  if (!(await confirm('确认重新排序', '您真的要由系统对所有专业顺序进行重新排列吗？'))) return
  try {
    const ids = await fillApi.autoOrder(code, Number(reorder.method))
    applyOrder(ids)
    reorder.key++
    notify('所有专业已由系统重新排序！', '自动排序成功', 'success', 2000)
    broadcast()
  } catch {
    notify('自动重新排序失败！', '自动排序失败', 'danger', 0)
  }
}

/* ---------------- 初始化 ---------------- */
onMounted(async () => {
  try {
    h.value = await fillApi.header(code)
    document.title = split ? `${h.value.studentName} - 分屏显示` : `${h.value.studentName} - 志愿填报`
    upper.value = h.value.upperParam || 60
    lower.value = h.value.lowerParam || 60
    totalRecommendText.value = `筛出 ${h.value.recommendCount} 条`
    await refreshAll()
    if (!split) await loadUnvFilter()
  } catch (e) {
    notify(e, '错误', 'danger', 0)
  }
  if (split) {
    channel?.addEventListener('message', () => void refreshSelected())
  } else {
    window.addEventListener('scroll', onScroll, { passive: true })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  channel?.close()
})
</script>

<template>
  <div class="gx gx-fill p-2">
    <div style="margin-top: 190px; margin-bottom: 85px;">
      <div class="fixed-top p-2 pb-0 bg-light">
        <div class="card mb-1">
          <div class="card-body" style="padding-top: 15px; padding-bottom: 13px;">
            <ul id="tabs" class="nav nav-tabs">
              <li class="pr-5 mr-5 pull-left nav-fill">
                <template v-if="h">
                  <span style="font-size: 1.5em;">
                    <a href="javascript:void(0)" @click.prevent="sidebar = !sidebar">{{ h.studentName }}</a>
                    {{ split ? '【分屏显示】' : '【志愿填报】' }}
                  </span>
                  {{ h.province }}，{{ h.batch }} ； {{ h.score }}分，排名：{{ h.rank ?? '' }}； {{ groupText }}； {{ h.subjectsDisplay }}
                </template>
              </li>
              <template v-if="!split">
                <li v-for="(t, i) in ['智能专业推荐', '按高校检索', '首次招生高校', '查看结果']" :key="t" class="nav-item">
                  <a :class="['nav-link', { active: tab === i }]" href="javascript:void(0)" @click.prevent="tab = i">{{ t }}</a>
                </li>
              </template>
              <li>
                <a href="javascript:void(0)" style="position: absolute; top: 12px; right: 20px;" class="btn btn-sm btn-success ml-4"
                   @click.prevent="refreshScreen"><i class="fas fa-sync-alt mr-2"></i>刷新数据</a>
              </li>
            </ul>

            <div v-if="!split" class="tab-content">
              <div v-if="tab === 0" class="tab-pane active">
                <div class="row mt-3">
                  <div class="col-12 d-inline-flex form-inline">
                    <button class="btn btn-sm btn-info mr-1" @click.prevent="showMajorFilter = true"><i class="fas fa-book mr-2"></i>专业筛选</button>
                    <button class="btn btn-sm btn-success mr-1" @click.prevent="showUnvFilter = true"><i class="fas fa-school mr-2"></i>院校筛选</button>
                    <a href="javascript:void(0)" class="btn btn-sm btn-warning mr-4" @click.prevent="showOtherFilter = true"><i class="fas fa-globe-americas mr-2"></i>其它筛选</a>
                    <span class="font-weight-bold">向上 {{ upper }} 分：</span>
                    <div style="width: 180px;" class="pb-3">
                      <IrsSlider v-model="upper" :min="10" :max="60" hide-min-max hide-from-to postfix=" 分" />
                    </div>
                    <span class="font-weight-bold ml-4">向下 {{ lower }} 分：</span>
                    <div style="width: 180px;" class="pb-3">
                      <IrsSlider v-model="lower" :min="10" :max="60" hide-min-max hide-from-to postfix=" 分" />
                    </div>
                    <a href="javascript:void(0)" class="btn btn-sm btn-secondary ml-4" @click.prevent="confirmRecommend"><i class="fas fa-graduation-cap mr-2"></i>智能筛选</a>
                    <a href="javascript:void(0)" class="btn btn-sm btn-danger ml-1" @click.prevent="openOneClick"><i class="fas fa-tasks mr-2"></i>一键填报</a>
                    <span class="ml-4 text-muted" style="padding-top: 6px;">{{ totalRecommendText }}</span>
                    <span class="ml-2 text-muted" style="padding-top: 6px;">{{ totalSelectedText }}</span>
                  </div>
                </div>
              </div>

              <div v-if="tab === 1" class="tab-pane active">
                <div class="row mt-3">
                  <div class="col-12 d-inline-flex form-inline">
                    <span class="font-weight-bold">高校：</span>
                    <div class="p-0 ml-2" style="width: 200px;">
                      <input v-model="unvQuery.unvName" type="text" class="form-control input-full" placeholder="高校..." @keyup.enter="searchUnv" />
                    </div>
                    <span class="font-weight-bold ml-4">专业：</span>
                    <div class="p-0 ml-2" style="width: 200px;">
                      <input v-model="unvQuery.majorName" type="text" class="form-control input-full" placeholder="专业..." @keyup.enter="searchUnv" />
                    </div>
                    <span class="font-weight-bold ml-4">城市：</span>
                    <div class="p-0 ml-2" style="width: 120px;">
                      <input v-model="unvQuery.city" type="text" class="form-control input-full" placeholder="省份、城市..." @keyup.enter="searchUnv" />
                    </div>
                    <span class="font-weight-bold ml-4">预测最低分不高于：</span>
                    <div class="p-0 ml-2" style="width: 120px;">
                      <input v-model="unvQuery.maxMark" type="text" class="form-control input-full" placeholder="分数..." @keyup.enter="searchUnv" />
                    </div>
                    <button class="btn btn-sm btn-secondary ml-3" @click.prevent="searchUnv"><i class="fas fa-search mr-2"></i>检索</button>
                    <button class="btn btn-sm btn-success ml-2" @click.prevent="clearUnvQuery"><i class="fas fa-broom mr-2"></i>重置</button>
                    <span class="text-warning ml-5"><strong>说明：</strong>系统最多返回 200 条记录。</span>
                  </div>
                </div>
              </div>

              <div v-if="tab === 2" class="tab-pane active">
                <div class="row mt-3">
                  <div class="col-12 d-inline-flex form-inline">
                    <span class="font-weight-bold">高校：</span>
                    <div class="p-0 ml-2" style="width: 240px;">
                      <input v-model="debutQuery.unvName" type="text" class="form-control input-full" placeholder="高校..." @keyup.enter="searchDebut" />
                    </div>
                    <span class="font-weight-bold ml-4">专业：</span>
                    <div class="p-0 ml-2" style="width: 240px;">
                      <input v-model="debutQuery.majorName" type="text" class="form-control input-full" placeholder="专业..." @keyup.enter="searchDebut" />
                    </div>
                    <span class="font-weight-bold ml-4">城市：</span>
                    <div class="p-0 ml-2" style="width: 150px;">
                      <input v-model="debutQuery.city" type="text" class="form-control input-full" placeholder="省份、城市..." @keyup.enter="searchDebut" />
                    </div>
                    <a href="javascript:void(0);" class="btn btn-sm btn-secondary ml-3" @click.prevent="searchDebut"><i class="fas fa-search mr-2"></i>检索</a>
                    <button class="btn btn-sm btn-success ml-2" @click.prevent="clearDebutQuery"><i class="fas fa-broom mr-2"></i>重置</button>
                    <span class="text-warning ml-5"><strong>说明：</strong>为了提升效率，系统最多返回 300 条记录。</span>
                  </div>
                </div>
              </div>

              <div v-if="tab === 3" class="tab-pane active">
                <div class="row mt-3">
                  <div class="col-12 d-inline-flex form-inline">
                    <a href="javascript:void(0)" class="btn btn-sm btn-warning ml-2" @click.prevent="clearNew"><i class="fas fa-clipboard-list mr-2"></i>清除高亮</a>
                    <a href="javascript:void(0)" class="btn btn-sm btn-danger ml-1" @click.prevent="removeAll"><i class="fas fa-trash-alt mr-2"></i>全部删除</a>
                    <a href="javascript:void(0)" class="btn btn-sm btn-success ml-2" @click.prevent="openReorder('new')">新排序</a>
                    <a href="javascript:void(0)" class="btn btn-sm btn-secondary ml-1" @click.prevent="openReorder('old')">老排序</a>
                    <a href="javascript:void(0)" class="btn btn-sm btn-info ml-2" @click.prevent="showReport = true"><i class="fas fa-file-invoice mr-2"></i>浏览报告</a>
                    <a href="javascript:void(0)" class="btn btn-sm btn-primary ml-1" @click.prevent="exportChecked"><i class="fas fa-file-export mr-2"></i>导出勾选<template v-if="checkedIds.length">({{ checkedIds.length }})</template></a>
                    <a href="javascript:void(0)" class="btn btn-sm btn-secondary ml-4 mr-5" @click.prevent="openSplit"><i class="fas fa-laptop-code mr-2"></i>分屏显示</a>

                    <span class="font-weight-bold">高校：</span>
                    <div class="p-0 ml-2" style="width: 180px;">
                      <input v-model="resultInput.unv" type="text" class="form-control input-full" @keyup.enter="applyResultFilter" />
                    </div>
                    <span class="font-weight-bold ml-4">专业：</span>
                    <div class="p-0 ml-2" style="width: 180px;">
                      <input v-model="resultInput.major" type="text" class="form-control input-full" @keyup.enter="applyResultFilter" />
                    </div>
                    <a href="javascript:void(0);" class="btn btn-sm btn-secondary ml-3" @click.prevent="applyResultFilter"><i class="fas fa-filter mr-2"></i>过滤</a>
                    <a href="javascript:void(0);" class="btn btn-sm btn-success ml-2" @click.prevent="clearResultFilter"><i class="fas fa-broom mr-2"></i>重置</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div :class="['card mb-2 student-info-bar', { active: sidebar }]">
          <div class="card-body p-3">
            <StudentInfoPanel v-if="h" :h="h" />
          </div>
        </div>

        <div v-if="split || tab !== 2" :class="['row m-0 mt-2 text-center text-white font-weight-bold can-push', split ? 'bg-warning' : headerBg, { 'content-pushed': sidebar }]">
          <div class="col-2">
            <div class="row h-100">
              <div class="col-3 border p-0 align-items-center d-flex justify-content-center">序号</div>
              <div class="col-4 border p-0 align-items-center d-flex justify-content-center">录取概率</div>
              <div class="col-5 border p-0 align-items-center d-flex justify-content-center">操作</div>
            </div>
          </div>
          <div class="col-6 border align-items-center d-flex justify-content-center">高校专业</div>
          <div class="col-1 border p-0 align-items-center d-flex justify-content-center">排名</div>
          <div class="col-3">
            <div class="row">
              <div class="col-2 border border-bottom-0 p-0 pt-2 pb-0 align-items-center d-flex justify-content-center">科目</div>
              <div class="col-10 border p-0 pt-1 pb-1 align-items-center d-flex justify-content-center">历史等效数据</div>
            </div>
            <div class="row">
              <div class="col-2 border border-top-0 p-0 pt-0 pb-2 justify-content-center">要求</div>
              <div class="col-4 border p-0 pt-1 pb-1 align-items-center d-flex justify-content-center">百分位预测</div>
              <div v-for="y in years" :key="y" class="col-2 border p-0 pt-1 pb-1 align-items-center d-flex justify-content-center">{{ y }}</div>
            </div>
          </div>
        </div>

        <div v-else :class="['row m-0 mt-2 text-center text-white font-weight-bold can-push', { 'content-pushed': sidebar }]"
             style="height: 59px; background-color: lightslategrey">
          <div class="col-1 border align-items-center d-flex justify-content-center">操作</div>
          <div class="col-7 border align-items-center d-flex justify-content-center">高校专业</div>
          <div class="col-1 border align-items-center d-flex justify-content-center">科目</div>
          <div class="col-1 border align-items-center d-flex justify-content-center">计划</div>
          <div class="col-1 border align-items-center d-flex justify-content-center">学制</div>
          <div class="col-1 border align-items-center d-flex justify-content-center">学费</div>
        </div>
      </div>

      <div :class="['tab-content can-push', { 'content-pushed': sidebar }]">
        <div v-if="split" class="tab-pane active">
          <template v-for="{ item, i } in visibleSelected" :key="item.RecruitMajorID">
            <MajorRowView :item="item" :index="i" data-type="a" :selected="false" readonly
                          @unv="unvDetailId = $event" @major="majorDetailId = $event" @mapping="mappingId = $event" />
          </template>
        </div>
        <template v-else>
          <div v-show="tab === 0" class="tab-pane active">
            <MajorRowView v-for="(item, i) in recmd" :key="item.RecruitMajorID" :item="item" :index="i" data-type="m"
                          :selected="selectedIds.has(item.RecruitMajorID)"
                          @add="addMajor" @remove="removeMajor" @unv="unvDetailId = $event" @major="majorDetailId = $event" @mapping="mappingId = $event" />
          </div>
          <div v-show="tab === 1" class="tab-pane active">
            <MajorRowView v-for="(item, i) in unvMajors" :key="item.RecruitMajorID" :item="item" :index="i" data-type="u"
                          :selected="selectedIds.has(item.RecruitMajorID)"
                          @add="addMajor" @remove="removeMajor" @unv="unvDetailId = $event" @major="majorDetailId = $event" @mapping="mappingId = $event" />
          </div>
          <div v-show="tab === 2" class="tab-pane active">
            <DebutRow v-for="(item, i) in debutMajors" :key="item.RecruitMajorID" :item="item" :index="i"
                      :selected="selectedIds.has(item.RecruitMajorID)"
                      @add="addMajor" @remove="removeMajor" @unv="unvDetailId = $event" @major="majorDetailId = $event" @mapping="mappingId = $event" />
          </div>
          <div v-show="tab === 3" class="tab-pane active">
            <MajorRowView v-for="{ item, i } in visibleSelected" :key="item.RecruitMajorID" :item="item" :index="i" data-type="a"
                          :selected="false" :checked="checkedIds.includes(item.RecruitMajorID)"
                          @remove="removeMajor" @check="onCheck" @unv="unvDetailId = $event" @major="majorDetailId = $event" @mapping="mappingId = $event" />
          </div>
        </template>
      </div>
    </div>

    <!-- 专业筛选 -->
    <GxModal :show="showMajorFilter" title="选择专业筛选条件" size="modal-xl"
             :dialog-style="{ width: '100%', height: '90%' }" :content-style="{ width: '100%', height: '100%' }"
             :body-style="{ width: '100%', height: '100%', overflowY: 'auto' }" @close="showMajorFilter = false">
      <MajorFilterPanel :code="code" />
      <template #footer>
        <button type="button" class="btn btn-danger" @click="showMajorFilter = false">关闭</button>
      </template>
    </GxModal>

    <!-- 院校筛选 -->
    <GxModal :show="showUnvFilter" title="选择院校筛选条件" size="modal-xl" @close="cancelUnvFilter">
      <div v-for="g in UNV_GROUPS" :key="g.key" class="row m-1 mb-2 mt-2">
        <div class="col-2 bg-warning d-flex justify-content-center align-items-center w-100">
          <div class="form-check">
            <label class="form-check-label">
              <input type="checkbox" class="form-check-input" :checked="allChecked(g.key)"
                     @change="toggleAll(g.key, ($event.target as HTMLInputElement).checked)" />
              <span class="form-check-sign font-weight-bold text-light" style="font-size: 115%;">{{ g.label }}</span>
            </label>
          </div>
        </div>
        <div class="col-10 bg-light">
          <table :class="['w-100 mt-3 mb-2', g.cls]">
            <tbody>
              <tr v-for="(r, ri) in rowsOf(unvOptions[g.key])" :key="ri">
                <template v-for="(v, ci) in r" :key="ci">
                  <td v-if="v !== null" style="width: 10%;">
                    <div class="form-check p-0">
                      <label class="form-check-label">
                        <input class="form-check-input" type="checkbox" :value="v" :checked="isChecked(g.key, v)"
                               @change="toggleItem(g.key, v, ($event.target as HTMLInputElement).checked)" />
                        <span class="form-check-sign">{{ v }}</span>
                      </label>
                    </div>
                  </td>
                  <td v-else></td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="saveUnvFilter">保存院校筛选条件</button>
        <button type="button" class="btn btn-danger" @click="cancelUnvFilter">取消并关闭</button>
      </template>
    </GxModal>

    <!-- 其它筛选 -->
    <GxModal :show="showOtherFilter" title="其它筛选条件" size="modal-lg"
             :dialog-style="{ width: '100%', height: '545px' }" :content-style="{ width: '100%', height: '100%' }"
             :body-style="{ width: '100%', height: '100%', overflowY: 'auto' }" @close="showOtherFilter = false">
      <OtherFilterPanel ref="otherRef" :code="code" @saved="showOtherFilter = false" />
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="otherRef?.save()">保存筛选条件</button>
        <button type="button" class="btn btn-danger" @click="showOtherFilter = false">取消并关闭</button>
      </template>
    </GxModal>

    <!-- 院校明细 -->
    <GxModal :show="!!unvDetailId" title="院校明细信息" size="modal-xl"
             :dialog-style="{ width: '100%', height: '90%' }" :content-style="{ width: '100%', height: '100%' }"
             :body-style="{ width: '100%', height: '100%', overflowY: 'auto' }" @close="unvDetailId = ''">
      <UnvDetailPanel v-if="unvDetailId" :code="code" :uab-id="unvDetailId" />
    </GxModal>

    <!-- 专业明细 -->
    <GxModal :show="!!majorDetailId" title="专业明细信息" size="modal-xl"
             :dialog-style="{ width: '100%', height: '90%' }" :content-style="{ width: '100%', height: '100%' }"
             :body-style="{ width: '100%', height: '100%', overflowY: 'auto' }" @close="majorDetailId = ''">
      <MajorDetailPanel v-if="majorDetailId && h" :code="code" :rid="majorDetailId" :province="h.province" />
    </GxModal>

    <!-- 一键填报 -->
    <GxModal :show="oneClick.show" headless footer-class="justify-content-center">
      <div class="swal-icon swal-icon--warning">
        <span class="swal-icon--warning__body"><span class="swal-icon--warning__dot"></span></span>
      </div>
      <h1 class="modal-title font-weight-bold mt-5 mb-4 text-center">一键填报确认</h1>
      <h4 class="text-center mb-3">
        您已选志愿 <span class="font-weight-bold">{{ oneClick.info?.selectedCount ?? 0 }}</span> 项，<span class="font-weight-bold">{{ oneClick.info?.province }}</span>限定填报数量为 <span class="font-weight-bold">{{ oneClick.info?.upperLimit }}</span> 项。
      </h4>
      <h4 class="text-center mb-5">请选择一键自动填报的记录数：</h4>
      <div class="pl-5 pr-5 mb-4">
        <IrsSlider v-if="oneClick.info" v-model="oneClick.count" :min="0" :max="oneClick.info.max" skin="round" />
      </div>
      <template #footer>
        <button type="button" class="btn btn-success" @click="confirmOneClick">确定</button>
        <button type="button" class="btn btn-danger" @click="oneClick.show = false">取消</button>
      </template>
    </GxModal>

    <!-- 专业排序 -->
    <GxModal :show="reorder.show" title="推荐专业排序"
             :dialog-style="{ maxWidth: '95vw', height: '95%' }" :content-style="{ width: '100%', height: '100%' }"
             :body-style="{ width: '100%', height: '100%', overflowY: 'auto', padding: '0' }" @close="reorder.show = false">
      <ReorderPanel v-if="reorder.show && h" ref="reorderRef" :key="reorder.key" :majors="selected" :year="h.year" :variant="reorder.variant" />
      <template #footer>
        <div class="row" style="width: 100%;">
          <div class="col-sm-9 text-left form-inline">
            <span>将选中专业移到</span>
            <input v-model="reorder.target" class="form-control ml-2 mr-2 text-center" style="width: 50px" @keyup.enter="moveSelected" />
            <span>号专业之前</span>
            <button type="button" class="btn btn-secondary ml-2" @click="moveSelected">开始移动</button>
            <button type="button" class="btn btn-info ml-2" @click="reorderRef?.moveToEnd()">移到末尾</button>
            <select v-model="reorder.method" class="form-control ml-2 mr-2">
              <option value="1">1.按录取概率排序</option>
              <option value="2">2.按预测最低分排序</option>
              <option value="3">3.按上年录取最低分排序</option>
            </select>
            <a href="javascript:void(0)" class="btn btn-warning mr-5" @click.prevent="autoOrder">开始排序</a>
            <button type="button" class="btn btn-success ml-5" @click="reorderRef?.unselect()">取消选择</button>
          </div>
          <div class="col-sm-3 text-right">
            <button type="button" class="btn btn-success mr-2" @click="saveReorder">保存</button>
            <button type="button" class="btn btn-danger" @click="reorder.show = false">取消并关闭</button>
          </div>
        </div>
      </template>
    </GxModal>

    <!-- 志愿报告 -->
    <GxModal :show="showReport" title="志愿报告" size="modal-xl"
             :dialog-style="{ width: '100%', height: '90%' }" :content-style="{ width: '100%', height: '100%' }"
             :body-style="{ width: '100%', height: '100%', overflowY: 'auto', padding: '0' }" @close="showReport = false">
      <ReportPanel v-if="showReport" ref="reportRef" :code="code" />
      <template #footer>
        <a href="javascript:void(0)" class="btn btn-success" @click.prevent="exportAll"><span class="btn-label"><i class="fas fa-file-export mr-2"></i></span>下载Excel志愿单</a>
        <button type="button" class="btn btn-secondary" @click="reportRef?.print()">打印</button>
      </template>
    </GxModal>

    <!-- 包含专业 -->
    <GxModal :show="!!mappingId" title="包含专业" size="modal-lg"
             :dialog-style="{ width: '100%', height: '80%' }" :content-style="{ width: '100%', height: '100%' }"
             :body-style="{ width: '100%', height: '100%', overflowY: 'auto' }" @close="mappingId = ''">
      <MajorMappingPanel v-if="mappingId" :code="code" :rid="mappingId" />
      <template #footer>
        <button type="button" class="btn btn-success" @click="mappingId = ''">关闭</button>
      </template>
    </GxModal>

    <GxOverlays />
  </div>
</template>

<style scoped>
.gx-fill {
  min-height: 100vh;
  background-color: #f1f1f1;
  overflow-x: hidden;
}
</style>
