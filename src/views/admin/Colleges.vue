<template>
  <div>
    <h2 class="page-title">院校管理</h2>
    <el-card shadow="never">
      <el-empty description="院校数据管理功能建设中">
        <el-button type="primary" plain @click="$router.push('/admin')">返回首页</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.page-title {
  font-size: 20px;
  margin-bottom: 16px;
}
</style>
