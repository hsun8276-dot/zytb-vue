<template>
  <div class="profession-detail-page" v-loading="loading">
    <div id="MajorPageBackground" class="page-bg" v-if="detail">
      <div id="header" class="pd-header">
        <div id="headerMainContainer" class="header-main">
          <div id="headerLine1">
            <div id="majorName" class="occ-name">{{ detail.occName }}</div>
          </div>
          <div id="headerLine2" class="occ-meta">
            行业:{{ detail.industry }} | 职业类别:{{ detail.occType }} | 岗位薪资:{{ detail.positionSalary }}
          </div>
        </div>
        <el-tabs v-model="activeTab" class="bigElTabs">
          <el-tab-pane label="职业概况" name="overview" />
          <el-tab-pane label="匹配专业" name="majors" />
        </el-tabs>
      </div>

      <div id="mainBody" class="main-body">
        <template v-if="activeTab === 'overview'">
          <div
            v-for="sec in overviewSections"
            :key="sec.title"
            class="section-block"
          >
            <div class="leftTitlt">
              <div class="redLine1" />
              <div class="redLine2" />
              {{ sec.title }}
            </div>
            <div class="greyBackgroundContainer">
              <div class="greyBackgroundText">{{ sec.text || '暂无' }}</div>
            </div>
          </div>
          <div class="footer-note">
            <div class="footer-title">系统使用说明</div>
            <ol>
              <li>本查询系统数据来源于教育部官网、阳光高考、各省教育考试院、各院校官网及招生就业网等，数据仅供参考，具体以官方最新公布为准。</li>
              <li>本站数据未经授权严禁转载，违者将依法追究责任。</li>
            </ol>
          </div>
        </template>

        <template v-else>
          <div class="majors-grid" v-loading="majorsLoading">
            <div v-for="m in majors" :key="m.majorCode || m.majorName" class="major-card">
              <div class="major-name">{{ m.majorName }}</div>
              <div class="major-meta">
                国标代码: {{ m.majorCode || '—' }} | 专业年限: {{ m.duration || '—' }} | 授予学位: {{ m.bachelor || '—' }}
              </div>
            </div>
            <el-empty v-if="!majorsLoading && majors.length === 0" description="暂无匹配专业" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  getProfessionDetail,
  getProfessionMajors,
  type ProfessionDetail,
  type ProfessionMajorItem
} from '@/api/college'

const props = defineProps<{ occId: number }>()

const loading = ref(false)
const majorsLoading = ref(false)
const detail = ref<ProfessionDetail | null>(null)
const majors = ref<ProfessionMajorItem[]>([])
const activeTab = ref('overview')
const majorsLoaded = ref(false)

const overviewSections = computed(() => {
  const d = detail.value
  if (!d) return []
  return [
    { title: '岗位定义', text: d.definition },
    { title: '职业介绍', text: d.occIntroduction },
    { title: '职业特点', text: d.occTrait },
    { title: '工作联系', text: d.workContact },
    { title: '任职条件', text: d.jobRequire },
    { title: '发展空间', text: d.developmentSpace }
  ]
})

onMounted(() => loadDetail())
watch(() => props.occId, () => {
  majorsLoaded.value = false
  majors.value = []
  activeTab.value = 'overview'
  loadDetail()
})
watch(activeTab, (t) => {
  if (t === 'majors' && !majorsLoaded.value) loadMajors()
})

async function loadDetail() {
  if (!props.occId) return
  loading.value = true
  document.title = '职业详情'
  try {
    detail.value = await getProfessionDetail(props.occId)
    if (detail.value?.occName) document.title = detail.value.occName
  } finally {
    loading.value = false
  }
}

async function loadMajors() {
  majorsLoading.value = true
  try {
    majors.value = await getProfessionMajors(props.occId) || []
    majorsLoaded.value = true
  } finally {
    majorsLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.profession-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}
.page-bg {
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
}

.pd-header {
  border-bottom: 1px solid #e4e7ed;
}
.header-main {
  background: #fbf1f0;
  padding: 20px 24px 12px;
}
.occ-name {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.3;
}
.occ-meta {
  margin-top: 10px;
  font-size: 15px;
  color: #606266;
}

.bigElTabs {
  :deep(.el-tabs__header) {
    margin: 0;
    background: #2b2b2b;
  }
  :deep(.el-tabs__nav-wrap::after) { display: none; }
  :deep(.el-tabs__item) {
    color: #c0c4cc;
    height: 44px;
    line-height: 44px;
    padding: 0 28px !important;
    font-size: 15px;
  }
  :deep(.el-tabs__item.is-active) {
    color: #fff !important;
    background: #cd3532;
  }
  :deep(.el-tabs__active-bar) { display: none; }
  :deep(.el-tabs__content) { display: none; }
}

.main-body {
  padding: 18px 24px 40px;
  background: #faf6f6;
  min-height: calc(100vh - 160px);
}

.section-block { margin-bottom: 18px; }
.leftTitlt {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}
.redLine1, .redLine2 {
  width: 4px;
  height: 16px;
  background: #cd3532;
}
.redLine2 { opacity: 0.55; }
.greyBackgroundContainer {
  background: #ececec;
  padding: 14px 16px;
  border-radius: 2px;
}
.greyBackgroundText {
  font-size: 14px;
  line-height: 1.8;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-word;
}

.majors-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 32px;
}
.major-card {
  padding: 14px 4px;
  border-bottom: 1px solid #d4d8e1;
}
.major-name {
  font-size: 16px;
  color: #303133;
  margin-bottom: 6px;
}
.major-meta {
  font-size: 13px;
  color: #909399;
}

.footer-note {
  margin-top: 36px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  color: #909399;
  font-size: 13px;
  line-height: 1.7;
  .footer-title {
    font-size: 15px;
    color: #606266;
    margin-bottom: 8px;
    font-weight: 600;
  }
  ol { padding-left: 18px; margin: 0; }
}

@media (max-width: 768px) {
  .majors-grid { grid-template-columns: 1fr; }
}
</style>
