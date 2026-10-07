<template>
  <div class="app-shell">
    <!-- 顶部: 白色品牌区 + 蓝色顶条 -->
    <div class="topbar">
      <div class="brand-block" :class="{ collapsed }">
        <img src="/logo.jpg" alt="砚衡升学" class="brand-logo" />
        <div class="brand-text" v-if="!collapsed">
          <div class="brand-cn">砚衡升学</div>
          <div class="brand-en">YANHENG AI CLOUD</div>
        </div>
      </div>
      <button class="hamburger" @click="collapsed = !collapsed" :title="collapsed ? '展开菜单' : '收起菜单'">
        <el-icon :size="20"><Menu /></el-icon>
      </button>
      <div class="topbar-blue">
        <div class="topbar-user">
          <el-icon :size="18"><UserFilled /></el-icon>
          <span>{{ username }}</span>
        </div>
      </div>
    </div>

    <div class="body-row">
      <!-- 侧边栏 -->
      <el-aside :width="collapsed ? '64px' : '260px'" class="app-aside">
        <el-menu
          :default-active="route.path"
          router
          :collapse="collapsed"
          :collapse-transition="false"
          class="side-menu"
        >
          <el-menu-item index="/student/dashboard">
            <el-icon><Odometer /></el-icon>
            <template #title>仪表板</template>
          </el-menu-item>

          <el-sub-menu index="aspiration">
            <template #title>
              <el-icon><EditPen /></el-icon>
              <span>志愿填报</span>
            </template>
            <el-menu-item index="/student/aspiration/plan">填报方案</el-menu-item>
            <el-menu-item index="/student/aspiration/list">志愿表管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="submit">
            <template #title>
              <el-icon><Van /></el-icon>
              <span>前台交单</span>
            </template>
            <el-menu-item index="/student/submit/records">交单记录</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="query">
            <template #title>
              <el-icon><Search /></el-icon>
              <span>综合查询</span>
            </template>
            <el-menu-item index="/student/query/college">院校查询</el-menu-item>
            <el-menu-item index="/student/query/major">专业查询</el-menu-item>
            <el-menu-item index="/student/query/score-line">分数线查询</el-menu-item>
            <el-menu-item index="/student/query/rank">位次查询</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="profile">
            <template #title>
              <el-icon><Postcard /></el-icon>
              <span>个人信息维护</span>
            </template>
            <el-menu-item index="/student/profile">基本资料</el-menu-item>
            <el-menu-item index="/student/password">修改密码</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="app-main">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, UserFilled, Odometer, EditPen, Van, Search, Postcard } from '@element-plus/icons-vue'

const route = useRoute()
const username = localStorage.getItem('username') || '填报师'
const collapsed = ref(false)
</script>

<style scoped lang="scss">
.app-shell {
  min-height: 100vh;
  background: #f0f2f5;
}

/* 顶栏 */
.topbar {
  display: flex;
  align-items: stretch;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;

  .brand-block {
    width: 260px;
    background: #fff;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    flex-shrink: 0;
    transition: width 0.2s;

    &.collapsed {
      width: 64px;
      padding: 0;
      justify-content: center;

      .brand-logo {
        width: 36px;
        height: 36px;
      }
    }

    .brand-logo {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      object-position: center 30%;
    }

    .brand-text {
      .brand-cn {
        font-size: 18px;
        font-weight: 700;
        color: #c0392b;
        line-height: 1.2;
      }

      .brand-en {
        font-size: 9px;
        color: #9aa7b5;
        letter-spacing: 0.5px;
      }
    }
  }

  .hamburger {
    width: 64px;
    border: none;
    background: #2f7bff;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:hover {
      background: #2a6fe0;
    }
  }

  .topbar-blue {
    flex: 1;
    background: linear-gradient(90deg, #3f8cff, #2f7bff);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 24px;

    .topbar-user {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fff;
      font-size: 14px;
    }
  }
}

.body-row {
  display: flex;
  align-items: stretch;
  min-height: calc(100vh - 64px);
}

/* 侧边栏 */
.app-aside {
  background: #fff;
  border-right: 1px solid #eef0f4;
  transition: width 0.2s;
  overflow-x: hidden;

  .side-menu {
    border-right: none;
    padding-top: 8px;

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 52px;
      line-height: 52px;
      font-size: 15px;
      border-bottom: 1px solid #f5f6f8;
    }

    :deep(.el-menu-item.is-active) {
      color: #2f7bff;
      background: #eef5ff;
      border-right: 3px solid #2f7bff;
    }
  }
}

/* 主内容 */
.app-main {
  flex: 1;
  background: #f0f2f5;
  padding: 20px;
  min-width: 0;
}
</style>
