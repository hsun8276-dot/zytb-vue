<template>
  <div class="forgot-page">
    <h2>找回密码</h2>
    <el-card shadow="never" style="max-width: 420px">
      <el-result
        icon="info"
        title="请联系管理员重置密码"
        :sub-title="hint"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/login')">返回登录</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getPublicConfig } from '@/api/admin'

const hint = ref('本系统账号由管理员统一开通,密码遗失请联系管理员重置(重置后为默认初始密码)')

onMounted(async () => {
  try {
    const cfg = await getPublicConfig()
    if (cfg?.contact_hint) hint.value = cfg.contact_hint
  } catch {
    // 公开配置失败时保留默认文案
  }
})
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
