<template>
  <div>
    <h2 class="page-title">院校库</h2>
    <el-card shadow="never">
      <el-empty description="院校与专业查询功能建设中(数据源:3075所全国院校)">
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
