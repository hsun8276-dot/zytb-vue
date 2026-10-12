<template>
  <!-- 院校详情：1:1 对齐源站 :9002/{code} -->
  <CollegeDetailView v-if="detailMode" :code="detailCode" />

  <!-- 职业详情：对齐 :9002/ProfessionPage/{occId} -->
  <ProfessionDetailView v-else-if="professionDetailId > 0" :occ-id="professionDetailId" />

  <!-- 专业查询：1:1 对齐源站 :9002/TransferPage/{groupCode} -->
  <MajorTransferPage
    v-else-if="mode === 'majorBrowse'"
    :initial-group-code="majorGroupCode"
    @go-college="switchMode('college')"
    @go-profession="switchMode('profession')"
    @open-major="openMajorColleges"
    @group-change="onGroupChange"
  />

  <!-- 职业查询：1:1 对齐 :9002/ProfessionSearch -->
  <ProfessionSearch
    v-else-if="mode === 'profession'"
    @go-college="switchMode('college')"
    @go-major="switchMode('majorBrowse')"
    @go-major-search="switchMode('majorSearch')"
    @open-detail="openProfessionDetail"
  />

  <!-- 院校查询 / 专业搜索列表：对齐源站 FirstPage 定宽居中 -->
  <div v-else class="query-tools-page standalone">
    <div class="tool-shell">
      <div class="tool-header">
        <div class="header-left">
          <template v-if="mode === 'college'">
            <el-select
              v-model="province"
              placeholder="选择省份"
              clearable
              filterable
              style="width: 160px"
              @change="onProvinceChange"
            >
              <el-option v-for="p in provinces" :key="p" :label="p" :value="p" />
            </el-select>
            <el-select
              v-model="city"
              placeholder="选择城市"
              clearable
              filterable
              style="width: 160px"
              :disabled="!province"
              @change="doCollegeSearch"
            >
              <el-option v-for="c in cities" :key="c" :label="c" :value="c" />
            </el-select>
          </template>
          <template v-else-if="mode === 'majorSearch'">
            <el-input
              v-model="majorKeyword"
              placeholder="请输入专业名称"
              clearable
              style="width: 220px"
              @keyup.enter="doMajorSearch"
            />
          </template>
        </div>
        <div class="header-right">
          <el-button type="primary" class="btn-major" @click="switchMode('majorBrowse')">专业查询</el-button>
          <el-button
            :type="mode === 'majorSearch' ? 'primary' : 'default'"
            @click="switchMode('majorSearch')"
          >专业搜索</el-button>
        </div>
      </div>

      <div class="tool-search" v-if="mode === 'college'">
        <div class="search-left">
          <el-input
            v-model="collegeName"
            placeholder="请输入院校名称"
            clearable
            style="width: 260px"
            @keyup.enter="doCollegeSearch"
          />
          <el-button class="btn-search" @click="doCollegeSearch">搜 索</el-button>
        </div>
        <el-button type="primary" @click="switchMode('profession')">职业查询</el-button>
      </div>
      <div class="tool-search" v-else-if="mode === 'majorSearch'">
        <div class="search-left">
          <el-button class="btn-search" @click="doMajorSearch">搜 索</el-button>
          <el-button @click="switchMode('college')">返回院校</el-button>
        </div>
        <el-button type="primary" @click="switchMode('profession')">职业查询</el-button>
      </div>

      <div class="tool-badge-row">
        <div class="tool-badge">{{ mode === 'college' ? '查询院校' : '查询专业' }}</div>
        <div class="tool-tip">注：内部编码不可用于填报</div>
      </div>

      <div v-show="mode === 'college'" class="college-list" v-loading="loading">
        <div
          v-for="item in colleges"
          :key="item.collegeCode"
          class="college-row"
          @click="openCollege(item.collegeCode)"
        >
          <div class="college-name">{{ item.collegeName }}</div>
          <div class="college-code">内部编码：{{ item.collegeCode }}</div>
        </div>
        <el-empty v-if="!loading && colleges.length === 0" description="无数据" />
      </div>

      <div v-show="mode === 'majorSearch'" class="major-list" v-loading="loading">
        <div
          v-for="name in majorNameList"
          :key="name"
          class="major-row"
          @click="openMajorColleges(name)"
        >
          <div class="major-name">{{ name }}</div>
        </div>
        <el-empty v-if="!loading && majorNameList.length === 0" description="请输入专业名称搜索" />
      </div>
    </div>
  </div>

  <el-dialog
    v-model="majorCollegesVisible"
    :title="`开设「${activeMajorName}」的院校`"
    width="640px"
    destroy-on-close
  >
    <div class="college-list dialog-list" v-loading="majorCollegesLoading">
      <div
        v-for="item in majorColleges"
        :key="item.collegeCode"
        class="college-row"
        @click="openCollege(item.collegeCode); majorCollegesVisible = false"
      >
        <div class="college-name">{{ item.collegeName }}</div>
        <div class="college-code">
          {{ item.province }} {{ item.city }} · 内部编码：{{ item.collegeCode }}
        </div>
      </div>
      <el-empty v-if="!majorCollegesLoading && majorColleges.length === 0" description="暂无院校开设该专业" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CollegeDetailView from './CollegeDetailView.vue'
