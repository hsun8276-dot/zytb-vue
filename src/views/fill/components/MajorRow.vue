<script setup lang="ts">
import { computed } from 'vue'
import type { MajorRow } from '@/api/fill'



/** 参考系统 MajorTemplate: dataType m=智能推荐 u=按高校检索 a=查看结果 r=报告(无操作列) */
const props = defineProps<{
  item: MajorRow
  index: number
  dataType: 'm' | 'u' | 'a'
  selected: boolean
  checked?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'add', rid: string): void
  (e: 'remove', rid: string): void
  (e: 'unv', uabId: string): void
  (e: 'major', rid: string): void
  (e: 'mapping', rid: string): void
  (e: 'check', rid: string, v: boolean): void
}>()

const bg = computed(() => {
  if (props.selected && props.dataType !== 'a') return '#e0e6eb'
  if (props.dataType === 'a' && props.item.IsNew === true) return '#f4f1df'
  return props.index % 2 === 0 ? 'white' : '#f5fbff'
})

const debut = computed(() => props.item.UnvFirstTimeAdmission === true && props.item.PreMinMark === null)
const h = computed(() => props.item.MajorHistorys)

function fixed2(v: number | null | undefined) {
  return v ? (v * 1).toFixed(2) + '%' : ''
}
</script>

