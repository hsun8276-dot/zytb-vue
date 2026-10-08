<template>
  <div class="control-line-page">
    <h2 class="page-title">
      <el-icon style="margin-right:6px"><Document /></el-icon>
      历年省控线查询
    </h2>
    <el-breadcrumb separator="/" class="crumb">
      <el-breadcrumb-item>综合查询</el-breadcrumb-item>
      <el-breadcrumb-item>历年省控线查询</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never" class="filter-card">
      <div class="filter-row">
        <span class="f-label">省份：</span>
        <el-select
          v-model="province"
          placeholder="请选择省..."
          style="width: 160px"
          @change="onProvinceChange"
        >
          <el-option label="请选择省..." value="" />
          <el-option v-for="p in provinces" :key="p" :label="p" :value="p" />
        </el-select>

        <span class="f-label">年份：</span>
        <el-select
          v-model="year"
          placeholder="请选择年份..."
          style="width: 160px"
          :disabled="!province"
        >
          <el-option label="请选择年份..." :value="0" />
          <el-option v-for="y in years" :key="y" :label="String(y)" :value="y" />
        </el-select>

        <el-button class="btn-purple" @click="search">
          <el-icon><Search /></el-icon>&nbsp;查询
        </el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="list" stripe v-loading="loading" class="line-table">
        <el-table-column prop="province" label="省份" align="center" min-width="100" />
        <el-table-column prop="year" label="年份" align="center" min-width="90" />
        <el-table-column prop="batch" label="批次" align="center" min-width="110" />
        <el-table-column prop="groupName" label="文理科/组别" align="center" min-width="120" />
        <el-table-column prop="score" label="录取分数线" align="center" min-width="120" />
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
import { Document, Search } from '@element-plus/icons-vue'
import {
  getControlLinePage,
  getControlLineProvinces,
  getControlLineYears,
  type ControlLineRow
} from '@/api/query'

const provinces = ref<string[]>([])
const years = ref<number[]>([])
const province = ref('河北')
const year = ref(0)

const loading = ref(false)
const list = ref<ControlLineRow[]>([])
const page = ref(1)
const size = ref(20)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value) || 1))

async function loadProvinces() {
  try {
    provinces.value = await getControlLineProvinces()
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
  if (!province.value) return
  try {
    years.value = await getControlLineYears(province.value)
    if (years.value.length) year.value = years.value[0]
  } catch {
    years.value = []
  }
}

async function onProvinceChange() {
  list.value = []
  total.value = 0
  await loadYears()
}

async function load() {
  if (!province.value) {
    ElMessage.warning('请选择省份')
    return
  }
  if (!year.value) {
    ElMessage.warning('请选择年份')
    return
  }
  loading.value = true
  try {
    const r = await getControlLinePage({
      province: province.value,
      year: year.value,
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

onMounted(async () => {
  await loadProvinces()
  await loadYears()
  if (province.value && year.value) await load()
})
</script>

<style scoped lang="scss">
.control-line-page {
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
    gap: 8px 12px;
    .f-label { color: #606266; font-weight: 600; white-space: nowrap; }
  }
  .btn-purple {
    background: #8e44ad;
    border-color: #8e44ad;
    color: #fff;
    margin-left: 4px;
    &:hover { background: #7d3c98; border-color: #7d3c98; color: #fff; }
  }
  .line-table { width: 100%; }
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
