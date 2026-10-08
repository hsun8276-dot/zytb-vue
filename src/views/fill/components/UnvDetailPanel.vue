<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { fillApi, type UnvDetail } from '@/api/fill'
import { getQueryUnvDetail } from '@/api/query'
import { useGx } from '../composables/useGx'
import GvPager from './GvPager.vue'

/** 参考系统 ViewUnvDetail.aspx: 院校(专业组)明细 */
const props = defineProps<{ code?: string; uabId: string }>()
const { notify } = useGx()

const d = ref<UnvDetail | null>(null)
const tab = ref(0)
const pg = reactive([{ page: 1, size: 10 }, { page: 1, size: 10 }, { page: 1, size: 10 }])

function slice<T>(list: T[] | undefined, i: number) {
  const p = pg[i]
  return (list ?? []).slice((p.page - 1) * p.size, p.page * p.size)
}

const tracked = computed(() => slice(d.value?.tracked, 0))
const all = computed(() => slice(d.value?.all, 1))
const majors = computed(() => slice(d.value?.majors, 2))

const p4 = (v: number | null | undefined) => (v === null || v === undefined ? '' : `${Number(v).toFixed(4)}%`)
const nb = (v: unknown) => (v === null || v === undefined || v === '' ? '\u00a0' : String(v))
const dash = (v: unknown) => (v === null || v === undefined || v === '' ? '-' : String(v))

