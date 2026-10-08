<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { fillApi, type MajorRow, type ReportData } from '@/api/fill'
import { useGx } from '../composables/useGx'

/** 参考系统 ViewReportNew.aspx: 志愿报告(不含格学广告图与二维码) */
const props = defineProps<{ code: string }>()
const { notify } = useGx()

const d = ref<ReportData | null>(null)
const root = ref<HTMLElement | null>(null)
const rankEl = ref<HTMLElement | null>(null)
const sameEl = ref<HTMLElement | null>(null)
let rankChart: echarts.ECharts | null = null
let sameChart: echarts.ECharts | null = null

const years = computed(() => (d.value ? [d.value.header.year - 1, d.value.header.year - 2, d.value.header.year - 3] : []))

function fixed2(v: number | null | undefined) {
  return v ? (v * 1).toFixed(2) + '%' : ''
}

function debut(m: MajorRow) {
  return m.UnvFirstTimeAdmission === true && m.PreMinMark === null
}

function lineOption(xName: string, yName: string, points: number[][], x: number, y: number): echarts.EChartsOption {
  return {
    xAxis: { name: xName },
    yAxis: { name: yName },
    series: [{
      data: points,
      type: 'line',
      showSymbol: false,
      markPoint: { data: [{ name: '您在这里', symbolSize: 50, value: '您在这里', xAxis: x, yAxis: y }] }
    }]
  }
}

function drawCharts() {
  const r = d.value
  if (!r || !rankEl.value || !sameEl.value) return
  const score = r.header.score
  const me = r.ranking.find(p => p.score === score) ?? r.ranking.find(p => p.score < score)
  rankChart = echarts.init(rankEl.value)
  rankChart.setOption(lineOption('排名', '分数', r.ranking.map(p => [p.cumulative, p.score]), me?.cumulative ?? 0, score))
  sameChart = echarts.init(sameEl.value)
  sameChart.setOption(lineOption('分数', '人数', r.ranking.map(p => [p.score, p.sameCount]), score, me?.sameCount ?? 0))
}

function onResize() {
  rankChart?.resize()
  sameChart?.resize()
}

