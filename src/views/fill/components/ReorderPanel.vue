<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import type { MajorRow } from '@/api/fill'
import { useGx } from '../composables/useGx'

/**
 * 参考系统 ReorderUserAspMajors.aspx: 卡片拖拽排序。
 * orderId 为打开窗口时的原始序号, 拖动后不重新编号(与参考系统一致)。
 */
const props = defineProps<{ majors: MajorRow[]; year: number; variant?: 'new' | 'old' }>()
const { notify } = useGx()

interface Card { orderId: number; item: MajorRow }

const cards = ref<Card[]>(props.majors.map((m, i) => ({ orderId: i + 1, item: m })))
const checked = ref<string[]>([])
const root = ref<HTMLElement | null>(null)
const dragRid = ref<string | null>(null)

const years = computed(() => [props.year - 1, props.year - 2, props.year - 3])

function isChecked(rid: string) { return checked.value.includes(rid) }

function toggle(rid: string) {
  checked.value = isChecked(rid) ? checked.value.filter(x => x !== rid) : [...checked.value, rid]
}

/** 选中项按当前界面顺序排列 */
function selectedInOrder() {
  return cards.value.filter(c => isChecked(c.item.RecruitMajorID))
}

function unselect() {
  checked.value = []
  notify('已经取消对所有专业的选择。', '信息', 'success', 1000)
}

function moveToEnd() {
  const sel = selectedInOrder()
  if (sel.length === 0) {
    notify('请确保至少选中一个专业！', '错误', 'danger', 0)
    return
  }
  cards.value = [...cards.value.filter(c => !isChecked(c.item.RecruitMajorID)), ...sel]
  notify('已将选中专业移动到末尾。', '信息', 'success', 1000)
}

async function moveBefore(raw: string) {
  const sel = selectedInOrder()
  if (sel.length === 0) {
    notify('请确保至少选中一个专业！', '错误', 'danger', 0)
    return
  }
  const v = raw.trim()
  if (v.length === 0) {
    notify('请输入移动到哪个序号之前！', '错误', 'danger', 0)
    return
  }
  const n = Number(v)
  if (!Number.isInteger(n) || n < 0 || n > cards.value.length) {
    notify(`请输入一个 0 到 ${cards.value.length} 之间的整数数值，且确保该数值专业未被选中！`, '错误', 'danger', 0)
    return
  }
  const target = cards.value.find(c => c.orderId === n)
  if (target && isChecked(target.item.RecruitMajorID)) {
    notify('无法将选中的专业移动到一个被选中的专业前面！', '错误', 'danger', 0)
    return
  }
  const rest = cards.value.filter(c => !isChecked(c.item.RecruitMajorID))
  const pos = target ? rest.indexOf(target) : rest.length
  rest.splice(pos < 0 ? rest.length : pos, 0, ...sel)
  cards.value = rest
  await nextTick()
  const first = root.value?.querySelector<HTMLElement>(`[data-id="${CSS.escape(sel[0].item.RecruitMajorID)}"]`)
  first?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  notify(`已将选中专业移动到序号为 ${n} 的专业之前。`, '信息', 'success', 1000)
}

function getOrderedIds() {
  return cards.value.map(c => c.item.RecruitMajorID)
}

