<template>
  <div class="query-tools-page">
    <h2 class="page-title">
      <el-icon style="margin-right:6px"><Search /></el-icon>
      综合查询工具
    </h2>
    <el-breadcrumb separator="/" class="crumb">
      <el-breadcrumb-item>综合查询</el-breadcrumb-item>
      <el-breadcrumb-item>综合查询工具</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="tool-shell">
      <!-- 顶栏操作 -->
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
            >
              <el-option v-for="c in cities" :key="c" :label="c" :value="c" />
            </el-select>
          </template>
          <template v-else-if="mode === 'majorBrowse'">
            <el-select
              v-model="majorCategory"
              placeholder="学科门类"
              clearable
              style="width: 140px"
              @change="onCategoryChange"
            >
              <el-option v-for="c in majorCategories" :key="c" :label="c" :value="c" />
            </el-select>
            <el-select
              v-model="majorDiscipline"
              placeholder="专业类"
              clearable
              filterable
              style="width: 180px"
              :disabled="!majorCategory"
            >
              <el-option v-for="d in majorDisciplines" :key="d" :label="d" :value="d" />
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
          <el-button
            :type="mode === 'majorBrowse' ? 'primary' : 'default'"
            class="btn-major"
            @click="switchMode('majorBrowse')"
          >专业查询</el-button>
        </div>
      </div>

      <div class="tool-search" v-if="mode === 'college'">
        <el-input
          v-model="collegeName"
          placeholder="请输入院校名称"
          clearable
          style="width: 260px"
          @keyup.enter="doCollegeSearch"
        />
        <el-button class="btn-search" @click="doCollegeSearch">搜 索</el-button>
      </div>
      <div class="tool-search" v-else-if="mode === 'majorBrowse'">
        <el-input
          v-model="dictKeyword"
          placeholder="专业名称关键字"
          clearable
          style="width: 220px"
          @keyup.enter="doMajorDictSearch"
        />
        <el-button class="btn-search" @click="doMajorDictSearch">搜 索</el-button>
        <el-button @click="switchMode('college')">返回院校</el-button>
      </div>
      <div class="tool-search" v-else-if="mode === 'majorSearch'">
        <el-button class="btn-search" @click="doMajorSearch">搜 索</el-button>
        <el-button @click="switchMode('college')">返回院校</el-button>
      </div>
      <div class="tool-search" v-else>
        <el-button @click="switchMode('college')">返回院校</el-button>
      </div>

      <div class="tool-tip">注：内部编码不可用于填报</div>
      <div class="tool-divider" />

      <!-- 院校列表 -->
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

      <!-- 专业目录 -->
      <div v-show="mode === 'majorBrowse'" class="major-list" v-loading="loading">
        <div
          v-for="m in majorDictList"
          :key="m.majorCode"
          class="major-row"
          @click="openMajorColleges(m.majorName)"
        >
          <div class="major-name">【{{ m.majorCode }}】{{ m.majorName }}</div>
          <div class="major-meta">{{ m.category }} · {{ m.firstDiscipline }}</div>
        </div>
        <el-empty v-if="!loading && majorDictList.length === 0" description="请选择门类或输入关键字检索" />
      </div>

      <!-- 专业搜索结果 -->
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

      <!-- 职业查询占位 -->
      <div v-show="mode === 'profession'" class="profession-empty">
        <el-empty description="职业数据暂未入库，功能建设中" />
      </div>

      <!-- 底部浮动按钮(对齐参考站) -->
      <div class="float-btns">
        <el-button round @click="switchMode('majorSearch')">专业搜索</el-button>
        <el-button round type="warning" plain @click="switchMode('profession')">职业查询</el-button>
      </div>
    </div>

    <!-- 开设某专业的院校 -->
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

    <!-- 院校详情 -->
    <el-drawer
      v-model="detailVisible"
      size="640px"
      destroy-on-close
      :title="detail?.collegeName || '院校详情'"
    >
      <div v-loading="detailLoading" class="detail-body">
        <template v-if="detail">
          <div class="detail-hero">
            <img v-if="detail.collegeImg" :src="detail.collegeImg" class="detail-logo" alt="" />
            <div class="detail-hero-text">
              <div class="detail-title">{{ detail.collegeName }}</div>
              <div class="detail-sub">
                {{ detail.collegeProvince }} {{ detail.collegeCity }}
                · {{ detail.collegeProperty }} · {{ detail.collegeLevel }} · {{ detail.collegeType }}
              </div>
              <div class="detail-labels" v-if="detail.collegeLabels?.length">
                <el-tag
                  v-for="lb in detail.collegeLabels"
                  :key="lb"
                  size="small"
                  effect="plain"
                  class="lb-tag"
                >{{ lb }}</el-tag>
              </div>
            </div>
          </div>

          <el-descriptions :column="1" border size="small" class="detail-desc">
            <el-descriptions-item label="主管部门">{{ detail.collegeAdmin || '-' }}</el-descriptions-item>
            <el-descriptions-item label="内部编码">{{ detail.collegeCode }}</el-descriptions-item>
            <el-descriptions-item label="建校时间">{{ detail.collegeTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ detail.address || '-' }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ (detail.phone || []).join('、') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ detail.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="官网">
              <a v-if="detail.website" :href="detail.website" target="_blank" rel="noopener">{{ detail.website }}</a>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="招生网">
              <a v-if="detail.recruitWebsite" :href="detail.recruitWebsite" target="_blank" rel="noopener">{{ detail.recruitWebsite }}</a>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>

          <section v-if="detail.collegeInfo" class="detail-sec">
            <h4>院校简介</h4>
            <div class="sec-body" v-html="plainHtml(detail.collegeInfo)" />
          </section>
          <section v-if="detail.advantage" class="detail-sec">
            <h4>优势 / 特色专业</h4>
            <div class="sec-body" v-html="plainHtml(detail.advantage)" />
          </section>
          <section v-if="detail.accommodation" class="detail-sec">
            <h4>住宿餐饮</h4>
            <div class="sec-body" v-html="plainHtml(detail.accommodation)" />
          </section>
          <section v-if="detail.recruitRule" class="detail-sec">
            <h4>招生规则摘要</h4>
            <div class="sec-body" v-html="plainHtml(detail.recruitRule)" />
          </section>
          <section v-if="detail.teachers" class="detail-sec">
            <h4>师资力量</h4>
            <div class="sec-body" v-html="plainHtml(detail.teachers)" />
          </section>
          <section v-if="detail.scholarship" class="detail-sec">
            <h4>奖助学金</h4>
            <div class="sec-body" v-html="plainHtml(detail.scholarship)" />
          </section>
          <section v-if="detail.transferMajor" class="detail-sec">
            <h4>转专业政策</h4>
            <div class="sec-body" v-html="plainHtml(detail.transferMajor)" />
          </section>
          <section v-if="detail.famousAlumni" class="detail-sec">
            <h4>知名校友</h4>
            <div class="sec-body" v-html="plainHtml(detail.famousAlumni)" />
          </section>

          <section class="detail-sec">
            <h4>开设专业</h4>
            <div v-loading="majorsLoading">
              <div v-for="g in majorGroups" :key="g.category" class="major-group">
                <div class="mg-cat">{{ g.category }}</div>
                <div class="mg-list">{{ g.majorText }}</div>
              </div>
              <el-empty v-if="!majorsLoading && majorGroups.length === 0" description="暂无专业数据" :image-size="60" />
            </div>
          </section>
        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getCollegeProvinces,
  getCollegeCities,
  searchColleges,
  getCollegeDetail,
  getCollegeMajors,
  getMajorCategories,
  getMajorDisciplines,
  searchMajorDict,
  searchMajorNames,
  getCollegesByMajor,
  type CollegeListItem,
  type CollegeDetail,
  type CollegeMajorGroup,
  type MajorDictItem,
  type MajorCollegeItem
} from '@/api/college'

