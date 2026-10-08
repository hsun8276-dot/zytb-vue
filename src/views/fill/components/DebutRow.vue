<script setup lang="ts">
import type { MajorRow } from '@/api/fill'

/** 参考系统 DebutTemplate(首次招生高校) */
defineProps<{ item: MajorRow; index: number; selected: boolean }>()

const emit = defineEmits<{
  (e: 'add', rid: string): void
  (e: 'remove', rid: string): void
  (e: 'unv', uabId: string): void
  (e: 'major', rid: string): void
  (e: 'mapping', rid: string): void
}>()
</script>

<template>
  <div :style="{ backgroundColor: selected ? '#e0e6eb' : index % 2 === 0 ? 'white' : '#f5fbff' }" class="row m-0 pt-1 pb-1">
    <div class="col-1 p-0 align-items-center d-flex justify-content-center">
      <a v-if="selected" href="javascript:void(0)" class="btn btn-sm btn-danger" @click.prevent="emit('remove', item.RecruitMajorID)">移除</a>
      <a v-else href="javascript:void(0)" class="btn btn-sm btn-info" @click.prevent="emit('add', item.RecruitMajorID)">添加</a>
    </div>
    <div class="col-7 text-truncate">
      <div class="d-inline-block">
        <a class="text-danger text-decoration-none" href="javascript:void(0)" :title="item.ToolTipText" @click.prevent="emit('unv', item.uabID)">
          <span style="font-size: 160%;">{{ item.UnvName }}{{ item.NewName }}</span>
        </a>
        <a v-if="item.MapUrl" :href="item.MapUrl" class="text-decoration-none ml-1" target="_blank" title="地图街景"><span class="mb-1"><i class="fas fa-map-marked-alt text-success"></i></span></a>
        <a v-if="item.BaikeUrl" :href="item.BaikeUrl" class="text-decoration-none ml-1" target="_blank" title="高校信息"><span class="mb-1"><i class="fas fa-info-circle text-warning"></i></span></a>
        <a v-if="item.HotUrl" :href="item.HotUrl" class="text-decoration-none" target="_blank" title="热门推荐"><span class="mb-1"><i class="fas fa-fire text-danger"></i></span></a>
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
    <div class="col-1 p-0 d-flex justify-content-center align-items-center w-100">
      <div class="text-center">
        <p v-if="item.RequiredSubjects.length === 0 && item.ElectiveSubjects.length === 0" class="m-1">无</p>
        <template v-else>
          <p v-for="v in item.RequiredSubjects" :key="'r' + v" class="required m-1">{{ v }}</p>
          <p v-for="v in item.ElectiveSubjects" :key="'e' + v" class="elective m-1">{{ v }}</p>
        </template>
      </div>
    </div>
    <div class="col-1 d-flex justify-content-center align-items-center w-100" style="font-size: 120%;">{{ item.MajorPlan }}</div>
    <div class="col-1 d-flex justify-content-center align-items-center w-100" style="font-size: 120%;">{{ item.SchoolLength }}</div>
    <div class="col-1 d-flex justify-content-center align-items-center w-100" style="font-size: 120%;">{{ item.TuitionText }}</div>
  </div>
</template>
