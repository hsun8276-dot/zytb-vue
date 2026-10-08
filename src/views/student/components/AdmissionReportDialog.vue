<template>
  <el-dialog
    v-model="visible"
    title="志愿录取情况报告"
    width="920px"
    :close-on-click-modal="false"
    destroy-on-close
    class="admission-dialog"
  >
    <div v-loading="loading" class="admission-body">
      <div class="section-title">考生基础信息</div>
      <div class="info-card">
        <div class="info-grid">
          <div><label>姓名：</label>{{ report?.studentName || '-' }}</div>
          <div><label>性别：</label>{{ report?.genderText || '-' }}</div>
          <div><label>省份：</label>{{ report?.province || '-' }}</div>
          <div><label>文理：</label>{{ report?.artsOrScience || '-' }}</div>
          <div><label>高中：</label>{{ report?.highSchool || '' }}</div>
          <div><label>班级：</label>{{ report?.className || '' }}</div>
          <div><label>成绩：</label>{{ report?.score ?? '-' }}分</div>
          <div><label>位次：</label>{{ report?.rank ?? '-' }}位</div>
          <div><label>与你同分人数：</label>{{ report?.sameCount ?? 0 }}人</div>
        </div>
      </div>

      <div class="legend">
        注意：红色志愿提档分高于考生分数，黄色志愿提档分与考生分数相等，绿色志愿提档分低于考生分数。
      </div>

      <el-table :data="report?.majors || []" border size="small" class="majors-table" max-height="420"
                :row-class-name="rowClass">
        <el-table-column prop="serial" label="序号" width="70" align="center" />
        <el-table-column prop="unvCode" label="院校代码" width="100" align="center" />
        <el-table-column prop="unvName" label="院校名称" min-width="180" />
        <el-table-column prop="majorCode" label="专业代码" width="100" align="center" />
        <el-table-column prop="majorName" label="专业名称" min-width="180" />
        <el-table-column prop="cutOff" label="提档线" width="90" align="center" />
      </el-table>
    </div>
    <template #footer>
      <el-button type="danger" @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdmissionReport, type AdmissionReport, type AdmissionMajorRow } from '@/api/aspiration'

const visible = ref(false)
const loading = ref(false)
const report = ref<AdmissionReport | null>(null)

async function open(code: string) {
  visible.value = true
  loading.value = true
  report.value = null
  try {
    report.value = await getAdmissionReport(code)
  } catch (e: any) {
    ElMessage.error(e.message || '加载录取情况报告失败')
    visible.value = false
  } finally {
    loading.value = false
  }
}

function rowClass({ row }: { row: AdmissionMajorRow }) {
  if (row.level > 0) return 'row-red'
  if (row.level === 0) return 'row-yellow'
  return 'row-green'
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.admission-body {
  min-height: 200px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
}

.info-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 14px 16px;
  background: #fff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 18px;
  font-size: 14px;
  color: #303133;

  label {
    color: #606266;
  }
}

.legend {
  margin: 14px 0;
  padding: 10px 12px;
  background: #f5f7fa;
  border-left: 4px solid #f56c6c;
  color: #606266;
  font-size: 13px;
}

.majors-table {
  width: 100%;
}

:deep(.row-red) > td {
  background: #ffc7ce !important;
  color: #9c0006;
}

:deep(.row-yellow) > td {
  background: #ffeb9c !important;
  color: #9c5700;
}

:deep(.row-green) > td {
  background: #c6efce !important;
  color: #006100;
}
</style>
