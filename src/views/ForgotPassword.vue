<template>
  <div class="forgot-page">
    <h2>找回密码</h2>
    <el-card shadow="never" style="max-width: 420px">
      <el-result icon="info" title="请联系管理员重置密码" sub-title="本系统账号由管理员统一开通,密码遗失请联系管理员重置(重置后为 123456)">
        <template #extra>
          <el-button type="primary" @click="$router.push('/login')">返回登录</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.forgot-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;

  h2 {
    margin-bottom: 20px;
  }
}
</style>
