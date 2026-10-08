<template>
  <div class="profile-page">
    <h2 class="page-title">
      <el-icon style="margin-right:6px"><User /></el-icon>
      基本资料
    </h2>
    <el-breadcrumb separator="/" class="crumb">
      <el-breadcrumb-item>个人信息维护</el-breadcrumb-item>
      <el-breadcrumb-item>基本资料</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card shadow="never" class="form-card" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="profile-form"
        style="max-width: 520px"
      >
        <el-form-item label="登录账号">
          <el-input :model-value="form.username" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" maxlength="50" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" maxlength="50" placeholder="选填" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" maxlength="11" placeholder="11位手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" maxlength="100" placeholder="选填" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :value="0">未知</el-radio>
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个人签名" prop="signature">
          <el-input
            v-model="form.signature"
            type="textarea"
            :rows="3"
            maxlength="255"
            show-word-limit
            placeholder="选填"
          />
        </el-form-item>
        <el-form-item label="账号有效期">
          <el-input :model-value="expireText" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="success" :loading="saving" @click="submit">
            <el-icon><Check /></el-icon>&nbsp;保存
          </el-button>
          <el-button type="danger" plain @click="reset">
            <el-icon><Close /></el-icon>&nbsp;取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Check, Close, User } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getMyProfile, updateMyProfile, type UserProfile } from '@/api/user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const snapshot = ref<UserProfile | null>(null)

const form = reactive({
  username: '',
  realName: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 0,
  signature: '',
  expireTime: '' as string | null
})

const rules: FormRules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    {
      validator: (_r, v, cb) => {
        if (!v) return cb()
        if (!/^1\d{10}$/.test(v)) return cb(new Error('手机号格式不正确'))
        cb()
      },
      trigger: 'blur'
    }
  ],
  email: [
    {
      type: 'email',
      message: '邮箱格式不正确',
      trigger: 'blur'
    }
  ]
}

const expireText = computed(() => {
  if (!form.expireTime) return '永久'
  return String(form.expireTime).replace('T', ' ').slice(0, 19)
})

function apply(data: UserProfile) {
  form.username = data.username || ''
  form.realName = data.realName || ''
  form.nickname = data.nickname || ''
  form.phone = data.phone || ''
  form.email = data.email || ''
  form.gender = data.gender ?? 0
  form.signature = data.signature || ''
  form.expireTime = data.expireTime
}

async function load() {
  loading.value = true
  try {
    const data = await getMyProfile()
    snapshot.value = data
    apply(data)
  } finally {
    loading.value = false
  }
}

function reset() {
  if (snapshot.value) apply(snapshot.value)
  formRef.value?.clearValidate()
}

async function submit() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  saving.value = true
  try {
    const payload = {
      realName: form.realName.trim(),
      nickname: form.nickname.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      gender: form.gender,
      signature: form.signature.trim()
    }
    await updateMyProfile(payload)
    const label = payload.nickname || payload.realName
    if (label) localStorage.setItem('displayName', label)
    if (userStore.userInfo) {
      userStore.setUserInfo({
        ...userStore.userInfo,
        realName: payload.realName,
        nickname: payload.nickname,
        phone: payload.phone,
        email: payload.email,
        gender: payload.gender,
        signature: payload.signature
      })
    }
    ElMessage.success('保存成功')
    await load()
  } catch {
    /* 错误已由 request 拦截器提示 */
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.profile-page {
  .page-title {
    display: flex;
    align-items: center;
    font-size: 20px;
    margin: 0 0 8px;
  }
  .crumb { margin-bottom: 14px; }
  .form-card { max-width: 640px; }
}
</style>
