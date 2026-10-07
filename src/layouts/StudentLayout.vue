<template>
  <div class="app-shell">
    <el-container style="min-height: 100vh">
      <el-aside width="200px" class="app-aside">
        <div class="brand">
          <img src="/logo.jpg" alt="" class="brand-img" />
          <span class="brand-name">砚衡升学</span>
        </div>
        <el-menu :default-active="route.path" router>
        <el-menu-item index="/student/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/student/colleges">
          <el-icon><School /></el-icon>
          <span>院校库</span>
        </el-menu-item>
        <el-menu-item index="/student/score">
          <el-icon><DataLine /></el-icon>
          <span>分数查询</span>
        </el-menu-item>
        <el-menu-item index="/student/aspiration">
          <el-icon><EditPen /></el-icon>
          <span>志愿填报</span>
        </el-menu-item>
        <el-menu-item index="/student/recommend">
          <el-icon><MagicStick /></el-icon>
          <span>智能推荐</span>
        </el-menu-item>
        <el-menu-item index="/student/profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
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
