<template>
  <div id="TransferPageBackground" class="transfer-page">
    <div id="transferInfo" class="transfer-info">
      <aside id="leftMenuContainer" class="left-menu">
        <div id="rowMenuContainer" class="row-menu">
          <el-menu
            mode="horizontal"
            :ellipsis="false"
            :default-active="String(level)"
            @select="onLevelSelect"
          >
            <el-menu-item v-for="lv in levels" :key="lv.id" :index="String(lv.id)">
              {{ lv.name }}
            </el-menu-item>
          </el-menu>
        </div>
        <div id="collMenuContainer" class="coll-menu" v-loading="treeLoading">
          <el-menu
            :key="`tree-${level}-${activeGroupCode}-${openedCategories.join('|')}`"
            class="el-menu-vertical-demo"
            :default-active="activeGroupCode"
            :default-openeds="openedCategories"
            @open="onCategoryOpen"
            @select="onGroupSelect"
          >
            <el-sub-menu
              v-for="cat in tree"
              :key="cat.category"
              :index="cat.category"
            >
              <template #title>
                <span id="discipline">{{ cat.category }}</span>
              </template>
              <el-menu-item
                v-for="g in cat.groups"
                :key="g.code"
                :index="g.code"
              >
                {{ g.name }}
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
      </aside>

      <section id="rightInfoContainer" class="right-info">
        <div id="header" class="right-header">
          <div id="headerMainContainer" class="header-main">
            <div id="headerLine1" class="header-line1">
              <div id="majorName" class="major-name-row">
                <span>{{ groupDetail?.majorGroup || '—' }}</span>
                <el-button id="collegeInquireBtn" type="primary" @click="emit('go-college')">
                  院校查询
                </el-button>
              </div>
            </div>
            <div id="headerLine2" class="header-line2">
              <span>国标代码 {{ groupDetail?.groupCode || '—' }}(不可用于填报)</span>
              <el-button class="deepBlueBtn" type="primary" @click="emit('go-profession')">
                职业查询
              </el-button>
            </div>
          </div>
          <!-- 独立占位行，避免红标盖住国标代码 -->
          <div class="header-tab-row">
            <div id="menuContainer" class="include-badge">包含专业</div>
          </div>
        </div>

        <div id="mainBody" class="main-body" v-loading="detailLoading">
          <div id="IncludingMajors" class="including-majors">
            <div
              v-for="m in groupDetail?.majors || []"
              :key="m.majorCode"
              class="majorsContainer"
              @click="emit('open-major', m.majorName)"
            >
              <div class="majorsLine1"><span>{{ m.majorName }}</span></div>
              <div class="majorsLine2">国标代码：{{ m.majorCode }}</div>
            </div>
            <el-empty
              v-if="!detailLoading && (!groupDetail?.majors || groupDetail.majors.length === 0)"
              description="暂无专业"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import {
  getMajorLevels,
  getMajorTree,
  getMajorsByGroup,
  type MajorGroupDetail,
  type MajorLevelItem,
  type MajorTreeCategory
} from '@/api/college'

const props = withDefaults(defineProps<{
  initialGroupCode?: string
}>(), {
  initialGroupCode: '0101'
})

const emit = defineEmits<{
  (e: 'go-college'): void
  (e: 'go-profession'): void
  (e: 'open-major', name: string): void
  (e: 'group-change', code: string): void
}>()

const levels = ref<MajorLevelItem[]>([
  { id: 1, name: '普本' },
  { id: 2, name: '职本' },
  { id: 3, name: '专科' }
])
const level = ref(1)
const tree = ref<MajorTreeCategory[]>([])
const treeLoading = ref(false)
const detailLoading = ref(false)
const activeGroupCode = ref('')
const openedCategories = ref<string[]>([])
const groupDetail = ref<MajorGroupDetail | null>(null)

onMounted(async () => {
  document.title = '专业查询'
  try {
    const list = await getMajorLevels()
    if (list?.length) levels.value = list
  } catch { /* keep defaults */ }
  await loadTreeAndSelect(props.initialGroupCode || '0101')
})

watch(() => props.initialGroupCode, (code) => {
  if (code && code !== activeGroupCode.value) {
    loadTreeAndSelect(code)
  }
})

async function onLevelSelect(index: string) {
  level.value = Number(index) || 1
  await loadTreeAndSelect()
}

function onCategoryOpen(index: string) {
  if (!openedCategories.value.includes(index)) {
    openedCategories.value = [index]
  }
}

