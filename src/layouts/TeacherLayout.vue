<template>
  <div class="app-shell">
    <el-container style="min-height: 100vh">
      <el-aside width="200px" class="app-aside">
        <div class="brand">
          <span class="brand-name">志愿填报·教师端</span>
        </div>
        <el-menu :default-active="route.path" router>
        <el-menu-item index="/teacher/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-menu-item index="/teacher/students">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item>
        <el-menu-item index="/teacher/aspirations">
          <el-icon><EditPen /></el-icon>
          <span>志愿审核</span>
        </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="app-header">
          <span>{ title }</span>
          <el-button link @click="doLogout">退出登录</el-button>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { logout } from '@/api/auth'

const route = useRoute()


async function doLogout() {
  try { await logout() } catch { /* 忽略 */ }
  localStorage.clear()
  ElMessage.success('已退出登录')
  setTimeout(() => window.location.href = '/login', 600)
}
</script>

<style scoped lang="scss">
.app-aside {
  border-right: 1px solid #eef0f4;
  background: #fff;

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
  }
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eef0f4;
  font-weight: 600;
}
</style>