import MajorTransferPage from './MajorTransferPage.vue'
import ProfessionSearch from './ProfessionSearch.vue'
import ProfessionDetailView from './ProfessionDetailView.vue'
import {
  getCollegeProvinces,
  getCollegeCities,
  searchColleges,
  searchMajorNames,
  getCollegesByMajor,
  type CollegeListItem,
  type MajorCollegeItem
} from '@/api/college'

type Mode = 'college' | 'majorBrowse' | 'majorSearch' | 'profession'

const route = useRoute()
const router = useRouter()

const detailCode = computed(() => {
  if (route.name === 'QueryToolsMajors' || route.name === 'QueryToolsProfessions'
      || route.name === 'QueryToolsProfessionDetail') return 0
  const n = Number(route.params.code)
  return Number.isFinite(n) && n > 0 ? n : 0
})
const detailMode = computed(() => detailCode.value > 0)

const professionDetailId = computed(() => {
  if (route.name !== 'QueryToolsProfessionDetail') return 0
  const n = Number(route.params.occId)
  return Number.isFinite(n) && n > 0 ? n : 0
})

const mode = ref<Mode>('college')
const loading = ref(false)
const majorGroupCode = ref('0101')

const provinces = ref<string[]>([])
const cities = ref<string[]>([])
const province = ref('')
const city = ref('')
const collegeName = ref('')
const colleges = ref<CollegeListItem[]>([])

const majorKeyword = ref('')
const majorNameList = ref<string[]>([])

const majorCollegesVisible = ref(false)
const majorCollegesLoading = ref(false)
const majorColleges = ref<MajorCollegeItem[]>([])
const activeMajorName = ref('')

function syncModeFromRoute() {
  if (route.name === 'QueryToolsMajors') {
    mode.value = 'majorBrowse'
    majorGroupCode.value = String(route.params.groupCode || '0101') || '0101'
    document.title = '专业查询'
    return
  }
  if (route.name === 'QueryToolsProfessions' || route.name === 'QueryToolsProfessionDetail') {
    mode.value = 'profession'
    if (route.name === 'QueryToolsProfessions') document.title = '职业查询'
    return
  }
  if (detailMode.value) return
}

onMounted(async () => {
  syncModeFromRoute()
  if (detailMode.value || professionDetailId.value > 0
      || mode.value === 'majorBrowse' || mode.value === 'profession') return
  document.title = '院校查询'
  try {
    provinces.value = await getCollegeProvinces() || []
  } catch {
    provinces.value = []
  }
  await doCollegeSearch(true)
})

watch(() => route.fullPath, () => {
  syncModeFromRoute()
})

