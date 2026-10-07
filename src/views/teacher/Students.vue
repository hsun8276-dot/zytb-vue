<template>
  <div>
    <h2 class="page-title">学生管理</h2>
    <el-card shadow="never">
      <el-empty description="学生管理功能建设中">
        <el-button type="primary" plain @click="$router.push('/teacher')">返回首页</el-button>
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
