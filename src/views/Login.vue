<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>
    <div class="bg-blob blob-3"></div>

    <!-- 背景竖排励志小语 -->
    <div class="side-quote quote-left" aria-hidden="true">有志者 · 事竟成</div>
    <div class="side-quote quote-right" aria-hidden="true">苦心人 · 天不负</div>

    <!-- 主励志语录（轮播） -->
    <div class="quote-stage" aria-live="polite">
      <Transition name="quote-fade" mode="out-in">
        <p class="main-quote" :key="quoteIndex">「 {{ quotes[quoteIndex] }} 」</p>
      </Transition>
      <span class="quote-from">—— 写给你的志愿时刻</span>
    </div>

    <div class="login-container">
      <!-- 左侧品牌区 -->
      <div class="login-left">
        <div class="deco deco-1"></div>
        <div class="deco deco-2"></div>
        <div class="deco deco-3"></div>

        <div class="brand">
          <img src="@/assets/logo.svg" alt="Logo" class="logo" />
          <div class="brand-text">
            <h1>志愿填报</h1>
            <p>河北省单招 · 对口升学智慧学习平台</p>
          </div>
        </div>

        <ul class="features">
          <li>
            <span class="icon-chip"><el-icon :size="20"><Reading /></el-icon></span>
            <div class="feature-text">
              <b>海量精品题库</b>
              <span>覆盖河北单招 / 对口全部考试类</span>
            </div>
          </li>
          <li>
            <span class="icon-chip"><el-icon :size="20"><MagicStick /></el-icon></span>
            <div class="feature-text">
              <b>AI 智能学习助手</b>
              <span>薄弱点分析 · 学习报告 · 志愿推荐</span>
            </div>
          </li>
          <li>
            <span class="icon-chip"><el-icon :size="20"><Notebook /></el-icon></span>
            <div class="feature-text">
              <b>错题本自动归集</b>
              <span>反复练习，直至完全掌握</span>
            </div>
          </li>
        </ul>

        <div class="brand-footer">
          <span>10 大考试类</span><i></i><span>119 所院校数据</span><i></i><span>AI 智能陪学</span>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="login-right">
        <div class="form-wrap">
          <h2>欢迎回来 👋</h2>
          <p class="subtitle">登录你的学习账号，继续今天的学习计划</p>

          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large" @submit.prevent>
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="手机号" prefix-icon="User" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleLogin">
              {{ loading ? '登录中…' : '登 录' }}
            </el-button>
          </el-form>

          <div class="forgot-row">
            <el-link type="primary" :underline="false" @click="router.push('/forgot-password')">忘记密码？</el-link>
          </div>

          <div class="role-hint">
            <el-icon><InfoFilled /></el-icon>
            学生 / 老师 / 管理员 统一入口
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Reading, MagicStick, Notebook, InfoFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/auth'
import { getUserDetail } from '@/api/auth'
import { encryptPasswordForLogin, resetRsaKeyCache } from '@/utils/rsa'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

// 背景励志语录轮播
const quotes = [
  '愿你合上笔盖的那一刻，有着侠客收刀入鞘的骄傲',
  '乾坤未定，你我皆是黑马',
  '星光不问赶路人，时光不负有心人',
  '书山有路勤为径，学海无涯苦作舟',
  '道阻且长，行则将至；行而不辍，未来可期',
  '你只管努力，剩下的交给时间'
]
const quoteIndex = ref(0)
let quoteTimer: number | undefined
onMounted(() => {
  quoteTimer = window.setInterval(() => {
    quoteIndex.value = (quoteIndex.value + 1) % quotes.length
  }, 6000)
})
onUnmounted(() => window.clearInterval(quoteTimer))

// 登录表单
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      // 用 RSA 公钥加密密码，不明文传输
      const { encryptedPassword } = await encryptPasswordForLogin(loginForm.password)
      const res = await login({
        username: loginForm.username,
        password: encryptedPassword ? '' : loginForm.password,
        encryptedPassword
      })
      userStore.setToken(res.token)
      localStorage.setItem('userId', String(res.userId))
      userStore.setUserInfo({
        id: res.userId,
        username: res.username,
        realName: res.realName,
        role: res.role as any,
        avatar: '',
        phone: '',
        nickname: '',
        email: '',
        gender: 2,
        signature: ''
      })
      // 登录后拉取完整用户信息（含头像/昵称/签名）
      try {
        const detail = await getUserDetail(res.userId)
        userStore.setUserInfo({
          ...detail,
          role: res.role
        } as any)
      } catch {
        /* 拉取失败不阻塞登录 */
      }
      // 登录成功后重置公钥缓存，防止服务重启后密钥对变化导致下次解密失败
      resetRsaKeyCache()
      // 跳转到对应角色首页
      if (res.role === 'admin') {
        router.push('/admin')
      } else if (res.role === 'teacher') {
        router.push('/teacher')
      } else {
        router.push('/student')
      }
    } catch (e: any) {
      // 失败可能是服务端换了密钥对，下次提交时重新获取公钥
      resetRsaKeyCache()
      ElMessage.error(e.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, #0d2a5c 0%, #123f8f 45%, #1a56c4 100%);
  padding: 24px;
  gap: 26px;
}

/* 页面背景光斑 */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.45;
  pointer-events: none;

  &.blob-1 {
    width: 480px;
    height: 480px;
    background: #3b82f6;
    top: -160px;
    left: -120px;
  }
  &.blob-2 {
    width: 420px;
    height: 420px;
    background: #06b6d4;
    bottom: -140px;
    right: -100px;
  }
  &.blob-3 {
    width: 300px;
    height: 300px;
    background: #6366f1;
    bottom: 10%;
    left: 18%;
    opacity: 0.3;
  }
}

