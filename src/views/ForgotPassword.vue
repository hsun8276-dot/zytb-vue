<template>
  <div class="forgot-page">
    <div class="forgot-card">
      <div class="forgot-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h2>找回密码</h2>
      </div>
      <div class="notice">
        <p>为保障账号安全，密码不支持自助重置。</p>
        <p>学生请联系任课老师，老师请联系管理员，在后台为你重置密码。</p>
      </div>
      <el-button type="primary" size="large" class="submit-btn" @click="router.push('/login')">
        返回登录
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss">
.forgot-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #1677ff 50%, #0e5fc9 100%);
}

.forgot-card {
  width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  .forgot-header {
    text-align: center;
    margin-bottom: 24px;

    .logo {
      width: 48px;
      height: 48px;
    }

    h2 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin-top: 12px;
    }
  }

  .notice {
    color: #606266;
    font-size: 14px;
    line-height: 1.8;
    text-align: center;
  }

  .submit-btn {
    width: 100%;
    margin-top: 24px;
    background: #1890ff;
  }
}
</style>
