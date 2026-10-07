<template>
  <div>
    <h2 class="page-title">首页</h2>
    <el-card shadow="never">
      <el-empty description="欢迎来到志愿填报系统,功能建设中">
        <el-button type="primary" plain @click="$router.push('/student')">返回首页</el-button>
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
