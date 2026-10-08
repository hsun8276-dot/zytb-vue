<template>
  <div class="submit-page">
    <h2 class="page-title">
      <el-icon style="margin-right:6px"><UserFilled /></el-icon>
      志愿交单（3+1+2）
    </h2>

    <el-breadcrumb separator="/" class="crumb">
      <el-breadcrumb-item>前台交单</el-breadcrumb-item>
      <el-breadcrumb-item>志愿交单</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never">
      <div class="filter-row">
        <span class="f-label">省份：</span>
        <el-select v-model="qProvince" style="width: 120px">
          <el-option v-for="p in PROVINCES" :key="p" :label="p" :value="p" />
        </el-select>

        <span class="f-label">年份：</span>
        <el-input :model-value="String(qYear)" disabled style="width: 100px" />

        <span class="f-label">批次：</span>
        <el-select v-model="qBatch" style="width: 120px">
          <el-option label="本科批" value="本科批" />
          <el-option label="专科批" value="专科批" />
        </el-select>

        <span class="f-label">组别：</span>
        <el-select v-model="qGroup" style="width: 120px">
          <el-option label="物理组" value="物理组" />
          <el-option label="历史组" value="历史组" />
        </el-select>

        <span class="f-label">填报师：</span>
        <el-select v-model="qFiller" clearable style="width: 140px" placeholder="【全部】">
          <el-option label="【全部】" :value="''" />
          <el-option v-for="f in fillers" :key="f.userId" :label="f.realName" :value="String(f.userId)" />
        </el-select>

        <span class="f-label">学生姓名：</span>
        <el-input v-model="keyword" style="width: 160px" clearable @keyup.enter="search" @clear="search" />
        <el-button class="btn-purple" @click="search">
          <el-icon><Search /></el-icon>&nbsp;检索
        </el-button>
      </div>

      <el-table :data="list" stripe v-loading="loading" class="submit-table">
        <el-table-column prop="studentName" label="姓名" min-width="100" />
        <el-table-column prop="genderText" label="性别" width="70" />
        <el-table-column prop="batch" label="批次" width="90" />
        <el-table-column label="志愿名称" min-width="130">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="openReport(row)">{{ row.aspirationName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="year" label="年份" width="80" />
        <el-table-column prop="score" label="成绩" width="80" />
        <el-table-column prop="subjectsDisplay" label="所选科目" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建日期" width="170" />
        <el-table-column prop="highSchool" label="高中学校" min-width="110" show-overflow-tooltip />
        <el-table-column label="交单" width="110">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="openFill(row)">{{ row.submitter || '已交单' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="退回" width="90">
          <template #default="{ row }">
            <el-button class="btn-amber" size="small" @click="onSendBack(row)">退回</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="fillerName" label="填报师" width="110" />
      </el-table>

      <div class="pager-row">
        <span class="pager-total">第 {{ page }} / {{ totalPages }} 页 ({{ total }} 项)</span>
        <el-pagination
          v-model:current-page="page"
          :page-size="size"
          :total="total"
          layout="prev, pager, next"
          class="pager-center"
          @current-change="load"
        />
        <div class="pager-size">
          <span>页尺寸：</span>
          <el-select v-model="size" style="width: 76px" @change="onSizeChange">
            <el-option v-for="n in [10, 20, 50]" :key="n" :label="n" :value="n" />
          </el-select>
        </div>
      </div>
    </el-card>

    <AdmissionReportDialog ref="reportRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, UserFilled } from '@element-plus/icons-vue'
import {
  getAspirationFillers,
  getAspirationPage,
  submitAspiration,
  type AspirationRow,
  type FillerOption
} from '@/api/aspiration'
import AdmissionReportDialog from './components/AdmissionReportDialog.vue'

const PROVINCES = ['河北']

const qProvince = ref('河北')
const qYear = ref(2026)
const qBatch = ref('本科批')
const qGroup = ref('物理组')
const qFiller = ref('')
const keyword = ref('')

const loading = ref(false)
const list = ref<AspirationRow[]>([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const fillers = ref<FillerOption[]>([])
const reportRef = ref<InstanceType<typeof AdmissionReportDialog> | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))

async function loadFillers() {
  try {
    fillers.value = await getAspirationFillers()
  } catch {
    fillers.value = []
  }
}

async function load() {
  loading.value = true
  try {
    const r = await getAspirationPage({
      page: page.value,
      size: size.value,
      keyword: keyword.value.trim() || undefined,
      submitStatus: 1,
      province: qProvince.value,
      year: qYear.value,
      batch: qBatch.value,
      groupName: qGroup.value,
      fillerUserId: qFiller.value || undefined
    })
    list.value = r.records
    total.value = r.total
  } catch (e: any) {
    ElMessage.error(e.message || '加载交单列表失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function onSizeChange() {
  page.value = 1
  load()
}

function openReport(row: AspirationRow) {
  reportRef.value?.open(row.aspirationCode)
}

function openFill(row: AspirationRow) {
  window.open(`/fill/${row.aspirationCode}`, '_blank')
}

async function onSendBack(row: AspirationRow) {
  try {
    await ElMessageBox.confirm(
      '您确认要退回前志愿单给填报师吗？',
      '确认交单',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    await submitAspiration(row.aspirationCode, 0)
    ElMessage.success('已退回填报师')
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '退回失败')
  }
}

onMounted(async () => {
  await loadFillers()
  await load()
})
</script>

<style scoped lang="scss">
.submit-page {
  .page-title {
    font-size: 20px;
    margin: 0 0 8px;
    display: flex;
    align-items: center;
  }

  .crumb {
    margin-bottom: 14px;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 10px;
    margin-bottom: 16px;

    .f-label {
      color: #606266;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  .btn-purple {
    background: #8e44ad;
    border-color: #8e44ad;
    color: #fff;
    margin-left: 4px;

    &:hover {
      background: #7d3c98;
      border-color: #7d3c98;
      color: #fff;
    }
  }

  .btn-amber {
    background: #f39c12;
    border-color: #f39c12;
    color: #fff;

    &:hover {
      background: #e67e22;
      border-color: #e67e22;
      color: #fff;
    }
  }

  .submit-table {
    width: 100%;
  }

  .pager-row {
    margin-top: 14px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;

    .pager-total {
      color: #909399;
      font-size: 13px;
    }

    .pager-center {
      justify-self: center;
    }

    .pager-size {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #606266;
      font-size: 13px;
    }
  }
}
</style>