type Mode = 'college' | 'majorBrowse' | 'majorSearch' | 'profession'

const mode = ref<Mode>('college')
const loading = ref(false)

const provinces = ref<string[]>([])
const cities = ref<string[]>([])
const province = ref('')
const city = ref('')
const collegeName = ref('')
const colleges = ref<CollegeListItem[]>([])

const majorCategories = ref<string[]>([])
const majorDisciplines = ref<string[]>([])
const majorCategory = ref('')
const majorDiscipline = ref('')
const dictKeyword = ref('')
const majorDictList = ref<MajorDictItem[]>([])

const majorKeyword = ref('')
const majorNameList = ref<string[]>([])

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<CollegeDetail | null>(null)
const majorsLoading = ref(false)
const majorGroups = ref<CollegeMajorGroup[]>([])

const majorCollegesVisible = ref(false)
const majorCollegesLoading = ref(false)
const majorColleges = ref<MajorCollegeItem[]>([])
const activeMajorName = ref('')

onMounted(async () => {
  provinces.value = await getCollegeProvinces()
  await doCollegeSearch()
})

function switchMode(m: Mode) {
  mode.value = m
  if (m === 'majorBrowse' && majorCategories.value.length === 0) {
    getMajorCategories().then(list => { majorCategories.value = list || [] })
  }
  if (m === 'college' && colleges.value.length === 0) {
    doCollegeSearch()
  }
}