function onDragStart(e: DragEvent, rid: string) {
  dragRid.value = rid
  e.dataTransfer?.setData('text/plain', rid)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(e: DragEvent, rid: string) {
  e.preventDefault()
  const from = dragRid.value
  if (!from || from === rid) return
  const list = cards.value.slice()
  const fi = list.findIndex(c => c.item.RecruitMajorID === from)
  const ti = list.findIndex(c => c.item.RecruitMajorID === rid)
  if (fi < 0 || ti < 0) return
  const [moved] = list.splice(fi, 1)
  list.splice(ti, 0, moved)
  cards.value = list
}

function onDragEnd() { dragRid.value = null }

function eqMin(m: MajorRow, k: number) {
  const h = m.MajorHistorys[k]
  return h && !(h.MinMark == null && h.MinMarkPercentile == null) ? h : null
}

defineExpose({ unselect, moveToEnd, moveBefore, getOrderedIds })
</script>

<template>
  <div ref="root" :class="['p-3', { 'pt-5': checked.length > 0 }]">
    <div v-if="checked.length > 0" style="height: 36px; position: sticky; top: 0; z-index: 5;" class="bg-danger mb-3 text-light p-2">
      <span class="fas fa-info-circle ml-3 mr-2"></span>有 <span>{{ checked.length }}</span> 个专业已被选中。
      <a href="javascript:void(0)" class="text-light ml-3" @click.prevent="unselect">【取消选择】</a>
    </div>

    <div v-if="variant !== 'old'" style="display: grid; grid-template-columns: repeat(5,1fr); grid-gap: 10px;" class="reorder-grid">
      <div
        v-for="c in cards"
        :key="c.item.RecruitMajorID"
        :data-id="c.item.RecruitMajorID"
        :class="['list-item card mb-0 p-2 border-primary', { border: isChecked(c.item.RecruitMajorID) }]"
        :style="{ backgroundColor: isChecked(c.item.RecruitMajorID) ? '#fffbe6' : 'white', opacity: dragRid === c.item.RecruitMajorID ? 0.5 : 1 }"
        draggable="true"
        role="option"
        @click="toggle(c.item.RecruitMajorID)"
        @dragstart="onDragStart($event, c.item.RecruitMajorID)"
        @dragover="onDragOver($event, c.item.RecruitMajorID)"
        @dragend="onDragEnd"
      >
        <div class="card-body p-0">
          <div class="row bg-primary" style="margin-left: 1px; margin-right: 1px; border-radius: 4px;">
            <div class="col-2 p-0">
              <div class="orderid text-white">{{ c.orderId }}</div>
            </div>
            <div class="col-8 p-0 pt-2 text-white font-weight-bold" style="font-size: 120%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ c.item.UnvName }}
            </div>
            <div class="col-2 p-0 text-right">
              <div class="form-check text-center pl-3 pr-0" @click.stop>
                <label class="form-check-label m-0">
                  <input class="form-check-input" type="checkbox" :checked="isChecked(c.item.RecruitMajorID)" @change="toggle(c.item.RecruitMajorID)" />
                  <span class="form-check-sign"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="row ml-2 mr-2 mt-2">
            <div class="col p-0 text-danger font-weight-bold pl-1" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              【{{ c.item.RecruitMajorCode }}】{{ c.item.MajorName }}
            </div>
          </div>

          <div class="row ml-2 mr-2 mt-2">
            <div class="col-7 p-0 text-success font-weight-bold pl-2">录取概率：{{ c.item.Probability }}</div>
            <div class="col-5 p-0 text-right">
              <span :class="['badge badge-warning p-1', { 'd-none': !c.item.HasMasterUnit }]">硕</span>{{ ' ' }}
              <span :class="['badge badge-danger p-1', { 'd-none': !c.item.HasDoctorUnit }]">博</span>{{ ' ' }}
              <span :class="['badge badge-success p-1', { 'd-none': !c.item.CanRecommend }]">保</span>
            </div>
          </div>

          <hr class="m-2" />

          <div class="row ml-2 mr-2">
            <div class="col-3 p-0 text-center font-weight-bold">预测分</div>
            <div v-for="y in years" :key="y" class="col-3 p-0 text-center font-weight-bold">{{ y }}</div>
          </div>
          <div class="row ml-2 mr-2">
            <div class="col-3 p-0 text-center"><span class="text-danger font-weight-bold">{{ c.item.PreMinMark ?? '' }}</span></div>
            <div v-for="k in 3" :key="k" class="col-3 p-0 text-center">
              <template v-if="eqMin(c.item, k - 1)">
                <span class="text-warning font-weight-bold">{{ eqMin(c.item, k - 1)!.EquivalentMinMark ?? '?' }}</span><span class="text-black-50">({{ eqMin(c.item, k - 1)!.MinMark ?? '?' }})</span>
              </template>
              <template v-else><span class="text-warning font-weight-bold"></span><span class="text-black-50"></span></template>
            </div>
          </div>
          <hr class="m-2" />
          <div class="row ml-2 mr-2 mb-2">
            <div class="col text-muted h-1x border overflow-auto p-0 bg-white" style="height: 60px;">
              院校代码：<span class="font-weight-bold text-info">{{ c.item.UnvCode }}，</span>
              <span class="text-muted">{{ [c.item.UnvNature, ...c.item.UnvAttributes].filter(Boolean).join(', ') }}</span>
              <br />
              专业解释：{{ c.item.RecruitPlanExplain }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <table v-else class="table table-bordered table-sm table-hover gv mb-0">
      <thead>
        <tr>
          <th style="width: 50px;"></th><th style="width: 60px;">序号</th><th>高校</th><th>专业</th>
          <th style="width: 90px;">录取概率</th><th style="width: 80px;">预测分</th>
          <th v-for="y in years" :key="y" style="width: 90px;">{{ y }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="c in cards"
          :key="c.item.RecruitMajorID"
          :data-id="c.item.RecruitMajorID"
          :style="{ backgroundColor: isChecked(c.item.RecruitMajorID) ? '#fffbe6' : '', cursor: 'move', opacity: dragRid === c.item.RecruitMajorID ? 0.5 : 1 }"
          draggable="true"
          @click="toggle(c.item.RecruitMajorID)"
          @dragstart="onDragStart($event, c.item.RecruitMajorID)"
          @dragover="onDragOver($event, c.item.RecruitMajorID)"
          @dragend="onDragEnd"
        >
          <td class="text-center" @click.stop>
            <div class="form-check p-0 m-0">
              <label class="form-check-label m-0">
                <input class="form-check-input" type="checkbox" :checked="isChecked(c.item.RecruitMajorID)" @change="toggle(c.item.RecruitMajorID)" />
                <span class="form-check-sign"></span>
              </label>
            </div>
          </td>
          <td class="text-center font-weight-bold">{{ c.orderId }}</td>
          <td class="text-danger">{{ c.item.UnvName }}</td>
          <td>【{{ c.item.RecruitMajorCode }}】{{ c.item.MajorName }}</td>
          <td class="text-success text-center">{{ c.item.Probability }}</td>
          <td class="text-danger text-center font-weight-bold">{{ c.item.PreMinMark ?? '' }}</td>
          <td v-for="k in 3" :key="k" class="text-center">
            <template v-if="eqMin(c.item, k - 1)">
              <span class="text-warning font-weight-bold">{{ eqMin(c.item, k - 1)!.EquivalentMinMark ?? '?' }}</span><span class="text-black-50">({{ eqMin(c.item, k - 1)!.MinMark ?? '?' }})</span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.orderid {
  display: block;
  width: 50px;
  text-align: center;
  font-weight: bold;
  font-size: 25px;
}

.reorder-grid :deep(.form-check [type="checkbox"] + .form-check-sign:after) {
  color: #f5d36f;
}

.list-item {
  cursor: move;
  user-select: none;
}
</style>