/** 打印: 把报告复制到新窗口(图表转图片), 带上当前页面全部样式 */
function print() {
  const el = root.value
  if (!el) return
  const clone = el.cloneNode(true) as HTMLElement
  const charts: [string, echarts.ECharts | null][] = [['chart-rank', rankChart], ['chart-same', sameChart]]
  for (const [id, c] of charts) {
    const holder = clone.querySelector<HTMLElement>(`#${id}`)
    if (holder && c) holder.innerHTML = `<img src="${c.getDataURL({ pixelRatio: 2, backgroundColor: '#fff' })}" style="width:100%;" />`
  }
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(n => n.outerHTML).join('\n')
  const w = window.open('', '_blank')
  if (!w) {
    notify('浏览器阻止了打印窗口，请允许弹出窗口后重试。', '打印失败', 'danger', 0)
    return
  }
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>志愿报告</title>${styles}</head><body style="background:#fff;"><div class="gx">${clone.outerHTML}</div></body></html>`)
  w.document.close()
  w.onload = () => {
    w.focus()
    w.print()
  }
}

defineExpose({ print })

onMounted(async () => {
  try {
    d.value = await fillApi.report(props.code)
    await nextTick()
    drawCharts()
    window.addEventListener('resize', onResize)
  } catch (e) {
    notify(e, '错误', 'danger', 0)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  rankChart?.dispose()
  sameChart?.dispose()
})
</script>

<template>
  <div v-if="d" ref="root" class="report p-4">
    <h1 class="page-title">一、高考成绩信息</h1>
    <div class="card">
      <div class="card-header"><div class="card-head-row"><div class="card-title">考生基础信息</div></div></div>
      <div class="card-body">
        <div class="row p-1">
          <div class="col"><strong>姓名：</strong><span>{{ d.header.studentName }}</span></div>
          <div class="col"><strong>性别：</strong><span>{{ d.header.genderText }}</span></div>
          <div class="col"><strong>省份：</strong><span>{{ d.header.province }}</span></div>
        </div>
        <div class="row p-1">
          <div class="col"><strong>文理：</strong><span>{{ d.header.groupName || d.header.firstSubject + '组' }}</span></div>
          <div class="col"><strong>高中：</strong><span>{{ d.header.highSchool }}</span></div>
          <div class="col"><strong>班级：</strong><span></span></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-head-row"><div class="card-title">高考成绩信息</div></div></div>
      <div class="card-body">
        <div class="row p-1">
          <div class="col"><strong>成绩：</strong><span>{{ d.header.score }}</span>分</div>
          <div class="col"><strong>位次：</strong><span>{{ d.header.rank ?? '' }}</span>位</div>
          <div class="col"><strong>与你同分人数：</strong><span>{{ d.header.sameCount ?? '' }}</span>人</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-head-row"><div class="card-title">全省分数位次定位图</div></div></div>
      <div class="card-body"><div id="chart-rank" ref="rankEl" style="width: 100%; height: 450px;"></div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-head-row"><div class="card-title">分数相同人数分析图</div></div></div>
      <div class="card-body"><div id="chart-same" ref="sameEl" style="width: 100%; height: 450px;"></div></div>
    </div>

    <h1 class="page-title">二、志愿单预览</h1>
    <div class="row m-0 mt-2 bg-info text-center text-white font-weight-bold">
      <div class="col-7">
        <div class="row h-100">
          <div class="col-1 border p-0 align-items-center d-flex justify-content-center">序号</div>
          <div class="col-11 border p-0 align-items-center d-flex justify-content-center">高校专业</div>
        </div>
      </div>
      <div class="col-5">
        <div class="row h-100">
          <div class="col-2 border p-0 align-items-center d-flex justify-content-center">排名</div>
          <div class="col-2 border p-0 align-items-center d-flex justify-content-center">科目</div>
          <div class="col-8">
            <div class="row">
              <div class="col border border-bottom-0 p-0 pt-1 pb-1 align-items-center d-flex justify-content-center">历史等效数据</div>
            </div>
            <div class="row">
              <div class="col-2 border p-0 pt-1 pb-1 align-items-center d-flex justify-content-center">要求</div>
              <div class="col-4 border p-0 pt-1 pb-1 align-items-center d-flex justify-content-center">百分位预测</div>
              <div v-for="y in years" :key="y" class="col-2 border p-0 pt-1 pb-1 align-items-center d-flex justify-content-center">{{ y }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-for="(item, i) in d.majors" :key="item.RecruitMajorID">
      <div :style="{ backgroundColor: i % 2 === 0 ? 'white' : '#f5fbff' }" class="row m-0 pt-1 pb-1">
        <div class="col-7">
          <div class="row h-100">
            <div class="col-1 align-items-center d-flex justify-content-center probability">{{ i + 1 }}</div>
            <div class="col-11 text-truncate">
              <div class="d-inline-block">
                <span class="text-danger" style="font-size: 160%;">{{ item.UnvName }}{{ item.NewName }}</span>
                <span class="text-muted ml-2 mr-2">|</span>
                <span class="text-muted mr-3">{{ item.Province }}，{{ item.City }}</span>
                <template v-for="v in item.UnvAttributes" :key="v"><code>{{ v }}</code>{{ ' ' }}</template>
                <code class="unv-nature">{{ item.UnvNature }}</code>{{ ' ' }}
                <code>{{ item.UnvType }}</code>{{ ' ' }}
                <span :class="['badge badge-warning p-1', { 'd-none': !item.HasMasterUnit }]">硕</span>{{ ' ' }}
                <span :class="['badge badge-danger p-1', { 'd-none': !item.HasDoctorUnit }]">博</span>{{ ' ' }}
                <span :class="['badge badge-success p-1', { 'd-none': !item.CanRecommend }]">保</span>
              </div>
              <div class="text-dark mt-1" style="font-size: 120%;">
                <span class="d-inline-block text-truncate w-100 might-overflow">
                  <span class="text-primary">{{ item.MajorName }}</span>，学制：{{ item.SchoolLength ?? '' }}，学费：{{ item.TuitionText ?? '' }}
                </span>
              </div>
              <span class="d-inline-block text-truncate w-100 might-overflow" style="margin: 4px 0px;">
                <template v-if="item.RecruitMajorCode">专业代码：{{ item.RecruitMajorCode }}；</template>
                <template v-if="item.MajorDirection">专业方向：{{ item.MajorDirection }}；</template>
                <template v-if="item.RecruitPlanExplain">专业解释：{{ item.RecruitPlanExplain }}</template>
              </span>
            </div>
          </div>
        </div>
        <div class="col-5">
          <div class="row">
            <div class="col-2 p-2 d-flex justify-content-start align-items-center w-100">
              <div>
                <p style="font-size: 85%; margin: 0px; padding: 0px;">高校：{{ item.UnvRank === null ? '无' : item.UnvRank }}</p>
                <p style="font-size: 85%; margin: 0px; padding: 0px;">专业：{{ item.MajorGrade === null && item.MajorRank === null ? '无' : `${item.MajorGrade ?? ''}，${item.MajorRank ?? ''}` }}</p>
              </div>
            </div>
            <div class="col-2 p-0 d-flex justify-content-center align-items-center w-100">
              <div class="text-center">
                <p v-if="item.RequiredSubjects.length === 0 && item.ElectiveSubjects.length === 0" class="m-1">无</p>
                <template v-else>
                  <p v-for="v in item.RequiredSubjects" :key="'r' + v" class="required m-1">{{ v }}</p>
                  <p v-for="v in item.ElectiveSubjects" :key="'e' + v" class="elective m-1">{{ v }}</p>
                </template>
              </div>
            </div>
            <div class="col-8 p-0">
              <table class="table table-striped history">
                <tbody>
                  <tr class="sm-line-height">
                    <td class="text-center"><i class="fas fa-users text-black-50" title="招生计划"></i></td>
                    <td class="plan font-weight-bold">{{ item.MajorPlan }}</td>
                    <td v-for="k in 3" :key="k">{{ item.MajorHistorys[k - 1]?.Plan }}</td>
                  </tr>
                  <tr class="sm-line-height">
                    <td class="text-center"><i class="fas fa-bookmark text-black-50" title="分数线"></i></td>
                    <td class="predict font-weight-bold">
                      <template v-if="debut(item)">首次招生</template>
                      <template v-else>
                        {{ item.PreAvgMark === null ? '' : item.PreAvgMark + '-' }}{{ item.PreMinMark === null ? '?' : item.PreMinMark }}
                        <span v-if="item.MajorAttendtionType === 'Danger'" class="text-dark">*</span>
                        <span v-if="item.MajorAttendtionType === 'Warning'" class="text-warning">*</span>
                      </template>
                    </td>
                    <td v-for="k in 3" :key="k">
                      <template v-if="!(item.MajorHistorys[k - 1]?.MinMark == null && item.MajorHistorys[k - 1]?.MinMarkPercentile == null)">
                        <span class="text-danger font-weight-bold">{{ item.MajorHistorys[k - 1].EquivalentMinMark ?? '?' }}</span><span class="text-muted" style="font-size: 80%">({{ item.MajorHistorys[k - 1].MinMark ?? '?' }})</span>
                      </template>
                    </td>
                  </tr>
                  <tr class="sm-line-height text-success">
                    <td class="text-center"><i class="fas fa-chart-line text-black-50" title="线上百分位"></i></td>
                    <td>{{ fixed2(item.PreMinPercentile) }}</td>
                    <td v-for="k in 3" :key="k">{{ fixed2(item.MajorHistorys[k - 1]?.MinMarkPercentile) }}</td>
                  </tr>
                  <tr class="sm-line-height text-primary">
                    <td class="text-center"><i class="fas fa-chart-bar text-black-50" title="位次"></i></td>
                    <td class="font-weight-bold">{{ item.PreMinMarkRank }}</td>
                    <td v-for="k in 3" :key="k">{{ item.MajorHistorys[k - 1]?.MinMarkRank }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <hr class="m-0 border-0 bg-light" style="height: 1px;" />
    </template>

    <h1 class="page-title mt-4">三、其它说明</h1>
    <div class="card">
      <div class="card-body">
        <p><strong>关于录取百分位的说明：</strong>为了能够更为精确的预测高校录取成绩，我们采用了录取百分位作为测算指标，将历年数据通过大量科学运算分析得到次年的预测值。</p>
        <p><strong>数据分析方法：</strong>为了避免高考题目难易程度对整体分数高低的影响，系统首先将分数换算为对应位次，然后采用各批次省控线所对应的累计人数作为参考点，通过多重复杂的科学运算求得录取百分位。</p>
      </div>
    </div>

    <h1 class="page-title">四、结&nbsp;&nbsp;语</h1>
    <div class="card">
      <div class="card-body">
        <p>当然，无论怎样，我们只能帮你更好的全面客观的认识自己，让你知道自己擅长做些什么？适合做些什么？喜欢做些什么？而打开成功之门的钥匙，掌握在你的手中。</p>
      </div>
    </div>

    <h1 class="page-title">五、附&nbsp;&nbsp;录</h1>
    <div class="card">
      <div class="card-body">
        <p>本报告是运用砚衡AI云数据升学规划系统生成的。在理解报告内容时，必须考虑到以问卷为基础之评价的主观特性。砚衡对使用此份报告的后果不承担责任。</p>
        <p>本报告为您推荐了各批次各等级志愿填报的参考院校，可为高考志愿填报的院校选择提供参考，但不能作为唯一依据。应该与其它有关信息，如考生高考成绩排名、往年各院校录取考生排名、各院校招生人数变化等结合使用。本报告结果注意保密，只供使用者与其家属阅读。</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-7"></div>
          <div class="col-5 p-4">
            <div class="row mb-5">
              <div class="col-3 text-right">签名：</div>
              <div class="col-7 border-bottom"></div>
              <div class="col-2"></div>
            </div>
            <div class="row">
              <div class="col-3 border-bottom"></div>
              <div class="col-1 text-center">年</div>
              <div class="col-2 border-bottom"></div>
              <div class="col-1 text-center">月</div>
              <div class="col-2 border-bottom"></div>
              <div class="col-1 text-center">日</div>
              <div class="col-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report :deep(.card-body p),
.report :deep(.card-body div) {
  font-size: 16px;
}

.report :deep(.card-body li) {
  margin-top: 0.5rem;
}
</style>
