<template>
  <div>
    <h2 class="page-title">{{ $route.meta.title }}</h2>
    <el-card shadow="never">
      <el-empty :description="`${$route.meta.title}功能建设中`">
        <el-button type="primary" plain @click="$router.push('/student/dashboard')">返回仪表板</el-button>
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