onMounted(async () => {
  try {
    d.value = props.code
      ? await fillApi.unvDetail(props.code, props.uabId)
      : await getQueryUnvDetail(props.uabId)
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
})
</script>

<template>
  <div v-if="d" class="p-3">
    <div class="page-header d-flex align-items-baseline">
      <h4 class="page-title">
        <span>{{ d.info.UnvName }}</span>
      </h4>
      <ul class="breadcrumbs">
        <li class="nav-item">
          <span>{{ d.info.Year }}</span>，
          <span>{{ d.info.Province }}</span>，
          <span>{{ d.info.Batch }}</span>，
          <span>{{ d.info.ArtsOrScience }}</span>；
          院校代码：<span>{{ d.info.UnvCode }}</span>
        </li>
      </ul>
    </div>

    <div class="card mb-3">
      <div class="card-body pt-2 pb-2">
        <div class="row m-2">
          <div class="col-2 font-weight-bold text-right p-0">预测平均分：</div>
          <div class="col-2 font-weight-bold text-danger"><span>{{ d.info.PreAvgMark }}</span></div>
          <div class="col-2 font-weight-bold text-right p-0">预测最低分：</div>
          <div class="col-2 font-weight-bold text-danger"><span>{{ d.info.PreMinMark }}</span></div>
          <div class="col-2 font-weight-bold text-right p-0">预测平均分百分位：</div>
          <div class="col-2 text-primary"><span>{{ p4(d.info.PreAvgPercentile) }}</span></div>
        </div>
        <div class="row m-2">
          <div class="col-2 font-weight-bold text-right p-0">预测平均分排名：</div>
          <div class="col-2 text-success"><span>{{ d.info.PreAvgMarkRank }}</span></div>
          <div class="col-2 font-weight-bold text-right p-0">预测最低分排名：</div>
          <div class="col-2 text-success"><span>{{ d.info.PreMinMarkRank }}</span></div>
          <div class="col-2 font-weight-bold text-right p-0">预测最低分百分位：</div>
          <div class="col-2 text-primary"><span>{{ p4(d.info.PreMinPercentile) }}</span></div>
        </div>
      </div>
    </div>

    <nav class="dxbs-tabs">
      <ul class="nav nav-tabs">
        <li class="nav-item"><a :class="['nav-link', { active: tab === 0 }]" href="javascript:void(0)" @click="tab = 0"><span class="text">追踪到的历史数据</span></a></li>
        <li class="nav-item"><a :class="['nav-link', { active: tab === 1 }]" href="javascript:void(0)" @click="tab = 1"><span class="text">院校近 4 年所有历史数据</span></a></li>
        <li class="nav-item"><a :class="['nav-link', { active: tab === 2 }]" href="javascript:void(0)" @click="tab = 2"><span class="text">所含专业预测分数</span></a></li>
      </ul>
      <div class="tab-content">
        <div v-if="tab === 0" class="tab-pane active">
          <div class="card">
            <table class="table table-bordered table-sm table-striped table-hover gv mb-0" style="border-collapse: collapse;">
              <thead>
                <tr>
                  <th>年份</th><th>批次</th><th>文理科</th><th>专业组代码</th><th>院校名称</th><th>首选要求</th><th>次选要求</th>
                  <th>招生计划</th><th>平均分</th><th>最低分</th><th>平均分百分位</th><th>最低分百分位</th><th>平均分排名</th><th>最低分排名</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in tracked" :key="i">
                  <td align="right">{{ r.Year }}</td><td>{{ r.Batch }}</td><td>{{ r.ArtsOrScience }}</td><td>{{ nb(r.GroupCode) }}</td>
                  <td>{{ r.UnvName }}</td><td>{{ nb(r.FirstSubject) }}</td><td>{{ nb(r.SecondSubjects) }}</td>
                  <td align="right">{{ nb(r.Plan) }}</td>
                  <td class="text-success" align="right">{{ nb(r.AvgMark) }}</td><td class="text-primary" align="right">{{ nb(r.MinMark) }}</td>
                  <td class="text-success" align="right">{{ nb(p4(r.AvgMarkPercentile)) }}</td><td class="text-primary" align="right">{{ nb(p4(r.MinMarkPercentile)) }}</td>
                  <td class="text-success" align="right">{{ nb(r.AvgMarkRank) }}</td><td class="text-primary" align="right">{{ nb(r.MinMarkRank) }}</td>
                </tr>
                <tr v-if="d.tracked.length === 0"><td colspan="14" class="text-center text-muted">没有可显示的数据</td></tr>
              </tbody>
            </table>
            <GvPager v-model:page="pg[0].page" v-model:size="pg[0].size" :total="d.tracked.length" />
          </div>
        </div>

        <div v-if="tab === 1" class="tab-pane active">
          <div class="card">
            <table class="table table-bordered table-sm table-striped table-hover gv mb-0" style="border-collapse: collapse;">
              <thead>
                <tr>
                  <th>年份</th><th>批次</th><th>专业组代码</th><th>院校名称</th><th>首选要求</th><th>次选要求</th>
                  <th>招生计划</th><th>平均分</th><th>最低分</th><th>平均分百分位</th><th>最低分百分位</th><th>平均分排名</th><th>最低分排名</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in all" :key="i">
                  <td align="right">{{ r.Year }}</td><td>{{ r.Batch }}</td><td>{{ nb(r.GroupCode) }}</td>
                  <td>{{ r.UnvName }}</td><td>{{ nb(r.FirstSubject) }}</td><td>{{ nb(r.SecondSubjects) }}</td>
                  <td align="right">{{ nb(r.Plan) }}</td>
                  <td class="text-success" align="right">{{ nb(r.AvgMark) }}</td><td class="text-primary" align="right">{{ nb(r.MinMark) }}</td>
                  <td class="text-success" align="right">{{ nb(p4(r.AvgMarkPercentile)) }}</td><td class="text-primary" align="right">{{ nb(p4(r.MinMarkPercentile)) }}</td>
                  <td class="text-success" align="right">{{ nb(r.AvgMarkRank) }}</td><td class="text-primary" align="right">{{ nb(r.MinMarkRank) }}</td>
                </tr>
                <tr v-if="d.all.length === 0"><td colspan="13" class="text-center text-muted">没有可显示的数据</td></tr>
              </tbody>
            </table>
            <GvPager v-model:page="pg[1].page" v-model:size="pg[1].size" :total="d.all.length" />
          </div>
        </div>

        <div v-if="tab === 2" class="tab-pane active">
          <div class="card">
            <table class="table table-bordered table-sm table-striped table-hover gv mb-0" style="border-collapse: collapse;">
              <thead>
                <tr>
                  <th>专业代码</th><th>专业名称</th><th>首选要求</th><th>次选要求</th><th>招生计划</th><th>预测方法</th>
                  <th>预测平均分</th><th>预测最低分</th><th>预测平均分百分位</th><th>预测最低分百分位</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in majors" :key="r.RecruitMajorID">
                  <td>{{ r.RecruitMajorCode }}</td><td>{{ r.MajorName }}</td><td>{{ r.FirstSubject }}</td><td>{{ r.SecondSubjects }}</td>
                  <td align="right">{{ nb(r.MajorPlan) }}</td><td>{{ nb(r.PredictMethod) }}</td>
                  <td class="text-success" align="right">{{ dash(r.PreAvgMark) }}</td><td class="text-primary" align="right">{{ dash(r.PreMinMark) }}</td>
                  <td align="right">{{ dash(p4(r.PreAvgPercentile)) }}</td><td class="text-primary" align="right">{{ dash(p4(r.PreMinPercentile)) }}</td>
                </tr>
                <tr v-if="d.majors.length === 0"><td colspan="10" class="text-center text-muted">没有可显示的数据</td></tr>
              </tbody>
            </table>
            <GvPager v-model:page="pg[2].page" v-model:size="pg[2].size" :total="d.majors.length" />
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