async function onProvinceChange() {
  city.value = ''
  cities.value = province.value ? await getCollegeCities(province.value) : []
}

async function doCollegeSearch() {
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

async function onCategoryChange() {
  majorDiscipline.value = ''
  majorDisciplines.value = majorCategory.value
    ? await getMajorDisciplines(majorCategory.value)
    : []
}

async function doMajorDictSearch() {
  if (!majorCategory.value && !dictKeyword.value) {
    ElMessage.warning('请选择学科门类或输入专业关键字')
    return
  }
  loading.value = true
  try {
    majorDictList.value = await searchMajorDict({
      category: majorCategory.value || undefined,
      discipline: majorDiscipline.value || undefined,
      keyword: dictKeyword.value || undefined
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

async function openCollege(code: number) {
  detailVisible.value = true
  detailLoading.value = true
  majorsLoading.value = true
  detail.value = null
  majorGroups.value = []
  try {
    detail.value = await getCollegeDetail(code)
    majorGroups.value = await getCollegeMajors(code) || []
  } finally {
    detailLoading.value = false
    majorsLoading.value = false
  }
}

/** 允许简单 HTML 换行/强调, 去掉脚本 */
function plainHtml(text: string) {
  return (text || '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br/>')
    .replace(/\n/g, '<br/>')
}
</script>

<style scoped lang="scss">
.query-tools-page {
  .page-title {
    font-size: 20px;
    margin: 0 0 8px;
    display: flex;
    align-items: center;
  }
  .crumb { margin-bottom: 16px; }
}

.tool-shell {
  position: relative;
  background: #fff;
  border-radius: 4px;
  padding: 16px 20px 72px;
  min-height: 520px;
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
.btn-major {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
  &:hover { background: #66b1ff; border-color: #66b1ff; color: #fff; }
}

.tool-search {
  margin-top: 14px;
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

.tool-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 13px;
}
.tool-divider {
  margin: 12px 0 0;
  height: 2px;
  background: #e74c3c;
}

.college-list, .major-list {
  max-height: calc(100vh - 320px);
  overflow: auto;
}
.college-row, .major-row {
  padding: 14px 8px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  &:hover { background: #fafafa; }
}
.college-name, .major-name {
  font-size: 15px;
  color: #303133;
}
.college-code, .major-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.float-btns {
  position: absolute;
  right: 20px;
  bottom: 16px;
  display: flex;
  gap: 10px;
}

.detail-body { padding: 0 8px 24px; }
.detail-hero {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}
.detail-logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fff;
}
.detail-title { font-size: 18px; font-weight: 600; }
.detail-sub { margin-top: 6px; color: #606266; font-size: 13px; }
.detail-labels { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
.lb-tag { margin: 0; }
.detail-desc { margin-bottom: 16px; }
.detail-sec {
  margin-top: 16px;
  h4 {
    margin: 0 0 8px;
    font-size: 15px;
    border-left: 3px solid #c45656;
    padding-left: 8px;
  }
  .sec-body {
    color: #606266;
    font-size: 13px;
    line-height: 1.7;
    word-break: break-word;
  }
}
.major-group {
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
  .mg-cat { font-weight: 600; color: #303133; margin-bottom: 4px; }
  .mg-list { color: #606266; font-size: 13px; line-height: 1.6; }
}
.dialog-list { max-height: 420px; }
.profession-empty { padding: 40px 0; }
</style>