<template>
  <div :style="{ backgroundColor: bg }" class="row m-0 pt-1 pb-1">
    <div class="col-2">
      <div class="row h-100">
        <div class="col-3 p-0 align-items-center d-flex justify-content-center serial">
          <span class="line-num">{{ index + 1 }}</span>
        </div>
        <div class="col-4 p-0 align-items-center d-flex justify-content-center probability">
          {{ item.Probability }}
        </div>
        <div class="col-5 p-0 align-items-center d-flex justify-content-center">
          <template v-if="!readonly">
            <div v-if="dataType === 'a'" class="form-check p-0 mr-1" title="勾选后可导出">
              <label class="form-check-label m-0">
                <input class="form-check-input" type="checkbox" :checked="checked"
                       @change="emit('check', item.RecruitMajorID, ($event.target as HTMLInputElement).checked)" />
                <span class="form-check-sign"></span>
              </label>
            </div>
            <a v-if="selected || dataType === 'a'" href="javascript:void(0)" class="btn btn-sm btn-danger"
               @click.prevent="emit('remove', item.RecruitMajorID)">移除</a>
            <a v-else href="javascript:void(0)" class="btn btn-sm btn-info" @click.prevent="emit('add', item.RecruitMajorID)">添加</a>
          </template>
        </div>
      </div>
    </div>
    <div class="col-6 text-truncate">
      <div class="d-inline-block">
        <a v-if="item.HotUrl" :href="item.HotUrl" class="text-decoration-none" target="_blank" title="热门推荐"><span class="mb-1"><i class="fas fa-fire text-danger"></i></span></a>
        <a class="text-danger text-decoration-none" href="javascript:void(0)" :title="item.ToolTipText" @click.prevent="emit('unv', item.uabID)">
          <span style="font-size: 160%;">{{ item.UnvName }}{{ item.NewName }}</span>
        </a>
        <a v-if="item.MapUrl" :href="item.MapUrl" class="text-decoration-none ml-1" target="_blank" title="地图街景"><span class="mb-1"><i class="fas fa-map-marked-alt text-success"></i></span></a>
        <a v-if="item.BaikeUrl" :href="item.BaikeUrl" class="text-decoration-none ml-1" target="_blank" title="高校信息"><span class="mb-1"><i class="fas fa-info-circle text-warning"></i></span></a>
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
          <a class="text-primary text-decoration-none" href="javascript:void(0)" @click.prevent="emit('major', item.RecruitMajorID)">{{ item.MajorName }}</a>
          <a v-if="item.MajorCodes.length > 0" href="javascript:void(0)" class="text-decoration-none ml-1" style="font-size: 80%;" title="专业信息"
             @click.prevent="emit('mapping', item.RecruitMajorID)"><span class="mb-1"><i class="fas fa-info-circle text-warning"></i></span></a>
          ，学制：{{ item.SchoolLength ?? '' }}，学费：{{ item.TuitionText ?? '' }}
        </span>
      </div>
      <span class="d-inline-block text-truncate w-100 might-overflow" style="margin: 4px 0px;">
        <template v-if="item.RecruitMajorCode">专业代码：{{ item.RecruitMajorCode }}；</template>
        <template v-if="item.MajorDirection">专业方向：{{ item.MajorDirection }}；</template>
        <template v-if="item.RecruitPlanExplain">专业解释：{{ item.RecruitPlanExplain }}</template>
      </span>
    </div>
    <div class="col-1 p-2 d-flex justify-content-start align-items-center w-100">
      <div>
        <p style="font-size: 85%; margin: 0px; padding: 0px;">高校：{{ item.UnvRank === null ? '无' : item.UnvRank }}</p>
        <p style="font-size: 85%; margin: 0px; padding: 0px;">专业：{{ item.MajorGrade === null && item.MajorRank === null ? '无' : `${item.MajorGrade ?? ''}，${item.MajorRank ?? ''}` }}</p>
      </div>
    </div>
    <div class="col-3">
      <div class="row">
        <div class="col-2 p-0 d-flex justify-content-center align-items-center w-100">
          <div class="text-center">
            <p v-if="item.RequiredSubjects.length === 0 && item.ElectiveSubjects.length === 0" class="m-1">无</p>
            <template v-else>
              <p v-for="v in item.RequiredSubjects" :key="'r' + v" class="required m-1">{{ v }}</p>
              <p v-for="v in item.ElectiveSubjects" :key="'e' + v" class="elective m-1">{{ v }}</p>
            </template>
          </div>
        </div>
        <div class="col-10 p-0">
          <table class="table table-striped history">
            <tbody>
              <tr class="sm-line-height">
                <td class="text-center"><i class="fas fa-users text-black-50" title="招生计划"></i></td>
                <td class="plan font-weight-bold">{{ item.MajorPlan }}</td>
                <td v-for="k in 3" :key="k">{{ h[k - 1]?.Plan }}</td>
              </tr>
              <tr class="sm-line-height">
                <td class="text-center"><i class="fas fa-bookmark text-black-50" title="分数线"></i></td>
                <td class="predict font-weight-bold">
                  <template v-if="debut">首次招生</template>
                  <template v-else>
                    {{ item.PreAvgMark === null ? '' : item.PreAvgMark + '-' }}{{ item.PreMinMark === null ? '?' : item.PreMinMark }}
                    <span v-if="item.MajorAttendtionType === 'Danger'" class="text-dark">*</span>
                    <span v-if="item.MajorAttendtionType === 'Warning'" class="text-warning">*</span>
                  </template>
                </td>
                <td v-for="k in 3" :key="k">
                  <template v-if="!(h[k - 1]?.MinMark == null && h[k - 1]?.MinMarkPercentile == null)">
                    <span class="text-danger font-weight-bold">{{ h[k - 1].EquivalentMinMark ?? '?' }}</span><span class="text-muted" style="font-size: 80%">({{ h[k - 1].MinMark ?? '?' }})</span>
                  </template>
                </td>
              </tr>
              <tr class="sm-line-height text-success">
                <td class="text-center"><i class="fas fa-chart-line text-black-50" title="线上百分位"></i></td>
                <td>{{ debut ? '' : fixed2(item.PreMinPercentile) }}</td>
                <td v-for="k in 3" :key="k">{{ fixed2(h[k - 1]?.MinMarkPercentile) }}</td>
              </tr>
              <tr class="sm-line-height text-primary">
                <td class="text-center"><i class="fas fa-chart-bar text-black-50" title="位次"></i></td>
                <td class="font-weight-bold">{{ debut ? '' : item.PreMinMarkRank }}</td>
                <td v-for="k in 3" :key="k">{{ h[k - 1]?.MinMarkRank }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <hr class="m-0 border-0 bg-light" style="height: 1px;" />
</template>