function switchMode(m: Mode) {
  mode.value = m
  if (m === 'majorBrowse') {
    router.push(`/query-tools/majors/${majorGroupCode.value || '0101'}`)
    return
  }
  if (m === 'profession') {
    router.push('/query-tools/professions')
    return
  }
  if (route.name === 'QueryToolsMajors' || route.name === 'QueryToolsProfessions'
      || route.name === 'QueryToolsProfessionDetail') {
    router.push('/query-tools')
  }
  if (m === 'college') {
    document.title = '院校查询'
    if (colleges.value.length === 0) doCollegeSearch(true)
  } else if (m === 'majorSearch') {
    document.title = '专业搜索'
  }
}

function onGroupChange(code: string) {
  majorGroupCode.value = code
  if (route.name === 'QueryToolsMajors' && String(route.params.groupCode) !== code) {
    router.replace(`/query-tools/majors/${code}`)
  }
}

function openProfessionDetail(occId: number) {
  router.push(`/query-tools/professions/${occId}`)
}

async function onProvinceChange() {
  city.value = ''
  cities.value = province.value ? await getCollegeCities(province.value) : []
  await doCollegeSearch(true)
}

async function doCollegeSearch(allowEmpty = false) {
  if (!allowEmpty && !province.value && !city.value && !collegeName.value.trim()) {
    ElMessage.warning('请先选择省份或输入院校名称')
    return
  }
  loading.value = true
  try {
    colleges.value = await searchColleges({
      province: province.value || undefined,
      city: city.value || undefined,
      name: collegeName.value || undefined
    }) || []
  } finally {
    loading.value = false
  }
}

async function doMajorSearch() {
  if (!majorKeyword.value.trim()) {
    ElMessage.warning('请输入专业名称')
    return
  }
  loading.value = true
  try {
    majorNameList.value = await searchMajorNames(majorKeyword.value.trim()) || []
  } finally {
    loading.value = false
  }
}

async function openMajorColleges(majorName: string) {
  activeMajorName.value = majorName
  majorCollegesVisible.value = true
  majorCollegesLoading.value = true
  try {
    majorColleges.value = await getCollegesByMajor(majorName) || []
  } finally {
    majorCollegesLoading.value = false
  }
}

function openCollege(code: number) {
  window.open(`/query-tools/${code}`, '_blank', 'noopener')
}
</script>

<style scoped lang="scss">
.query-tools-page.standalone {
  min-height: 100vh;
  background: #fff;
  /* 对齐源站 FirstPageBackground：纵向 flex + 水平居中 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tool-shell {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 18px 24px 24px;
  box-sizing: border-box;
  min-height: 100vh;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.header-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.header-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.btn-major {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
  &:hover { background: #66b1ff; border-color: #66b1ff; color: #fff; }
}

.tool-search {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.search-left {
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

.tool-badge-row {
  margin-top: 18px;
  display: flex;
  align-items: flex-end;
  gap: 14px;
  border-bottom: 2px solid #cd3532;
}
.tool-badge {
  background: #cd3532;
  color: #fff;
  font-size: 16px;
  padding: 6px 22px 6px 10px;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
  line-height: 1.2;
  white-space: nowrap;
  position: relative;
  top: 1px;
}
.tool-tip {
  color: #909399;
  font-size: 13px;
  padding-bottom: 6px;
}

.college-list, .major-list {
  max-height: calc(100vh - 220px);
  overflow: auto;
}
.college-row, .major-row {
  padding: 14px 8px;
  border-bottom: 1px solid #d4d8e1;
  cursor: pointer;
  &:hover { background: #fafafa; }
}
.college-name, .major-name {
  font-size: 16px;
  color: #303133;
}
.college-code, .major-meta {
  margin-top: 4px;
  font-size: 14px;
  color: #606266;
}
</style>

<style lang="scss">
.college-list.dialog-list {
  max-height: 420px;
  overflow: auto;
  .college-row {
    padding: 14px 8px;
    border-bottom: 1px solid #d4d8e1;
    cursor: pointer;
    &:hover { background: #fafafa; }
  }
  .college-name { font-size: 16px; color: #303133; }
  .college-code { margin-top: 4px; font-size: 14px; color: #606266; }
}
</style>
