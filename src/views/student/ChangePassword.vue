<template>
  <div class="pwd-page">
    <h2 class="page-title">
      <el-icon style="margin-right:6px"><Key /></el-icon>
      修改密码
    </h2>
    <el-breadcrumb separator="/" class="crumb">
      <el-breadcrumb-item>个人信息维护</el-breadcrumb-item>
      <el-breadcrumb-item>修改密码</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never" class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        style="max-width: 520px"
      >
        <el-form-item label="原密码：" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <el-form-item label="新密码：" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            show-password
            autocomplete="new-password"
            placeholder="6-32位"
          />
        </el-form-item>
        <el-form-item label="确认密码：" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item class="actions">
          <el-button type="success" :loading="saving" @click="submit">
            <el-icon><CircleCheck /></el-icon>&nbsp;修改
          </el-button>
          <el-button type="danger" @click="cancel">
            <el-icon><CircleClose /></el-icon>&nbsp;取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CircleCheck, CircleClose, Key } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { changeMyPassword } from '@/api/user'
import { logout as logoutApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const saving = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 32, message: '新密码长度需为6-32位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_r, v, cb) => {
        if (v !== form.newPassword) return cb(new Error('两次输入的新密码不一致'))
        cb()
      },
      trigger: 'blur'
    }
  ]
}

async function submit() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  saving.value = true
  try {
    await changeMyPassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword
    })
    ElMessage.success('密码修改成功，请重新登录')
    try { await logoutApi() } catch { /* ignore */ }
    userStore.logout()
    router.replace('/login')
  } catch {
    /* 错误已由 request 拦截器提示 */
  } finally {
    saving.value = false
  }
}

function cancel() {
  router.push('/student/dashboard')
}
</script>

<style scoped lang="scss">
.pwd-page {
  .page-title {
    display: flex;
    align-items: center;
    font-size: 20px;
    margin: 0 0 8px;
  }
  .crumb { margin-bottom: 14px; }
  .form-card { max-width: 640px; }
  .actions { margin-top: 8px; }
}
</style>
