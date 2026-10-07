<template>
  <div>
    <h2 class="page-title">用户管理</h2>

    <el-card shadow="never">
      <template #header>
        <div class="header-row">
          <span>用户列表</span>
          <div class="header-actions">
            <el-input
              v-model="keyword"
              placeholder="搜索账号/姓名/手机号"
              clearable
              style="width: 220px; margin-right: 10px"
              @keyup.enter="search"
              @clear="search"
            />
            <el-button type="primary" @click="openCreate">+ 开通账号</el-button>
          </div>
        </div>
      </template>

      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="账号" min-width="140" />
        <el-table-column prop="realName" label="姓名" min-width="110" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.roleCode === 'admin' ? 'danger' : ''" size="small">{{ row.roleName || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="isExpired(row)" type="danger" size="small">已过期</el-tag>
            <el-tag v-else :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '正常' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期至" width="120">
          <template #default="{ row }">
            <span v-if="!row.expireTime" style="color:#c0c4cc;font-size:12px">永久</span>
            <span v-else :style="{ color: isExpired(row) ? '#f56c6c' : expireSoon(row) ? '#e6a23c' : '#333' }">
              {{ row.expireTime.slice(0, 10) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <template v-if="row.roleCode !== 'admin'">
              <el-button size="small" type="primary" plain @click="onRenew(row)">
                {{ isExpired(row) ? '重新开通' : '续费1年' }}
              </el-button>
              <el-button size="small" type="warning" plain @click="onResetPassword(row)">重置密码</el-button>
              <el-button v-if="row.status === 1" size="small" type="danger" plain @click="onToggle(row, 0)">停用</el-button>
              <el-button v-else size="small" type="success" plain @click="onToggle(row, 1)">启用</el-button>
            </template>
            <span v-else style="color:#c0c4cc;font-size:12px">系统管理员</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        style="margin-top: 14px; justify-content: flex-end"
        background
        layout="total, prev, pager, next, sizes, jumper"
        :total="total"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        v-model:current-page="page"
        @current-change="load"
        @size-change="onSizeChange"
      />
    </el-card>

    <!-- 开通账号 -->
    <el-dialog v-model="createVisible" title="开通账号" width="440px">
      <el-form :model="createForm" label-width="90px">
        <el-form-item label="账号" required>
          <el-input v-model="createForm.username" placeholder="手机号作为登录账号" maxlength="20" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="createForm.realName" placeholder="真实姓名" maxlength="20" />
        </el-form-item>
        <el-form-item label="初始密码">
          <el-input v-model="createForm.password" placeholder="留空则默认 123456" maxlength="20" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="doCreate">开通</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserPage, createUser, updateUserStatus, resetUserPassword, renewUser } from '@/api/user'
import type { UserRow } from '@/api/user'
import { useAdaptivePager } from '@/composables/useAdaptivePager'

const loading = ref(false)
const list = ref<UserRow[]>([])
const keyword = ref('')
const page = ref(1)
const total = ref(0)
const pageSizes = [10, 20, 50]
const { pageSize, markUserSet } = useAdaptivePager(() => { page.value = 1; load() }, { chrome: 520, item: 56, min: 10, max: 50 })

function search() {
  page.value = 1
  load()
}

function onSizeChange() {
  markUserSet()
  page.value = 1
  load()
}

async function load() {
  loading.value = true
  try {
    const r = await getUserPage({ page: page.value, size: pageSize.value, keyword: keyword.value.trim() || undefined })
    list.value = r.records
    total.value = r.total
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const createVisible = ref(false)
const creating = ref(false)
const createForm = ref({ username: '', realName: '', password: '' })

function openCreate() {
  createForm.value = { username: '', realName: '', password: '' }
  createVisible.value = true
}

async function doCreate() {
  if (!createForm.value.username.trim() || !createForm.value.realName.trim()) {
    ElMessage.warning('账号和姓名不能为空')
    return
  }
  creating.value = true
  try {
    await createUser({
      username: createForm.value.username.trim(),
      realName: createForm.value.realName.trim(),
      password: createForm.value.password || undefined
    })
    ElMessage.success('账号已开通')
    createVisible.value = false
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '开通失败')
  } finally {
    creating.value = false
  }
}

async function onResetPassword(row: UserRow) {
  try {
    await ElMessageBox.confirm(
      `确认把 ${row.realName || row.username} 的密码重置为 123456 吗?`,
      '重置密码',
      { confirmButtonText: '重置', cancelButtonText: '取消', type: 'warning' }
    )
    await resetUserPassword(row.id)
    ElMessage.success('密码已重置为 123456')
  } catch { /* 取消 */ }
}

function isExpired(row: UserRow): boolean {
  return !!row.expireTime && new Date(row.expireTime).getTime() < Date.now()
}

function expireSoon(row: UserRow): boolean {
  if (!row.expireTime) return false
  const diff = new Date(row.expireTime).getTime() - Date.now()
  return diff > 0 && diff < 30 * 24 * 3600 * 1000
}

async function onRenew(row: UserRow) {
  const action = isExpired(row) ? '重新开通' : '续费'
  try {
    await ElMessageBox.confirm(
      `确认为 ${row.realName || row.username} ${action} 1 年吗?${isExpired(row) ? '' : '(未到期将顺延一年)'}`,
      action,
      { confirmButtonText: action, cancelButtonText: '取消', type: 'warning' }
    )
    await renewUser(row.id, 1)
    ElMessage.success(`${action}成功, 有效期已更新`)
    load()
  } catch { /* 取消 */ }
}

async function onToggle(row: UserRow, status: 0 | 1) {
  try {
    await updateUserStatus(row.id, status)
    ElMessage.success(status === 1 ? '已启用' : '已停用')
    load()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.page-title {
  font-size: 20px;
  margin-bottom: 16px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-actions {
    display: flex;
    align-items: center;
  }
}
</style>
