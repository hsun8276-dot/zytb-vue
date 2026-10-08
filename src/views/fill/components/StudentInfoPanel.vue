<script setup lang="ts">
import { computed } from 'vue'
import type { FillHeader } from '@/api/fill'

/** 参考系统 UserAspiration.aspx: 左侧学生信息侧栏 */
const props = defineProps<{ h: FillHeader }>()

const yesNo = (v: number | null | undefined) => (v === 1 ? '是' : v === 0 ? '否' : '未知')
const subjects = computed(() => props.h.subjectsDisplay ? props.h.subjectsDisplay.split('、') : [])
const v = (x: unknown) => (x === null || x === undefined ? '' : String(x))
</script>

<template>
  <div class="pl-4 pr-4">
    <div class="row mb-2 pt-2">
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">性别：</span><span>{{ h.genderText }}</span></div>
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">年份：</span><span>{{ h.year }}</span></div>
    </div>
    <div class="row mb-2">
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">省份：</span><span>{{ h.province }}</span></div>
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">组别：</span><span>{{ h.groupName || h.firstSubject + '组' }}</span></div>
    </div>
    <div class="row mb-2">
      <div class="col form-inline p-0"><span class="font-weight-bold">科目：</span><span>{{ h.subjectsDisplay }}</span></div>
    </div>
    <div class="row mb-3 pb-3 border-bottom">
      <div class="col form-inline p-0">
        <label class="font-weight-bold">成绩：</label>
        <span>{{ h.score }}</span>分
        （其中政策加分：<span>{{ h.bonusScore ? h.bonusScore : '' }}</span>分）
      </div>
    </div>

    <div class="row mb-2">
      <div class="col form-inline p-0"><span class="font-weight-bold">志愿名称：</span><span>{{ v(h.aspirationName) }}</span></div>
    </div>
    <div class="row mb-2">
      <div class="col form-inline p-0"><span class="font-weight-bold">就读高中：</span><span>{{ v(h.highSchool) }}</span></div>
    </div>
    <div class="row mb-2">
      <div class="col form-inline p-0"><span class="font-weight-bold">联系电话：</span><span>{{ v(h.contactPhone) }}</span></div>
    </div>
    <div class="row mb-3 pb-3 border-bottom">
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">民族：</span><span>{{ v(h.ethnicity) }}</span></div>
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">是否应届：</span><span>{{ yesNo(h.isFresh) }}</span></div>
    </div>

    <div class="row mb-2">
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">语文：</span><span>{{ v(h.chineseScore) }}</span></div>
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">数学：</span><span>{{ v(h.mathScore) }}</span></div>
    </div>
    <div class="row mb-2">
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">外语：</span><span>{{ v(h.englishScore) }}</span></div>
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">{{ subjects[0] ?? '首选' }}：</span><span>{{ v(h.elective1Score) }}</span></div>
    </div>
    <div class="row mb-3 pb-3 border-bottom">
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">{{ subjects[1] ?? '再选' }}：</span><span>{{ v(h.elective2Score) }}</span></div>
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">{{ subjects[2] ?? '再选' }}：</span><span>{{ v(h.elective3Score) }}</span></div>
    </div>

    <div class="row mb-2">
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">身高：</span><span>{{ v(h.heightCm) }}</span></div>
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">体重：</span><span>{{ v(h.weightKg) }}</span></div>
    </div>
    <div class="row mb-2">
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">左眼视力：</span><span>{{ v(h.leftVision) }}</span></div>
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">右眼视力：</span><span>{{ v(h.rightVision) }}</span></div>
    </div>
    <div class="row mb-3 pb-3 border-bottom">
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">是否色盲：</span><span>{{ yesNo(h.colorBlind) }}</span></div>
      <div class="col-6 form-inline p-0"><span class="font-weight-bold">是否色弱：</span><span>{{ yesNo(h.colorWeakness) }}</span></div>
    </div>

    <div class="row mb-2">
      <div class="col form-inline p-0"><span class="font-weight-bold">父母姓名：</span><span>{{ v(h.parentName) }}</span></div>
    </div>
    <div class="row mb-2">
      <div class="col form-inline p-0"><span class="font-weight-bold">父亲职业：</span><span>{{ v(h.fatherJob) }}</span></div>
    </div>
    <div class="row mb-2">
      <div class="col form-inline p-0"><span class="font-weight-bold">母亲职业：</span><span>{{ v(h.motherJob) }}</span></div>
    </div>
  </div>
</template>
