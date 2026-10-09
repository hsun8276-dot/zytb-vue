<template>
  <div>
    <h2 class="page-title">院校管理</h2>

    <el-card shadow="never">
      <div class="filter-row">
        <el-select v-model="province" clearable placeholder="省份" style="width:130px" @change="onProvinceChange">
          <el-option v-for="p in provinces" :key="p" :label="p" :value="p" />
        </el-select>
        <el-select v-model="city" clearable placeholder="城市" style="width:130px;margin-left:8px" :disabled="!province" @change="search">
          <el-option v-for="c in cities" :key="c" :label="c" :value="c" />
        </el-select>
        <el-select v-model="level" clearable placeholder="层次" style="width:120px;margin-left:8px" @change="search">
          <el-option v-for="v in levels" :key="v" :label="v" :value="v" />
        </el-select>
        <el-select v-model="collegeType" clearable placeholder="类型" style="width:120px;margin-left:8px" @change="search">
          <el-option v-for="v in collegeTypes" :key="v" :label="v" :value="v" />
        </el-select>
        <el-select v-model="property" clearable placeholder="性质" style="width:120px;margin-left:8px" @change="search">
          <el-option v-for="v in properties" :key="v" :label="v" :value="v" />
        </el-select>
        <el-input
          v-model="keyword"
          placeholder="校名 / 内部编码"
          clearable
          style="width:200px;margin-left:8px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-button type="primary" style="margin-left:8px" @click="search">检索</el-button>
      </div>

      <el-table :data="list" stripe v-loading="loading" style="width:100%">
        <el-table-column prop="collegeCode" label="内部编码" width="100" />
        <el-table-column label="院校名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="openDetail(row)">{{ row.collegeName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="province" label="省份" width="90" />
        <el-table-column prop="city" label="城市" width="110" />
        <el-table-column prop="level" label="层次" width="90" />
        <el-table-column prop="collegeType" label="类型" width="90" />
        <el-table-column prop="property" label="性质" width="90" />
        <el-table-column label="硕/博" width="90">
          <template #default="{ row }">
            <span>{{ row.hasMaster ? '硕' : '-' }} / {{ row.hasDoctor ? '博' : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="主管部门" min-width="140" show-overflow-tooltip />
      </el-table>

      <el-pagination
        v-if="total > 0"
        style="margin-top:14px;justify-content:flex-end"
        background
        layout="total, prev, pager, next, sizes"
        :total="total"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        v-model:current-page="page"
        @current-change="load"
        @size-change="() => { page = 1; load() }"
      />
    </el-card>

    <el-drawer v-model="detailVisible" size="480px" :title="detail?.collegeName || '院校详情'">
      <template v-if="detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="内部编码">{{ detail.collegeCode }}</el-descriptions-item>
          <el-descriptions-item label="省份/城市">{{ detail.collegeProvince }} {{ detail.collegeCity }}</el-descriptions-item>
          <el-descriptions-item label="层次">{{ detail.collegeLevel }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ detail.collegeType }}</el-descriptions-item>
          <el-descriptions-item label="性质">{{ detail.collegeProperty }}</el-descriptions-item>
          <el-descriptions-item label="主管部门">{{ detail.collegeAdmin }}</el-descriptions-item>
          <el-descriptions-item label="硕博点">
            {{ detail.hasMaster ? '有硕士点' : '无硕士点' }} /
            {{ detail.hasDoctor ? '有博士点' : '无博士点' }}
          </el-descriptions-item>
          <el-descriptions-item label="官网">
            <el-link v-if="detail.website" :href="detail.website" target="_blank" type="primary">{{ detail.website }}</el-link>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="标签">{{ (detail.collegeLabels || []).join('、') || '-' }}</el-descriptions-item>
        </el-descriptions>
        <p class="drawer-tip">内部编码仅供系统检索，不可用于志愿填报。填报院校代号以当年招生计划为准。</p>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminCollegeFilters, getAdminCollegePage } from '@/api/admin'
import type { AdminCollegeRow } from '@/api/admin'
import { getCollegeCities, getCollegeDetail, getCollegeProvinces } from '@/api/college'
import type { CollegeDetail } from '@/api/college'

const loading = ref(false)
const list = ref<AdminCollegeRow[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const province = ref('')
const city = ref('')
const level = ref('')
const collegeType = ref('')
const property = ref('')
const provinces = ref<string[]>([])
const cities = ref<string[]>([])
const levels = ref<string[]>([])
const collegeTypes = ref<string[]>([])
const properties = ref<string[]>([])

const detailVisible = ref(false)
const detail = ref<CollegeDetail | null>(null)

function search() {
  page.value = 1
  load()
}

async function onProvinceChange() {
  city.value = ''
  cities.value = []
  if (province.value) {
    try {
      cities.value = await getCollegeCities(province.value)
    } catch {
      cities.value = []
    }
  }
  search()
}

async function load() {
  loading.value = true
  try {
    const r = await getAdminCollegePage({
      page: page.value,
      size: pageSize.value,
      province: province.value || undefined,
      city: city.value || undefined,
      keyword: keyword.value || undefined,
      level: level.value || undefined,
      collegeType: collegeType.value || undefined,
      property: property.value || undefined
    })
    list.value = r.records
    total.value = r.total
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function openDetail(row: AdminCollegeRow) {
  detailVisible.value = true
  detail.value = null
  try {
    detail.value = await getCollegeDetail(row.collegeCode)
  } catch (e: any) {
    ElMessage.error(e.message || '加载详情失败')
  }
}

onMounted(async () => {
  try {
    provinces.value = await getCollegeProvinces()
  } catch {
    provinces.value = []
  }
  try {
    const f = await getAdminCollegeFilters()
    levels.value = f.levels || []
    collegeTypes.value = f.collegeTypes || []
    properties.value = f.properties || []
  } catch {
    levels.value = []
    collegeTypes.value = []
    properties.value = []
  }
  load()
})
</script>

<style scoped lang="scss">
.page-title {
  font-size: 20px;
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  row-gap: 8px;
  margin-bottom: 14px;
}

.drawer-tip {
  margin-top: 16px;
  color: #999;
  font-size: 12px;
  line-height: 1.6;
}
</style>