async function onGroupSelect(code: string) {
  activeGroupCode.value = code
  emit('group-change', code)
  await loadGroup(code)
}

async function loadTreeAndSelect(preferCode?: string) {
  treeLoading.value = true
  try {
    tree.value = await getMajorTree(level.value) || []
  } finally {
    treeLoading.value = false
  }
  const code = resolveInitialCode(preferCode)
  if (!code) {
    activeGroupCode.value = ''
    groupDetail.value = null
    openedCategories.value = []
    return
  }
  const cat = tree.value.find(c => c.groups.some(g => g.code === code))
  openedCategories.value = cat ? [cat.category] : (tree.value[0] ? [tree.value[0].category] : [])
  activeGroupCode.value = code
  emit('group-change', code)
  await loadGroup(code)
}

function resolveInitialCode(preferCode?: string): string {
  if (preferCode) {
    for (const c of tree.value) {
      if (c.groups.some(g => g.code === preferCode)) return preferCode
    }
  }
  // 切换层次时取该类第一项
  const first = tree.value[0]?.groups?.[0]
  return first?.code || ''
}

async function loadGroup(code: string) {
  if (!code) return
  detailLoading.value = true
  try {
    groupDetail.value = await getMajorsByGroup(code)
    if (groupDetail.value?.level && groupDetail.value.level !== level.value) {
      level.value = groupDetail.value.level
    }
  } finally {
    detailLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.transfer-page {
  min-height: 100vh;
  background: #fff;
  color: #000;
  font-size: 16px;
  /* 对齐源站 TransferPageBackground：内容居中 */
  display: flex;
  justify-content: center;
}
.transfer-info {
  display: flex;
  width: 100%;
  max-width: 1080px;
  min-height: 100vh;
  margin: 0 auto;
  border-right: 2px solid #ededed;
  box-sizing: border-box;
}

.left-menu {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eaeaea;
}
.row-menu {
  border-right: 1px solid #eaeaea;
  :deep(.el-menu--horizontal) {
    border-bottom: 1px solid #dcdfe6;
    height: 46px;
  }
  :deep(.el-menu-item) {
    height: 44px;
    line-height: 44px;
    font-size: 16px;
    color: #000;
    border-bottom: 2px solid transparent !important;
  }
  :deep(.el-menu-item.is-active) {
    color: #cd3532 !important;
    border-bottom-color: #cd3532 !important;
  }
}
.coll-menu {
  flex: 1;
  overflow: auto;
  border-right: 1px solid #eaeaea;
  :deep(.el-menu) {
    border-right: none;
  }
  :deep(.el-sub-menu__title) {
    height: 35px;
    line-height: 35px;
    font-size: 16px;
    color: #303133;
  }
  :deep(.el-menu-item) {
    height: 35px;
    line-height: 35px;
    font-size: 15px;
  }
  :deep(.el-menu-item.is-active) {
    color: #cd3532 !important;
  }
}

.right-info {
  flex: 1;
  min-width: 0;
  position: relative;
}
.right-header {
  position: relative;
  border-bottom: 1px solid #cd3532;
}
.header-main {
  background: #fbf1f0;
  padding: 22px 10px 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 22px;
}
.major-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 24px;
  font-weight: 700;
  span { line-height: 32px; }
}
.header-line2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 17px;
  line-height: 1.4;
}
.deepBlueBtn {
  --el-button-bg-color: #266fff;
  --el-button-border-color: #266fff;
  --el-button-hover-bg-color: #4d8aff;
  --el-button-hover-border-color: #4d8aff;
  background: #266fff;
  border-color: #266fff;
}
.header-tab-row {
  position: relative;
  height: 36px;
  background: #fff;
}
.include-badge {
  position: absolute;
  left: 10px;
  top: 8px;
  background: #cd3532;
  color: #fff;
  font-size: 18px;
  padding: 3px 25px 3px 7px;
  z-index: 2;
  line-height: 1.2;
  white-space: nowrap;
}

.main-body {
  padding: 18px 14px 24px;
  height: calc(100vh - 210px);
  overflow: auto;
}
.majorsContainer {
  border-bottom: 1px solid #d4d8e1;
  cursor: pointer;
  &:hover { background: #fafafa; }
}
.majorsLine1 {
  display: flex;
  align-items: center;
  min-height: 37px;
  font-size: 16px;
  color: #000;
}
.majorsLine2 {
  display: flex;
  align-items: center;
  min-height: 37px;
  font-size: 14px;
  color: #606266;
}
</style>
