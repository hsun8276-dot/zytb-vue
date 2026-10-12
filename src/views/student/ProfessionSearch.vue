<template>
  <div class="profession-search-page">
    <!-- 对齐源站：中间定宽内容区，左右留白居中 -->
    <div class="ps-shell">
      <div class="ps-header">
        <div class="ps-filters">
          <el-select
            v-model="industry"
            placeholder="选择行业"
            clearable
            filterable
            style="width: 200px"
            @change="onIndustryChange"
          >
            <el-option v-for="i in industries" :key="i" :label="i" :value="i" />
          </el-select>
          <el-select
            v-model="occType"
            placeholder="选择职业类别"
            clearable
            filterable
            style="width: 200px"
            :disabled="!industry"
            @change="doSearch"
          >
            <el-option v-for="t in occTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </div>
        <div class="ps-nav">
          <el-button type="primary" @click="emit('go-major')">专业查询</el-button>
          <el-button type="primary" @click="emit('go-major-search')">专业搜索</el-button>
        </div>
      </div>

      <div class="ps-search-row">
        <div class="ps-search-left">
          <el-input
            v-model="occName"
            placeholder="请输入职业名称"
            clearable
            style="width: 260px"
            @keyup.enter="doSearch"
          />
          <el-button class="btn-search" @click="doSearch">搜 索</el-button>
        </div>
        <el-button type="primary" class="deepBlueBtn" @click="emit('go-college')">院校查询</el-button>
      </div>

      <div class="ps-badge-row">
        <div class="ps-badge">查询职业</div>
      </div>

      <div class="ps-list" v-loading="loading">
        <div
          v-for="item in list"
          :key="item.occId"
          class="collegesContainer"
          @click="openDetail(item.occId)"
        >
          <div class="collegesLine1">{{ item.occName }}</div>
          <div class="collegesLine2">
            <div class="col">行业：{{ item.industry }}</div>
            <div class="col">职业类别：{{ item.occType }}</div>
            <div class="col">岗位薪资：{{ item.positionSalary }}</div>
          </div>
        </div>
        <el-empty v-if="!loading && list.length === 0" description="无数据" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getProfessionIndustries,
  getProfessionTypes,
  searchProfessions,
  type ProfessionListItem
} from '@/api/college'

const emit = defineEmits<{
  (e: 'go-college'): void
  (e: 'go-major'): void
  (e: 'go-major-search'): void
  (e: 'open-detail', occId: number): void
}>()

const industries = ref<string[]>([])
const occTypes = ref<string[]>([])
const industry = ref('')
const occType = ref('')
const occName = ref('')
const list = ref<ProfessionListItem[]>([])
const loading = ref(false)

onMounted(async () => {
  document.title = '职业查询'
  try {
    industries.value = await getProfessionIndustries() || []
  } catch {
    industries.value = []
  }
  await doSearch()
})

async function onIndustryChange() {
  occType.value = ''
  occTypes.value = industry.value ? await getProfessionTypes(industry.value) || [] : []
  await doSearch()
}

async function doSearch() {
  loading.value = true
  try {
    list.value = await searchProfessions({
      industry: industry.value || undefined,
      occType: occType.value || undefined,
      occName: occName.value.trim() || undefined
    }) || []
  } finally {
    loading.value = false
  }
}

function openDetail(occId: number) {
  emit('open-detail', occId)
}
</script>

<style scoped lang="scss">
.profession-search-page {
  min-height: 100vh;
  background: #fff;
  color: #303133;
  display: flex;
  justify-content: center;
}
.ps-shell {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 18px 24px 24px;
  box-sizing: border-box;
}

.ps-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.ps-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.ps-nav {
  display: flex;
  gap: 8px;
}

.ps-search-row {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.ps-search-left {
  display: flex;
  gap: 10px;
  align-items: center;
}
.btn-search {
  background: #c45656;
  border-color: #c45656;
  color: #fff;
  min-width: 72px;
  &:hover { background: #d47474; border-color: #d47474; color: #fff; }
}
.deepBlueBtn {
  background: #266fff;
  border-color: #266fff;
  &:hover { background: #4d8aff; border-color: #4d8aff; }
}

.ps-badge-row {
  margin-top: 18px;
  border-bottom: 2px solid #cd3532;
  line-height: 0;
}
.ps-badge {
  display: inline-block;
  background: #cd3532;
  color: #fff;
  font-size: 16px;
  padding: 6px 22px 6px 10px;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
  line-height: 1.2;
  position: relative;
  top: 1px;
}

.ps-list {
  margin-top: 4px;
  max-height: calc(100vh - 200px);
  overflow: auto;
}
.collegesContainer {
  padding: 12px 4px;
  border-bottom: 1px solid #d4d8e1;
  cursor: pointer;
  &:hover { background: #fafafa; }
}
.collegesLine1 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 6px;
}
.collegesLine2 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  width: 100%;
  font-size: 14px;
  color: #606266;
  .col {
    min-width: 0;
    padding-right: 12px;
    word-break: break-all;
  }
}
</style>
