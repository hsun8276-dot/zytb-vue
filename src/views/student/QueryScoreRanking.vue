<template>
  <div class="score-rank-page">
    <h2 class="page-title">
      <el-icon style="margin-right:6px"><DataAnalysis /></el-icon>
      一分一档表查询
    </h2>
    <el-breadcrumb separator="/" class="crumb">
      <el-breadcrumb-item>综合查询</el-breadcrumb-item>
      <el-breadcrumb-item>一分一档表查询</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never" class="filter-card">
      <div class="filter-row">
        <span class="f-label">省份：</span>
        <el-select v-model="province" placeholder="请选择省..." style="width: 140px" @change="onProvinceChange">
          <el-option label="请选择省..." value="" />
          <el-option v-for="p in provinces" :key="p" :label="p" :value="p" />
        </el-select>

        <span class="f-label">年份：</span>
        <el-select
          v-model="year"
          placeholder="请选择年份..."
          style="width: 140px"
          :disabled="!province"
          @change="onYearChange"
        >
          <el-option label="请选择年份..." :value="0" />
          <el-option v-for="y in years" :key="y" :label="String(y)" :value="y" />
        </el-select>

        <span class="f-label">文理科：</span>
        <el-select
          v-model="groupName"
          placeholder="请选择文理科/组别..."
          style="width: 170px"
          :disabled="!year"
        >
          <el-option label="请选择文理科/组别..." value="" />
          <el-option v-for="g in groups" :key="g" :label="g" :value="g" />
        </el-select>

        <span class="f-label">一分一档表类型：</span>
        <el-select v-model="tableType" style="width: 110px">
          <el-option label="全部" value="全部" />
          <el-option label="本科" value="本科" />
          <el-option label="专科" value="专科" />
        </el-select>

        <el-button class="btn-purple" @click="search">
          <el-icon><Search /></el-icon>&nbsp;查询
        </el-button>
        <el-button class="btn-green" :loading="exporting" @click="onExport">
          <el-icon><Download /></el-icon>&nbsp;导出到Excel
        </el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="list" stripe v-loading="loading" class="rank-table">
        <el-table-column prop="province" label="省份" align="center" min-width="90" />
        <el-table-column prop="year" label="年份" align="center" min-width="80" />
        <el-table-column prop="tableType" label="一分一档表类型" align="center" min-width="120" />
        <el-table-column prop="groupName" label="文理科/组别" align="center" min-width="110" />
        <el-table-column prop="score" label="分数" align="center" min-width="90" />
        <el-table-column prop="sameCount" label="人数" align="center" min-width="90" />
        <el-table-column prop="cumulative" label="累计人数" align="center" min-width="110" />
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { DataAnalysis, Search, Download } from '@element-plus/icons-vue'
import {
  exportScoreRanking,
  getScoreRankingGroups,
  getScoreRankingPage,
  getScoreRankingProvinces,
  getScoreRankingYears,
  type ScoreRankingRow
} from '@/api/query'

const provinces = ref<string[]>([])
const years = ref<number[]>([])
const groups = ref<string[]>([])
const province = ref('河北')
const year = ref(0)
const groupName = ref('')
const tableType = ref('全部')

const loading = ref(false)
const exporting = ref(false)
const list = ref<ScoreRankingRow[]>([])
const page = ref(1)
const size = ref(20)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value) || 1))

async function loadProvinces() {
  try {
    provinces.value = await getScoreRankingProvinces()
    if (!provinces.value.includes(province.value) && provinces.value.length) {
      province.value = provinces.value[0]
    }
  } catch {
    provinces.value = ['河北']
  }
}

async function loadYears() {
  years.value = []
  year.value = 0
  groups.value = []
  groupName.value = ''
  if (!province.value) return
  try {
    years.value = await getScoreRankingYears(province.value)
    if (years.value.length) year.value = years.value[0]
  } catch {
    years.value = []
  }
}

async function loadGroups() {
  groups.value = []
  groupName.value = ''
  if (!province.value || !year.value) return
  try {
    groups.value = await getScoreRankingGroups(province.value, year.value)
    if (groups.value.length) groupName.value = groups.value[0]
  } catch {
    groups.value = []
  }
}

async function onProvinceChange() {
  list.value = []
  total.value = 0
  await loadYears()
  await loadGroups()
}

async function onYearChange() {
  list.value = []
  total.value = 0
  await loadGroups()
}

function ensureFilters(): boolean {
  if (!province.value) { ElMessage.warning('请选择省份'); return false }
  if (!year.value) { ElMessage.warning('请选择年份'); return false }
  if (!groupName.value) { ElMessage.warning('请选择文理科/组别'); return false }
  return true
}

async function load() {
  if (!ensureFilters()) return
  loading.value = true
  try {
    const r = await getScoreRankingPage({
      province: province.value,
      year: year.value,
      groupName: groupName.value,
      tableType: tableType.value,
      page: page.value,
      size: size.value
    })
    list.value = r.records
    total.value = r.total
  } catch (e: any) {
    ElMessage.error(e.message || '查询失败')
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

async function onExport() {
  if (!ensureFilters()) return
  exporting.value = true
  try {
    await exportScoreRanking({
      province: province.value,
      year: year.value,
      groupName: groupName.value,
      tableType: tableType.value
    })
    ElMessage.success('导出成功')
  } catch (e: any) {
    ElMessage.error(e.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await loadProvinces()
  await loadYears()
  await loadGroups()
  if (province.value && year.value && groupName.value) await load()
})
</script>

<style scoped lang="scss">
.score-rank-page {
  .page-title {
    display: flex;
    align-items: center;
    font-size: 20px;
    margin: 0 0 8px;
  }
  .crumb { margin-bottom: 14px; }
  .filter-card { margin-bottom: 14px; }
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 10px;
    .f-label { color: #606266; font-weight: 600; white-space: nowrap; }
  }
  .btn-purple {
    background: #8e44ad;
    border-color: #8e44ad;
    color: #fff;
    &:hover { background: #7d3c98; border-color: #7d3c98; color: #fff; }
  }
  .btn-green {
    background: #27ae60;
    border-color: #27ae60;
    color: #fff;
    &:hover { background: #219150; border-color: #219150; color: #fff; }
  }
  .rank-table { width: 100%; }
  .pager-row {
    margin-top: 14px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    .pager-total { color: #909399; font-size: 13px; }
    .pager-center { justify-self: center; }
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
