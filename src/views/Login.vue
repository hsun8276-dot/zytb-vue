<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 左侧插画区 -->
      <div class="illu-side">
        <svg class="illu" viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <!-- 底部平台 -->
          <rect x="90" y="300" width="340" height="66" rx="10" fill="#dbe4ee" />
          <rect x="120" y="278" width="280" height="34" rx="8" fill="#e8eef6" />
          <rect x="150" y="330" width="220" height="20" rx="6" fill="#cdd9e6" />
          <!-- 后方浏览器窗口 -->
          <g>
            <rect x="140" y="70" width="180" height="150" rx="10" fill="#ffffff" stroke="#d5dfee" />
            <rect x="140" y="70" width="180" height="26" rx="10" fill="#3f8cff" />
            <circle cx="154" cy="83" r="4" fill="#ffffff" opacity="0.85" />
            <circle cx="166" cy="83" r="4" fill="#ffffff" opacity="0.6" />
            <rect x="156" y="112" width="52" height="8" rx="4" fill="#c9d6e8" />
            <rect x="156" y="130" width="70" height="8" rx="4" fill="#dfe8f4" />
            <rect x="156" y="148" width="62" height="8" rx="4" fill="#dfe8f4" />
            <rect x="156" y="172" width="90" height="30" rx="6" fill="#eef4fb" />
          </g>
          <!-- 前方浏览器窗口(主) -->
          <g>
            <rect x="240" y="96" width="220" height="176" rx="12" fill="#ffffff" stroke="#c9d8ec" stroke-width="1.5" />
            <rect x="240" y="96" width="220" height="30" rx="12" fill="#2f7bff" />
            <circle cx="256" cy="111" r="4.5" fill="#ffffff" opacity="0.9" />
            <circle cx="270" cy="111" r="4.5" fill="#ffffff" opacity="0.55" />
            <rect x="258" y="140" width="90" height="10" rx="5" fill="#3f8cff" opacity="0.85" />
            <rect x="258" y="162" width="184" height="52" rx="8" fill="#f2f7fd" />
            <polyline points="270,200 292,184 314,192 336,170 358,178 380,160 402,168 424,150"
                      stroke="#3f8cff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <rect x="258" y="226" width="40" height="26" rx="4" fill="#5c9dff" />
            <rect x="306" y="218" width="40" height="34" rx="4" fill="#8ab6ff" />
            <rect x="354" y="226" width="40" height="26" rx="4" fill="#b9d4ff" />
            <rect x="402" y="212" width="40" height="40" rx="4" fill="#dcebff" />
          </g>
          <!-- 左侧小卡片 -->
          <g>
            <rect x="96" y="150" width="86" height="64" rx="8" fill="#ffffff" stroke="#d5dfee" />
            <rect x="106" y="160" width="30" height="24" rx="4" fill="#bcd4f5" />
            <circle cx="118" cy="170" r="5" fill="#f0a63f" />
            <polygon points="108,182 120,168 130,182" fill="#6fa8e8" />
            <rect x="144" y="162" width="30" height="7" rx="3.5" fill="#c9d6e8" />
            <rect x="144" y="176" width="24" height="7" rx="3.5" fill="#dfe8f4" />
            <rect x="144" y="190" width="28" height="7" rx="3.5" fill="#dfe8f4" />
          </g>
          <!-- 右侧聊天气泡 -->
          <g>
            <rect x="470" y="140" width="40" height="28" rx="8" fill="#ffffff" stroke="#d5dfee" />
            <circle cx="482" cy="154" r="3" fill="#8ab6ff" />
            <circle cx="492" cy="154" r="3" fill="#8ab6ff" />
            <circle cx="502" cy="154" r="3" fill="#8ab6ff" />
            <polygon points="480,168 488,168 478,176" fill="#ffffff" />
          </g>
          <!-- 左侧服务器塔 -->
          <g>
            <rect x="70" y="238" width="34" height="86" rx="6" fill="#e4ebf4" stroke="#cdd9e6" />
            <circle cx="87" cy="252" r="4" fill="#3f8cff" />
            <circle cx="87" cy="268" r="4" fill="#c3d3e8" />
            <circle cx="87" cy="284" r="4" fill="#c3d3e8" />
            <rect x="74" y="222" width="26" height="14" rx="4" fill="#3f8cff" />
            <path d="M87 214 l0 -8" stroke="#3f8cff" stroke-width="3" stroke-linecap="round" />
            <circle cx="87" cy="203" r="5" fill="#ffffff" stroke="#3f8cff" stroke-width="2.5" />
            <path d="M82 203 l4 4 l7 -8" stroke="#3f8cff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <!-- 人物 -->
          <g>
            <circle cx="410" cy="176" r="9" fill="#f0c1a0" />
            <path d="M400 172 q10 -12 20 0 q-4 -8 -10 -8 q-6 0 -10 8" fill="#4c445c" />
            <rect x="400" y="186" width="20" height="42" rx="8" fill="#5f6bd8" />
            <rect x="403" y="228" width="7" height="40" rx="3.5" fill="#3d3a52" />
            <rect x="411" y="228" width="7" height="40" rx="3.5" fill="#3d3a52" />
            <path d="M402 194 l-12 18" stroke="#5f6bd8" stroke-width="6" stroke-linecap="round" />
            <path d="M418 194 l14 10" stroke="#5f6bd8" stroke-width="6" stroke-linecap="round" />
          </g>
          <!-- 植物 -->
          <g>
            <rect x="452" y="322" width="18" height="20" rx="3" fill="#dbe4ee" />
            <path d="M461 322 C 455 300 445 292 440 288 C 452 292 460 304 461 322" fill="#69b891" />
            <path d="M461 322 C 467 302 476 294 482 290 C 470 296 463 306 461 322" fill="#8ecdb0" />
            <path d="M461 322 C 461 306 461 296 461 286" stroke="#4e9a77" stroke-width="2" fill="none" />
          </g>
        </svg>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-side">
        <div class="brand-row">
          <div class="brand-logo">志</div>
          <div class="brand-title">志愿填报升学规划系统</div>
        </div>
        <div class="brand-divider"></div>

        <div class="form-row">
          <label class="row-label">登录名</label>
          <el-input v-model="form.username" placeholder="" size="large" maxlength="30" @keyup.enter="handleLogin" />
        </div>
        <div class="form-row">
          <label class="row-label">密码</label>
          <el-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            size="large"
            maxlength="30"
            @keyup.enter="handleLogin"
          >
            <template #suffix>
              <el-icon class="eye-icon" @click="showPassword = !showPassword">
                <View v-if="showPassword" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-row">
          <label class="row-label">校验码</label>
          <div class="captcha-line">
            <el-input v-model="form.captchaCode" size="large" maxlength="4" class="captcha-input" @keyup.enter="handleLogin" />
            <img :src="captchaImage" class="captcha-img" title="点击更换" alt="校验码" @click="loadCaptcha" />
            <el-button class="captcha-refresh" :icon="Refresh" @click="loadCaptcha" />
          </div>
        </div>
        <div class="remember-row">
          <el-checkbox v-model="rememberMe">下次记住我</el-checkbox>
        </div>

        <button class="login-btn" :disabled="logging" @click="handleLogin">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
            <path d="M10 8l4 4-4 4" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M14 12H3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>系统登录</span>
        </button>

        <div class="error-line" v-if="errorText">{{ errorText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { login, getCaptcha } from '@/api/auth'
import { getUserDetail } from '@/api/auth'
import { encryptPasswordForLogin, resetRsaKeyCache } from '@/utils/rsa'

const REMEMBER_KEY = 'zytb_remember_username'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: localStorage.getItem(REMEMBER_KEY) || '',
  password: '',
  captchaCode: ''
})
const rememberMe = ref(!!localStorage.getItem(REMEMBER_KEY))
const showPassword = ref(false)
const captchaId = ref('')
const captchaImage = ref('')
const errorText = ref('')
const logging = ref(false)