/* ---------- 背景竖排小语 ---------- */
.side-quote {
  position: absolute;
  writing-mode: vertical-rl;
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: 20px;
  letter-spacing: 10px;
  color: rgba(255, 255, 255, 0.16);
  user-select: none;
  pointer-events: none;

  &.quote-left {
    left: 5vw;
    bottom: 8vh;
  }

  &.quote-right {
    right: 5vw;
    top: 8vh;
  }
}

/* ---------- 主励志语录 ---------- */
.quote-stage {
  position: relative;
  z-index: 1;
  text-align: center;
  min-height: 74px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .main-quote {
    margin: 0;
    font-family: 'KaiTi', 'STKaiti', serif;
    font-size: 24px;
    letter-spacing: 4px;
    color: rgba(255, 255, 255, 0.88);
    text-shadow: 0 2px 12px rgba(4, 22, 60, 0.4);
  }

  .quote-from {
    font-size: 12px;
    letter-spacing: 3px;
    color: rgba(255, 255, 255, 0.45);
  }
}

.quote-fade-enter-active,
.quote-fade-leave-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ---------- 卡片 ---------- */
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 980px;
  max-width: 100%;
  min-height: 560px;
  background: #fff;
  border-radius: 24px;
  box-shadow:
    0 30px 80px rgba(4, 22, 60, 0.45),
    0 4px 16px rgba(4, 22, 60, 0.2);
  overflow: hidden;
}

/* ---------- 左侧品牌区 ---------- */
.login-left {
  flex: 1.15;
  position: relative;
  background: linear-gradient(160deg, #2b6ef5 0%, #1e56d6 55%, #173fa8 100%);
  color: #fff;
  padding: 52px 48px 40px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .deco {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;

    &.deco-1 {
      width: 260px;
      height: 260px;
      border: 1.5px solid rgba(255, 255, 255, 0.14);
      top: -90px;
      right: -70px;
    }
    &.deco-2 {
      width: 170px;
      height: 170px;
      background: rgba(255, 255, 255, 0.07);
      bottom: -60px;
      left: -50px;
    }
    &.deco-3 {
      width: 90px;
      height: 90px;
      background: rgba(255, 255, 255, 0.09);
      top: 46%;
      right: 12%;
    }
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;

    .logo {
      width: 52px;
      height: 52px;
      flex-shrink: 0;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25));
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    p {
      margin-top: 4px;
      opacity: 0.82;
      font-size: 13px;
      letter-spacing: 0.5px;
    }
  }

  .features {
    list-style: none;
    padding: 0;
    margin: auto 0;
    display: flex;
    flex-direction: column;
    gap: 26px;
    position: relative;

    li {
      display: flex;
      align-items: center;
      gap: 14px;

      .icon-chip {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.14);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .feature-text {
        display: flex;
        flex-direction: column;
        gap: 2px;

        b {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        span {
          font-size: 12.5px;
          opacity: 0.78;
        }
      }
    }
  }

  .brand-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12.5px;
    opacity: 0.72;
    position: relative;

    i {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
    }
  }
}

/* ---------- 右侧表单区 ---------- */
.login-right {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  align-items: center;

  .form-wrap {
    width: 100%;
    padding: 48px 44px;

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .subtitle {
      margin: 8px 0 30px;
      font-size: 14px;
      color: #6b7280;
    }

    :deep(.el-input__wrapper) {
      border-radius: 10px;
      padding: 4px 14px;
      box-shadow: 0 0 0 1px #e5e7eb inset;
      transition: box-shadow 0.2s;

      &:hover {
        box-shadow: 0 0 0 1px #c6d4f0 inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 2px #2b6ef5 inset;
      }
    }

    :deep(.el-form-item) {
      margin-bottom: 20px;
    }

    .submit-btn {
      width: 100%;
      height: 46px;
      margin-top: 4px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      letter-spacing: 6px;
      background: linear-gradient(90deg, #2b6ef5 0%, #1e56d6 100%);
      box-shadow: 0 6px 16px rgba(43, 110, 245, 0.35);
      transition:
        transform 0.15s,
        box-shadow 0.15s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 20px rgba(43, 110, 245, 0.45);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .forgot-row {
      text-align: center;
      margin-top: 16px;

      .el-link {
        font-size: 13px;
      }
    }

    .role-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      margin-top: 26px;
      padding-top: 18px;
      border-top: 1px dashed #e5e7eb;
      color: #9ca3af;
      font-size: 12.5px;
    }
  }
}

/* ---------- 响应式 ---------- */
@media (max-width: 860px) {
  .login-left {
    display: none;
  }

  .login-right {
    width: 100%;
  }

  .side-quote {
    display: none;
  }
}

@media (max-height: 780px) {
  .quote-stage {
    min-height: 0;

    .main-quote {
      font-size: 19px;
    }

    .quote-from {
      display: none;
    }
  }
}
</style>
