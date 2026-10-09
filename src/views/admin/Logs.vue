<template>
  <div>
    <h2 class="page-title">操作日志</h2>

    <el-card shadow="never">
      <div class="filter-row">
        <el-input
          v-model="keyword"
          placeholder="账号/姓名/动作/请求路径"
          clearable
          style="width:240px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-input
          v-model="module"
          placeholder="模块"
          clearable
          style="width:160px;margin-left:8px"
          @keyup.enter="search"
          @clear="search"
        />
        <el-select v-model="status" clearable placeholder="状态" style="width:120px;margin-left:8px" @change="search">
          <el-option label="成功" :value="1" />
          <el-option label="失败" :value="0" />
        </el-select>
        <el-button type="primary" style="margin-left:8px" @click="search">检索</el-button>
      </div>

      <el-table :data="list" stripe v-loading="loading" style="width:100%">
        <el-table-column label="操作人" min-width="140">
          <template #default="{ row }">
            <div v-if="row.username || row.realName">
              <div>{{ row.realName || '-' }}</div>
              <div class="sub">{{ row.username || '' }}<span v-if="row.userId"> (#{{ row.userId }})</span></div>
            </div>
            <span v-else class="muted">未登录 / 未知</span>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120" show-overflow-tooltip />
        <el-table-column prop="action" label="动作" min-width="140" show-overflow-tooltip />
        <el-table-column label="请求" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="mono">{{ row.requestParams || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="90">
          <template #default="{ row }">
            {{ row.duration == null ? '-' : row.duration + ' ms' }}
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" width="130" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="170" />
        <el-table-column label="失败原因" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ danger: row.status !== 1 }">{{ row.responseData || '-' }}</span>
          </template>
        </el-table-column>
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

      <p class="tip">
        仅记录写操作（POST/PUT/DELETE），不含查询；请求体不入库，避免密码等敏感信息落库。建表前的历史操作不会回溯。
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminLogPage } from '@/api/admin'
import type { AdminLogRow } from '@/api/admin'

const loading = ref(false)
const list = ref<AdminLogRow[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const module = ref('')
const status = ref<number | ''>('')

function search() {
  page.value = 1
  load()
}

async function load() {
  loading.value = true
  try {
    const r = await getAdminLogPage({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      module: module.value.trim() || undefined,
      status: status.value
    })
    list.value = r.records
    total.value = r.total
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)
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
  margin-bottom: 14px;
}

.sub {
  color: #999;
  font-size: 12px;
  margin-top: 2px;
}

.muted {
  color: #c0c4cc;
  font-size: 13px;
}

.mono {
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
}

.danger {
  color: #f56c6c;
}

.tip {
  margin: 14px 0 0;
  color: #999;
  font-size: 12px;
  line-height: 1.6;
}
</style>
