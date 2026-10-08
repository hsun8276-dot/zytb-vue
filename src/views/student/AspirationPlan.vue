<template>
  <div class="aspiration-page">
    <h2 class="page-title">
      <el-icon style="margin-right:6px"><Avatar /></el-icon>
      高考志愿填报（3+1+2）
    </h2>

    <el-card shadow="never">
      <!-- 筛选行: 省份/年份 + 姓名检索 -->
      <div class="filter-row">
        <span class="f-label">省份:</span>
        <el-select v-model="qProvince" style="width: 130px">
          <el-option v-for="p in PROVINCES" :key="p" :label="p" :value="p" />
        </el-select>
        <span class="f-label" style="margin-left:18px">年份:</span>
        <el-select v-model="qYear" style="width: 100px">
          <el-option v-for="y in [2026, 2025]" :key="y" :label="y" :value="y" />
        </el-select>
        <div class="filter-right">
          <span class="f-label">姓名:</span>
          <el-input v-model="keyword" style="width: 200px" clearable @keyup.enter="search" @clear="search" />
          <el-button class="btn-purple" style="margin-left:8px" @click="search">
            <el-icon><Search /></el-icon>&nbsp;检索
          </el-button>
        </div>
      </div>

      <!-- 操作行: 添加学生 / 一键迁移 / 显示数据采集二维码 -->
      <div class="op-row">
        <el-button type="success" @click="openCreate">
          <el-icon style="margin-right:4px"><Avatar /></el-icon> 添加学生
        </el-button>
        <el-button class="btn-amber" @click="onMigrate">
          <el-icon style="margin-right:4px"><Switch /></el-icon> 一键迁移
        </el-button>
        <el-button type="danger" class="op-right" @click="onShowQr">
          <el-icon style="margin-right:4px"><Postcard /></el-icon> 显示数据采集二维码
        </el-button>
      </div>

      <!-- 学生列表 -->
      <el-table :data="list" stripe v-loading="loading" class="stu-table">
        <el-table-column label="姓名" min-width="110">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="openDetail(row)">{{ row.studentName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="batch" label="批次" width="90" />
        <el-table-column label="志愿名称" min-width="140">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="openDetail(row)">{{ row.aspirationName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="genderText" label="性别" width="70" />
        <el-table-column prop="score" label="分数" width="80" />
        <el-table-column label="选考科目" min-width="150">
          <template #default="{ row }">
            <span :class="{ 'hist-subject': row.firstSubject === '历史' }">{{ row.subjectsDisplay }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="highSchool" label="就读高中" min-width="110" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="填报" width="110">
          <template #default="{ row }">
            <el-button v-if="row.submitStatus === 0" type="primary" size="small" @click="onFill(row)">填报志愿</el-button>
            <span v-else class="txt-submitted">已交单</span>
          </template>
        </el-table-column>
        <el-table-column label="交单" width="110">
          <template #default="{ row }">
            <template v-if="row.submitStatus === 0">
              <el-button class="btn-amber" size="small" @click="onSubmit(row)">交单</el-button>
            </template>
            <template v-else>
              <div class="txt-submitted">已交单</div>
              <div class="txt-submitter">{{ row.submitter }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link @click="openEdit(row)">
              <el-icon color="#67c23a" :size="18"><EditPen /></el-icon>
            </el-button>
            <el-button link style="margin-left:14px" @click="onDelete(row)">
              <el-icon color="#f56c6c" :size="18"><CloseBold /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页: 第 X / Y 页 (Z 项) -->
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
          <span>页尺寸:</span>
          <el-select v-model="size" style="width: 76px" @change="onSizeChange">
            <el-option v-for="n in [10, 20, 50]" :key="n" :label="n" :value="n" />
          </el-select>
        </div>
      </div>
    </el-card>

    <!-- 创建用户(添加学生)弹窗: 学生核心信息一旦创建不可修改 -->
    <el-dialog v-model="createVisible" title="创建用户" width="780px" :close-on-click-modal="false">
      <div class="form-grid2">
        <div class="f-item">
          <label class="f-label">姓名:</label>
          <el-input v-model="form.studentName" style="width: 220px" maxlength="50" />
        </div>
        <div class="f-item">
          <label class="f-label">性别:</label>
          <el-select v-model="form.gender" style="width: 220px">
            <el-option label="男" :value="1" /><el-option label="女" :value="2" />
          </el-select>
        </div>
        <div class="f-item">
          <label class="f-label">文理科:</label>
          <el-input disabled placeholder="选科" style="width: 220px" />
        </div>
        <div class="f-item">
          <label class="f-label">高考分数:</label>
          <el-input-number v-model="form.score" :min="0" :max="750" :controls="false" style="width: 220px" />
        </div>
        <div class="f-item f-full">
          <label class="f-label">首选科目:</label>
          <el-radio-group v-model="form.firstSubject">
            <el-radio value="物理">物理</el-radio>
            <el-radio value="历史">历史</el-radio>
          </el-radio-group>
        </div>
        <div class="f-item f-full">
          <label class="f-label">次选科目:</label>
          <el-checkbox-group v-model="form.secondSubjects">
            <el-checkbox v-for="s in SECOND_SUBJECTS" :key="s" :value="s" :disabled="isSecondDisabled(s)">{{ s }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <el-alert type="warning" :closable="false" class="warn-bar">
        <template #title>
          <span class="warn-text"><el-icon style="vertical-align:-2px"><WarningFilled /></el-icon>
          &nbsp;学生一旦创建，以上信息将无法修改。</span>
        </template>
      </el-alert>

      <div class="f-item" style="margin-top:16px">
        <label class="f-label">志愿名称:</label>
        <el-input v-model="form.aspirationName" placeholder="志愿填报" style="width: 100%" />
      </div>
      <div class="f-item" style="margin-top:14px">
        <label class="f-label">就读高中:</label>
        <el-input v-model="form.highSchool" style="width: 100%" />
      </div>
      <div class="f-item" style="margin-top:14px">
        <label class="f-label">联系电话:</label>
        <el-input v-model="form.contactPhone" style="width: 100%" />
      </div>

      <template #footer>
        <el-button type="success" style="min-width:110px" :loading="saving" @click="onCreate">创建用户</el-button>
        <el-button type="danger" style="min-width:90px" @click="createVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 用户志愿信息(学生详情)弹窗 -->
    <el-dialog v-model="detailVisible" title="用户志愿信息" width="900px">
      <div class="detail-box" v-loading="detailLoading">
        <div class="d-grid">
          <div><label>姓名:</label><span>{{ detail?.studentName }}</span></div>
          <div><label>性别:</label><span>{{ detail?.genderText }}</span></div>
          <div><label>高考年份:</label><span>{{ detail?.year }}</span></div>
          <div><label>省份:</label><span>{{ detail?.province }}</span></div>
          <div><label>组别:</label><span>{{ detail?.groupName }}</span></div>
          <div><label>选考科目:</label><span>{{ detail?.subjectsDisplay }}</span></div>
          <div><label>成绩:</label><span>{{ detail?.score ?? '' }}</span></div>
          <div><label>政策加分:</label><span>{{ detail?.bonusScore || '' }}</span></div>
          <div></div>
        </div>
        <el-divider />
        <div class="d-grid">
          <div><label>志愿名称:</label><span>{{ detail?.aspirationName }}</span></div>
          <div><label>就读高中:</label><span>{{ detail?.highSchool }}</span></div>
          <div><label>联系电话:</label><span>{{ detail?.contactPhone }}</span></div>
          <div><label>民族:</label><span>{{ detail?.ethnicity }}</span></div>
          <div><label>是否应届:</label>
            <el-checkbox :model-value="detail?.isFresh === 1" disabled style="height:auto" />
          </div>
          <div></div>
        </div>
        <el-divider />
        <div class="d-grid">
          <div><label>语文成绩:</label><span>{{ detail?.chineseScore ?? '' }}</span></div>
          <div><label>数学成绩:</label><span>{{ detail?.mathScore ?? '' }}</span></div>
          <div><label>外语成绩:</label><span>{{ detail?.englishScore ?? '' }}</span></div>
          <div><label>{{ detail?.firstSubject || '首选科目' }}成绩:</label><span>{{ detail?.elective1Score ?? '' }}</span></div>
          <div><label>{{ secondLabel(0) }}成绩:</label><span>{{ detail?.elective2Score ?? '' }}</span></div>
          <div><label>{{ secondLabel(1) }}成绩:</label><span>{{ detail?.elective3Score ?? '' }}</span></div>
        </div>
        <el-divider />
        <div class="d-grid">
          <div><label>身高:</label><span>{{ detail?.heightCm ?? '' }}</span></div>
          <div><label>体重:</label><span>{{ detail?.weightKg ?? '' }}</span></div>
          <div><label>是否色盲:</label><el-checkbox :model-value="detail?.colorBlind === 1" disabled style="height:auto" /></div>
          <div><label>左眼视力:</label><span>{{ detail?.leftVision }}</span></div>
          <div><label>右眼视力:</label><span>{{ detail?.rightVision }}</span></div>
          <div><label>是否色弱:</label><el-checkbox :model-value="detail?.colorWeakness === 1" disabled style="height:auto" /></div>
        </div>
        <el-divider />
        <div class="d-grid">
          <div><label>父母姓名:</label><span>{{ detail?.parentName }}</span></div>
          <div><label>父亲职业:</label><span>{{ detail?.fatherJob }}</span></div>
          <div><label>母亲职业:</label><span>{{ detail?.motherJob }}</span></div>
        </div>
      </div>
      <template #footer>
        <el-button type="danger" style="min-width:90px" @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑志愿信息弹窗(学生核心信息不可改, 只改志愿信息段) -->
    <el-dialog v-model="editVisible" title="编辑志愿信息" width="620px" :close-on-click-modal="false">
      <el-alert type="info" :closable="false" style="margin-bottom:14px">
        <template #title>学生核心信息创建后不可修改, 此处仅可修改志愿信息</template>
      </el-alert>
      <div class="f-item">
        <label class="f-label">志愿名称:</label>
        <el-input v-model="editForm.aspirationName" style="width: 100%" />
      </div>
      <div class="f-item" style="margin-top:14px">
        <label class="f-label">就读高中:</label>
        <el-input v-model="editForm.highSchool" style="width: 100%" />
      </div>
      <div class="f-item" style="margin-top:14px">
        <label class="f-label">联系电话:</label>
        <el-input v-model="editForm.contactPhone" style="width: 100%" />
      </div>
      <template #footer>
        <el-button type="primary" style="min-width:90px" :loading="saving" @click="onSaveEdit">保存</el-button>
        <el-button @click="editVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Avatar, Search, Switch, Postcard, EditPen, CloseBold, WarningFilled } from '@element-plus/icons-vue'
import {
  getAspirationPage, createAspiration, getAspirationDetail,
  updateAspirationInfo, submitAspiration, deleteAspiration
} from '@/api/aspiration'
import type { AspirationRow } from '@/api/aspiration'

const PROVINCES = ['河北', '北京', '天津', '上海', '重庆', '辽宁', '江苏', '浙江', '山东', '广东',
  '湖北', '湖南', '福建', '安徽', '江西', '河南', '山西', '内蒙古', '吉林', '黑龙江',
  '广西', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '宁夏', '新疆', '西藏']
const SECOND_SUBJECTS = ['化学', '生物', '地理', '政治']

const qProvince = ref('河北')
const qYear = ref(2026)
const keyword = ref('')
const list = ref<AspirationRow[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)
const saving = ref(false)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))

async function load() {
  loading.value = true
  try {
    const r = await getAspirationPage({ page: page.value, size: size.value, keyword: keyword.value || undefined })
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
  load()
}

function onSizeChange() {
  page.value = 1
  load()
}

/* ---------- 创建用户 ---------- */
const createVisible = ref(false)
const form = reactive({
  studentName: '', gender: 1, score: undefined as number | undefined,
  firstSubject: '物理' as '物理' | '历史',
  secondSubjects: [] as string[],
  aspirationName: '', highSchool: '', contactPhone: ''
})

function openCreate() {
  form.studentName = ''
  form.gender = 1
  form.score = undefined
  form.firstSubject = '物理'
  form.secondSubjects = []
  form.aspirationName = ''
  form.highSchool = ''
  form.contactPhone = ''
  createVisible.value = true
}

/** 次选科目: 3+1+2 只能选2科, 选满2科后其余禁用 */
function isSecondDisabled(s: string) {
  return form.secondSubjects.length >= 2 && !form.secondSubjects.includes(s)
}

async function onCreate() {
  if (!form.studentName.trim()) { ElMessage.warning('请填写学生姓名'); return }
  if (form.score === undefined || form.score === null) { ElMessage.warning('请填写高考分数'); return }
  if (form.secondSubjects.length !== 2) { ElMessage.warning('次选科目必须勾选2科(3+1+2)'); return }
  saving.value = true
  try {
    await createAspiration({
      studentName: form.studentName.trim(),
      gender: form.gender,
      province: qProvince.value,
      year: qYear.value,
      score: form.score,
      firstSubject: form.firstSubject,
      secondSubjects: form.secondSubjects,
      aspirationName: form.aspirationName.trim() || '志愿填报',
      highSchool: form.highSchool.trim(),
      contactPhone: form.contactPhone.trim()
    })
    ElMessage.success('学生创建成功')
    createVisible.value = false
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '创建失败')
  } finally {
    saving.value = false
  }
}

/* ---------- 学生详情 ---------- */
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<AspirationRow | null>(null)

async function openDetail(row: AspirationRow) {
  detailVisible.value = true
  detailLoading.value = true
  try {
    detail.value = await getAspirationDetail(row.aspirationCode)
  } catch (e: any) {
    ElMessage.error(e.message || '加载详情失败')
  } finally {
    detailLoading.value = false
  }
}

function secondLabel(i: number) {
  const s = detail.value?.subjectsDisplay || ''
  const parts = s.split('、').slice(1)
  return parts[i] || '次选'
}

/* ---------- 编辑志愿信息 ---------- */
const editVisible = ref(false)
const editForm = reactive({ aspirationCode: '', aspirationName: '', highSchool: '', contactPhone: '' })

function openEdit(row: AspirationRow) {
  if (row.submitStatus === 1) {
    ElMessage.warning('该方案已交单, 志愿信息已锁定, 如需修改请先撤销交单')
    return
  }
  editForm.aspirationCode = row.aspirationCode
  editForm.aspirationName = row.aspirationName
  editForm.highSchool = row.highSchool
  editForm.contactPhone = row.contactPhone
  editVisible.value = true
}

async function onSaveEdit() {
  saving.value = true
  try {
    await updateAspirationInfo(editForm.aspirationCode, {
      aspirationName: editForm.aspirationName.trim() || '志愿填报',
      highSchool: editForm.highSchool.trim(),
      contactPhone: editForm.contactPhone.trim()
    })
    ElMessage.success('志愿信息已保存')
    editVisible.value = false
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

/* ---------- 交单/删除/填报入口 ---------- */
async function onSubmit(row: AspirationRow) {
  try {
    await ElMessageBox.confirm(
      `确认为学生「${row.studentName}」交单? 交单后志愿表将锁定, 如需修改需先撤销交单。`,
      '交单确认', { confirmButtonText: '确认交单', cancelButtonText: '取消', type: 'warning' }
    )
  } catch { return }
  try {
    await submitAspiration(row.aspirationCode, 1)
    ElMessage.success('已交单')
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '交单失败')
  }
}

async function onDelete(row: AspirationRow) {
  try {
    await ElMessageBox.confirm(
      `确认删除学生「${row.studentName}」的志愿方案? 删除后不可恢复。`,
      '删除确认', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
  } catch { return }
  try {
    await deleteAspiration(row.aspirationCode)
    ElMessage.success('已删除')
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

function onFill(row: AspirationRow) {
  window.open(`/fill/${row.aspirationCode}`, '_blank')
}

function onMigrate() {
  ElMessage.info('一键迁移: 用于迁移历史方案数据, 功能待接入')
}

function onShowQr() {
  ElMessage.info('数据采集二维码: 学生/家长扫码补全民族/单科成绩/体检等信息, 功能待接入')
}

onMounted(load)
</script>

<style scoped>
.page-title {
  display: flex;
  align-items: center;
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 14px;
}

.filter-row {
  display: flex;
  align-items: center;
  padding: 4px 0 12px;
}

.filter-right {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.f-label {
  color: #555;
  font-size: 14px;
  margin-right: 6px;
  white-space: nowrap;
}

.btn-purple {
  background: #5b5fc7;
  border-color: #5b5fc7;
  color: #fff;
}

.btn-purple:hover {
  opacity: 0.88;
  color: #fff;
}

.op-row {
  display: flex;
  align-items: center;
  padding-bottom: 14px;
}

.op-right {
  margin-left: auto;
}

.btn-amber {
  background: #d99a17;
  border-color: #d99a17;
  color: #fff;
}

.btn-amber:hover {
  opacity: 0.88;
  color: #fff;
}

.hist-subject {
  color: #d78a12;
}

.txt-submitted {
  color: #d78a12;
  font-size: 13px;
}

.txt-submitter {
  color: #4a7dc4;
  font-size: 12px;
  line-height: 16px;
}

.stu-table {
  width: 100%;
}

.pager-row {
  display: flex;
  align-items: center;
  padding-top: 14px;
}

.pager-total {
  color: #555;
  font-size: 14px;
  white-space: nowrap;
}

.pager-center {
  margin: 0 auto;
}

.pager-size {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  font-size: 14px;
}

.form-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 18px;
}

.f-item {
  display: flex;
  align-items: center;
}

.f-item .f-label {
  width: 86px;
  justify-content: flex-end;
}

.f-full {
  grid-column: 1 / 3;
}

.warn-bar {
  margin-top: 20px;
  background: #fdf6ec;
}

.warn-text {
  color: #e6a23c;
  font-size: 14px;
}

.detail-box {
  min-height: 220px;
}

.d-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  row-gap: 14px;
}

.d-grid label {
  color: #555;
  font-size: 14px;
  margin-right: 8px;
  display: inline-block;
  min-width: 72px;
}

.d-grid span {
  color: #222;
  font-size: 14px;
}

.el-divider {
  margin: 18px 0;
}
</style>
