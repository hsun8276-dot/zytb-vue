<template>
  <div>
    <h2 class="page-title">工作台</h2>

    <el-row :gutter="16" v-loading="loading">
      <el-col :xs="12" :sm="8" :md="6" v-for="c in userCards" :key="c.label">
        <el-card shadow="never" class="stat-card" @click="c.to && $router.push(c.to)">
          <div class="stat-label">{{ c.label }}</div>
          <div class="stat-value" :style="{ color: c.color }">{{ c.value }}</div>
          <div class="stat-hint">{{ c.hint }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px" v-loading="loading">
      <el-col :xs="12" :sm="8" :md="6" v-for="c in dataCards" :key="c.label">
        <el-card shadow="never" class="stat-card" @click="c.to && $router.push(c.to)">
          <div class="stat-label">{{ c.label }}</div>
          <div class="stat-value" :style="{ color: c.color }">{{ c.value }}</div>
          <div class="stat-hint">{{ c.hint }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top:16px">
      <template #header>
        <span>快捷入口</span>
      </template>
      <div class="quick-row">
        <el-button type="primary" @click="$router.push('/admin/users')">用户管理</el-button>
        <el-button @click="$router.push('/admin/colleges')">院校管理</el-button>
        <el-button @click="$router.push('/admin/logs')">操作日志</el-button>
        <el-button @click="$router.push('/admin/settings')">系统配置</el-button>
      </div>
      <p class="note">
        河北官方投档年份：{{ yearsText }}。账号开通/续费年数、默认密码等在「系统配置」维护。
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminOverview } from '@/api/admin'
import type { AdminOverview } from '@/api/admin'

const loading = ref(false)
const overview = ref<AdminOverview | null>(null)

const fmt = (n?: number) => (n == null ? '-' : Number(n).toLocaleString())

const userCards = computed(() => {
  const u = overview.value?.users
  return [
    { label: '账号总数', value: fmt(u?.total), hint: '含管理员', color: '#2f7bff', to: '/admin/users' },
    { label: '填报师', value: fmt(u?.fillerTotal), hint: 'user 角色', color: '#5aa7ff', to: '/admin/users' },
    { label: '有效填报师', value: fmt(u?.fillerActive), hint: '未过期且启用', color: '#5cb85c', to: '/admin/users' },
    { label: '已过期', value: fmt(u?.fillerExpired), hint: '需重新开通', color: '#e6a23c', to: '/admin/users' },
    { label: '违规停用', value: fmt(u?.fillerDisabled), hint: '未过期已停用', color: '#f56c6c', to: '/admin/users' }
  ]
})

const dataCards = computed(() => {
  const d = overview.value?.data
  return [
    { label: '院校库', value: fmt(d?.collegeCount), hint: '所', color: '#7b68c9', to: '/admin/colleges' },
    { label: '专业目录', value: fmt(d?.majorDictCount), hint: '教育部目录', color: '#5b5fc7', to: '/admin/colleges' },
    { label: '河北招生专业', value: fmt(d?.recruitMajorCount), hint: '2026 年', color: '#2f7bff' },
    { label: '志愿方案', value: fmt(d?.aspirationCount), hint: '未删除', color: '#5cb85c' },
    { label: '投档线年份', value: fmt(d?.scoreLineYearCount), hint: '河北 score_line', color: '#e6a23c' }
  ]
})

const yearsText = computed(() => {
  const ys = overview.value?.data?.scoreLineYears || []
  return ys.length ? ys.join('、') : '暂无'
})

onMounted(async () => {
  loading.value = true
  try {
    overview.value = await getAdminOverview()
  } catch (e: any) {
    ElMessage.error(e.message || '加载工作台失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.page-title {
  font-size: 20px;
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow .15s;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, .08);
  }
}

.stat-label {
  color: #666;
  font-size: 13px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin: 6px 0 2px;
  line-height: 1.2;
}

.stat-hint {
  color: #999;
  font-size: 12px;
}

.quick-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.note {
  margin: 14px 0 0;
  color: #888;
  font-size: 13px;
}
</style>
