<template>
  <div class="query-recruit-page">
    <h2 class="page-title">
      <el-icon style="margin-right:6px"><School /></el-icon>
      高校录取数据查询（3+1+2）
    </h2>
    <el-breadcrumb separator="/" class="crumb">
      <el-breadcrumb-item>综合查询</el-breadcrumb-item>
      <el-breadcrumb-item>高校录取数据查询（3+1+2）</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never">
      <div class="filter-row">
        <span class="f-label">考生省份：</span>
        <el-select v-model="q.province" style="width: 110px">
          <el-option label="河北" value="河北" />
        </el-select>
        <span class="f-label">年份：</span>
        <el-input :model-value="String(q.year)" disabled style="width: 90px" />
        <span class="f-label">组别：</span>
        <el-select v-model="q.groupName" style="width: 110px">
          <el-option label="物理组" value="物理组" />
          <el-option label="历史组" value="历史组" />
        </el-select>
        <span class="f-label">批次：</span>
        <el-select v-model="q.batch" style="width: 110px">
          <el-option label="本科批" value="本科批" />
          <el-option label="专科批" value="专科批" />
        </el-select>
        <el-button class="btn-purple" @click="search">
          <el-icon><Search /></el-icon>&nbsp;检索
        </el-button>
      </div>
      <div class="filter-row">
        <span class="f-label">高校省份：</span>
        <el-input v-model="q.unvProvince" clearable style="width: 140px" @keyup.enter="search" />
        <span class="f-label">高校城市：</span>
        <el-input v-model="q.unvCity" clearable style="width: 140px" @keyup.enter="search" />
        <span class="f-label">高校名称：</span>
        <el-input v-model="q.unvName" clearable style="width: 180px" @keyup.enter="search" />
        <span class="f-label">包含专业：</span>
        <el-input v-model="q.majorName" clearable style="width: 180px" @keyup.enter="search" />
      </div>

      <el-table
        :data="list"
        v-loading="loading"
        stripe
        row-key="uabId"
        class="univ-table"
        @expand-change="onExpand"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="major-panel">
              <div class="major-tab">所有专业</div>
              <div class="major-search">
                <el-input
                  v-model="majorKw[row.uabId]"
                  placeholder="请输入检索条件..."
                  clearable
                  style="width: 260px"
                  @keyup.enter="loadMajors(row.uabId, true)"
                />
                <el-button class="btn-purple" size="small" @click="loadMajors(row.uabId, true)">搜索</el-button>
                <el-button size="small" @click="clearMajorKw(row.uabId)">清除</el-button>
              </div>
              <el-table
                :data="majors[row.uabId] || []"
                v-loading="majorLoading[row.uabId]"
                size="small"
                border
                class="major-table"
              >
                <el-table-column label="专业名称" min-width="220">
                  <template #default="{ row: m }">
                    <el-link type="primary" :underline="false" @click="openMajor(m.recruitMajorId, row)">
                      【{{ m.recruitMajorCode }}】{{ m.majorName }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column prop="schoolLength" label="学制" width="70" align="center" />
                <el-table-column prop="tuition" label="学费" width="90" align="right" />
                <el-table-column label="招生计划" width="90" align="right">
                  <template #default="{ row: m }">
                    <span class="plan-green">{{ m.majorPlan ?? '' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="requiredSubjects" label="选科要求" width="110" />
                <el-table-column label="专业排名" width="90" align="right">
                  <template #default="{ row: m }">
                    <span class="rank-blue">{{ m.majorRank ?? '' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="majorGrade" label="专业等级" width="90" align="center" />
                <el-table-column prop="planExplain" label="专业说明" min-width="160" show-overflow-tooltip />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="unvCode" label="院校代码" width="100" align="center" />
        <el-table-column label="院校名称" min-width="220">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="openUnv(row.uabId)">{{ row.unvName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="unvProvince" label="省份" width="90" />
        <el-table-column prop="unvCity" label="城市" width="110" />
        <el-table-column prop="planTotal" label="招生计划" width="100" align="right" />
        <el-table-column prop="batch" label="批次" width="90" />
        <el-table-column prop="groupName" label="组别" width="90" />
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

    <el-dialog v-model="unvVisible" title="院校明细信息" width="92%" top="4vh" destroy-on-close class="gx-dialog">
      <div class="gx" style="max-height:78vh;overflow:auto">
        <UnvDetailPanel v-if="unvVisible && unvId" :uab-id="unvId" />
      </div>
    </el-dialog>
    <el-dialog v-model="majorVisible" title="专业明细信息" width="92%" top="4vh" destroy-on-close class="gx-dialog">
      <div class="gx" style="max-height:78vh;overflow:auto">
        <MajorDetailPanel v-if="majorVisible && majorId" :rid="majorId" :province="majorProvince" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { School, Search } from '@element-plus/icons-vue'
import '@/views/fill/styles/gx.scss'
import {
  getRecruitUnivMajors,
  getRecruitUnivPage,
  type RecruitMajorRow,
  type RecruitUnivRow
} from '@/api/query'
import UnvDetailPanel from '@/views/fill/components/UnvDetailPanel.vue'
import MajorDetailPanel from '@/views/fill/components/MajorDetailPanel.vue'

const q = reactive({
  province: '河北',
  year: 2026,
  groupName: '物理组',
  batch: '本科批',
  unvProvince: '',
  unvCity: '',
  unvName: '',
  majorName: ''
})

const loading = ref(false)
const list = ref<RecruitUnivRow[]>([])
const page = ref(1)
const size = ref(10)
const total = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))

const majors = reactive<Record<string, RecruitMajorRow[]>>({})
const majorLoading = reactive<Record<string, boolean>>({})
const majorKw = reactive<Record<string, string>>({})
const loaded = new Set<string>()

const unvVisible = ref(false)
const unvId = ref('')
const majorVisible = ref(false)
const majorId = ref('')
const majorProvince = ref('河北')

async function load() {
  loading.value = true
  try {
    const r = await getRecruitUnivPage({
      province: q.province,
      year: q.year,
      batch: q.batch,
      groupName: q.groupName,
      unvProvince: q.unvProvince.trim() || undefined,
      unvCity: q.unvCity.trim() || undefined,
      unvName: q.unvName.trim() || undefined,
      majorName: q.majorName.trim() || undefined,
      page: page.value,
      size: size.value
    })
    list.value = r.records
    total.value = r.total
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  loaded.clear()
  load()
}

function onSizeChange() {
  page.value = 1
  load()
}

async function onExpand(row: RecruitUnivRow, expanded: RecruitUnivRow[]) {
  const open = expanded.some(r => r.uabId === row.uabId)
  if (open) await loadMajors(row.uabId, false)
}

async function loadMajors(uabId: string, force: boolean) {
  if (!force && loaded.has(uabId) && !majorKw[uabId]) return
  majorLoading[uabId] = true
  try {
    majors[uabId] = await getRecruitUnivMajors(uabId, majorKw[uabId] || undefined)
    if (!(majorKw[uabId] || '').trim()) loaded.add(uabId)
  } catch (e: any) {
    ElMessage.error(e.message || '加载专业失败')
  } finally {
    majorLoading[uabId] = false
  }
}

function clearMajorKw(uabId: string) {
  majorKw[uabId] = ''
  loaded.delete(uabId)
  loadMajors(uabId, true)
}

function openUnv(uabId: string) {
  unvId.value = uabId
  unvVisible.value = true
}

function openMajor(rid: string, row: RecruitUnivRow) {
  majorId.value = rid
  majorProvince.value = row.examProvince || q.province
  majorVisible.value = true
}

onMounted(load)
</script>

<style scoped lang="scss">
.query-recruit-page {
  .page-title {
    display: flex;
    align-items: center;
    font-size: 20px;
    margin: 0 0 8px;
  }
  .crumb { margin-bottom: 14px; }
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 10px;
    margin-bottom: 12px;
    .f-label { color: #606266; font-weight: 600; white-space: nowrap; }
  }
  .btn-purple {
    background: #8e44ad;
    border-color: #8e44ad;
    color: #fff;
    &:hover { background: #7d3c98; border-color: #7d3c98; color: #fff; }
  }
  .univ-table { width: 100%; }
  .major-panel {
    padding: 8px 12px 12px 36px;
    background: #fafafa;
  }
  .major-tab {
    display: inline-block;
    background: #f1c40f;
    color: #333;
    font-weight: 700;
    padding: 4px 14px;
    border-radius: 4px 4px 0 0;
    margin-bottom: 8px;
  }
  .major-search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .plan-green { color: #27ae60; font-weight: 600; }
  .rank-blue { color: #3498db; }
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