onMounted(() => {
  loadCaptcha()
})

async function loadCaptcha() {
  errorText.value = ''
  try {
    const r = await getCaptcha()
    captchaId.value = r.captchaId
    captchaImage.value = r.image
  } catch {
    ElMessage.error('校验码加载失败, 请刷新页面')
  }
}

async function handleLogin() {
  errorText.value = ''
  if (!form.username.trim()) { errorText.value = '请输入登录名!'; return }
  if (!form.password) { errorText.value = '请输入密码!'; return }
  if (!form.captchaCode.trim()) { errorText.value = '请输入校验码!'; return }

  logging.value = true
  try {
    const { encryptedPassword } = await encryptPasswordForLogin(form.password)
    const res = await login({
      username: form.username.trim(),
      encryptedPassword,
      captchaId: captchaId.value,
      captchaCode: form.captchaCode.trim()
    })
    resetRsaKeyCache()

    // 记住登录名
    if (rememberMe.value) {
      localStorage.setItem(REMEMBER_KEY, form.username.trim())
    } else {
      localStorage.removeItem(REMEMBER_KEY)
    }

    userStore.setToken(res.token)
    localStorage.setItem('userId', String(res.userId))
    localStorage.setItem('role', res.role)
    localStorage.setItem('username', res.username)
    try {
      const detail = await getUserDetail(res.userId)
      userStore.setUserInfo({ ...detail, role: detail.role || res.role })
    } catch { /* 详情失败不阻塞登录 */ }

    ElMessage.success('登录成功')
    if (res.role === 'admin') router.push('/admin')
    else router.push('/student')
  } catch (e: any) {
    errorText.value = e.message || '登录失败, 请稍后重试'
    form.captchaCode = ''
    loadCaptcha()
  } finally {
    logging.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: #eef0f2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}

.login-card {
  width: 1040px;
  max-width: 100%;
  min-height: 560px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 10px 40px rgba(30, 40, 60, 0.08);
  display: flex;
  overflow: hidden;
}

/* 左侧插画区 */
.illu-side {
  flex: 1.35;
  background: linear-gradient(160deg, #f6f9fc 0%, #e9eff7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;

  .illu {
    width: 100%;
    max-width: 500px;
  }
}

/* 右侧表单区 */
.form-side {
  flex: 1;
  padding: 42px 52px 32px;
  display: flex;
  flex-direction: column;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 12px;

  .brand-logo {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e8543f, #c93a2c);
    color: #fff;
    font-size: 22px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(200, 60, 40, 0.3);
  }

  .brand-title {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
  }
}

.brand-divider {
  height: 1px;
  background: #e8e8e8;
  margin: 26px 0 34px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .row-label {
    width: 66px;
    text-align: right;
    margin-right: 14px;
    font-size: 14px;
    color: #333;
    flex-shrink: 0;
  }

  :deep(.el-input__wrapper) {
    height: 40px;
  }

  :deep(.el-input__wrapper.is-focus) {
    background: #eef5ff;
  }

  .eye-icon {
    cursor: pointer;
    color: #909399;
  }
}

.captcha-line {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;

  .captcha-input {
    width: 170px;
  }

  .captcha-img {
    width: 100px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    cursor: pointer;
    background: #f5f7fa;
  }

  .captcha-refresh {
    width: 40px;
    height: 40px;
    background: #67c23a;
    border-color: #67c23a;
    color: #fff;

    &:hover,
    &:focus {
      background: #76d14a;
      border-color: #76d14a;
      color: #fff;
    }

    :deep(.el-icon) {
      font-size: 18px;
    }
  }
}

.remember-row {
  margin: -4px 0 22px 80px;

  :deep(.el-checkbox__label) {
    font-size: 14px;
    color: #333;
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 4px;
  background: #3a7afe;
  color: #fff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #2f6ce8;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-icon {
    width: 18px;
    height: 18px;
  }
}

.error-line {
  margin-top: 18px;
  text-align: center;
  color: #f56c6c;
  font-size: 14px;
}
</style>
