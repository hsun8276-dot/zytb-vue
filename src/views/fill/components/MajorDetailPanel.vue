<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fillApi, type MajorDetail } from '@/api/fill'
import { getQueryMajorDetail } from '@/api/query'
import { useGx } from '../composables/useGx'

/** 参考系统 ViewMajorDetail.aspx: 招生专业明细 */
const props = defineProps<{ code?: string; rid: string; province: string }>()
const { notify } = useGx()

const d = ref<MajorDetail | null>(null)
const info = computed(() => d.value?.info)
const fullName = computed(() => {
  const i = info.value
  if (!i) return ''
  return i.RecruitPlanExplain ? `${i.MajorName} | ${i.RecruitPlanExplain}` : i.MajorName
})

const p4 = (v: number | null | undefined) => (v === null || v === undefined ? '' : `${Number(v).toFixed(4)}%`)
const v = (x: unknown) => (x === null || x === undefined ? '' : String(x))

onMounted(async () => {
  try {
    d.value = props.code
      ? await fillApi.majorDetail(props.code, props.rid)
      : await getQueryMajorDetail(props.rid)
  } catch (e) {
    notify(e, '发生错误', 'danger', 0)
  }
})
</script>

<template>
  <div v-if="d && info" class="p-3">
    <h3 class="text-primary mb-2 ml-2">专业信息</h3>
    <div class="card mb-3">
      <div class="card-body">
        <div class="row m-2">
          <div class="col-1 font-weight-bold text-right p-0">省份：</div>
          <div class="col-2"><span>{{ province }}</span></div>
          <div class="col-1 font-weight-bold text-right p-0">年份：</div>
          <div class="col-2"><span>{{ info.Year }}</span></div>
          <div class="col-1 font-weight-bold text-right p-0">批次：</div>
          <div class="col-2"><span>{{ info.Batch }}</span></div>
          <div class="col-1 font-weight-bold text-right p-0">文理科：</div>
          <div class="col-2"><span>{{ info.ArtsOrScience }}</span></div>
        </div>
        <div class="row m-2">
          <div class="col-1 font-weight-bold text-right p-0">院校代码：</div>
          <div class="col-2"><span>{{ info.UnvCode }}</span></div>
          <div class="col-1 font-weight-bold text-right p-0">院校名称：</div>
          <div class="col-8"><span>{{ info.UnvName }}</span></div>
        </div>
        <div class="row m-2">
          <div class="col-1 font-weight-bold text-right p-0">专业代码：</div>
          <div class="col-2"><span>{{ info.RecruitMajorCode }}</span></div>
          <div class="col-1 font-weight-bold text-right p-0">专业名称：</div>
          <div class="col-8 text-info"><span>{{ fullName }}</span></div>
        </div>
        <hr />
        <div class="row m-2">
          <div class="col-2 font-weight-bold text-right p-0">预测平均分：</div>
          <div class="col-2 font-weight-bold text-danger"><span>{{ v(info.PreAvgMark) }}</span></div>
          <div class="col-2 font-weight-bold text-right p-0">预测最低分：</div>
          <div class="col-2 font-weight-bold text-danger"><span>{{ v(info.PreMinMark) }}</span></div>
          <div class="col-2 font-weight-bold text-right p-0">招生计划：</div>
          <div class="col-2"><span>{{ v(info.MajorPlan) }}</span></div>
        </div>
        <div class="row m-2">
          <div class="col-2 font-weight-bold text-right p-0">预测平均分百分位：</div>
          <div class="col-2 text-primary"><span>{{ info.PreAvgPercentile ?? '' }}</span>%</div>
          <div class="col-2 font-weight-bold text-right p-0">预测最低分百分位：</div>
          <div class="col-2 text-primary"><span>{{ info.PreMinPercentile ?? '' }}</span>%</div>
          <div class="col-2 font-weight-bold text-right p-0">学制：</div>
          <div class="col-2"><span>{{ v(info.SchoolLength) }}</span></div>
        </div>
        <div class="row m-2">
          <div class="col-2 font-weight-bold text-right p-0">预测平均分排名：</div>
          <div class="col-2 text-success"><span>{{ v(info.PreAvgMarkRank) }}</span></div>
          <div class="col-2 font-weight-bold text-right p-0">预测最低分排名：</div>
          <div class="col-2 text-success"><span>{{ v(info.PreMinMarkRank) }}</span></div>
          <div class="col-2 font-weight-bold text-right p-0">学费：</div>
          <div class="col-2"><span>{{ v(info.TuitionText) }}</span></div>
        </div>
      </div>
    </div>

    <h3 class="text-primary mb-2 ml-2 mt-4">专业历史数据</h3>
    <div class="card p-0">
      <table class="table table-bordered table-sm table-striped table-hover gv border-0 mb-0" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th>年份</th><th>批次</th><th>文理科</th><th>院校代码</th><th>院校名称</th><th>专业代码</th><th>专业名称</th><th>招生计划</th>
            <th>平均分</th><th>最低分</th><th>平均分百分位</th><th>最低分百分位</th><th>平均分排名</th><th>最低分排名</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in d.histories" :key="i">
            <td>{{ r.Year }}</td><td>{{ r.Batch }}</td><td>{{ r.ArtsOrScience }}</td><td>{{ r.UnvCode }}</td><td>{{ r.UnvName }}</td>
            <td>{{ r.RecruitMajorCode }}</td><td>{{ r.MajorName }}</td><td>{{ v(r.Plan) }}</td>
            <td class="text-warning">{{ v(r.AvgMark) }}</td><td class="text-success">{{ v(r.MinMark) }}</td>
            <td class="text-primary">{{ p4(r.AvgMarkPercentile) }}</td><td class="text-primary">{{ p4(r.MinMarkPercentile) }}</td>
            <td>{{ v(r.AvgMarkRank) }}</td><td>{{ v(r.MinMarkRank) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

