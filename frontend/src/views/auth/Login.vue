<template>
  <div class="auth-container">
    <div class="auth-card" ref="cardRef">
      <!-- Left: Illustration / Branding -->
      <div class="auth-left">
        <div class="auth-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="16" fill="currentColor" fill-opacity="0.12"/>
              <path d="M20 44V24l12 8 12-8v20" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M32 32v12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              <circle cx="32" cy="20" r="3" fill="currentColor"/>
            </svg>
          </div>
          <h1 class="system-name">智慧学工系统</h1>
          <p class="system-subtitle">Smart Student Affairs System</p>
        </div>
        <div class="auth-illustration">
          <svg viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="60" y="40" width="180" height="140" rx="14" fill="currentColor" fill-opacity="0.07"/>
            <rect x="80" y="65" width="140" height="8" rx="4" fill="currentColor" fill-opacity="0.2"/>
            <rect x="80" y="83" width="100" height="6" rx="3" fill="currentColor" fill-opacity="0.13"/>
            <rect x="80" y="97" width="120" height="6" rx="3" fill="currentColor" fill-opacity="0.13"/>
            <circle cx="130" cy="150" r="20" fill="currentColor" fill-opacity="0.15"/>
            <path d="M130 140v20m-10-10h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
            <circle cx="110" cy="200" r="8" fill="currentColor" fill-opacity="0.1"/>
            <circle cx="150" cy="205" r="6" fill="currentColor" fill-opacity="0.08"/>
            <circle cx="185" cy="198" r="9" fill="currentColor" fill-opacity="0.1"/>
          </svg>
        </div>
        <p class="auth-slogan">以学生为本，用智慧服务成长</p>
      </div>

      <!-- Right: Login Form -->
      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2 class="form-title">欢迎登录</h2>
          <p class="form-desc">请输入您的账号信息</p>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="auth-form"
            @keyup.enter="handleLogin"
          >
            <div
              v-for="(item, index) in formItems"
              :key="index"
              class="form-item-animate"
              :ref="el => { if (el) itemRefs[index] = el }"
            >
              <el-form-item v-if="item.type === 'input'" :prop="item.prop">
                <el-input
                  v-model="form[item.prop]"
                  :placeholder="item.placeholder"
                  :prefix-icon="item.icon"
                  size="large"
                />
              </el-form-item>

              <el-form-item v-else-if="item.type === 'password'" :prop="item.prop">
                <el-input
                  v-model="form[item.prop]"
                  type="password"
                  :placeholder="item.placeholder"
                  :prefix-icon="item.icon"
                  show-password
                  size="large"
                />
              </el-form-item>

              <el-form-item v-else-if="item.type === 'checkbox'" prop="remember">
                <el-checkbox v-model="form.remember">记住我</el-checkbox>
              </el-form-item>

              <el-form-item v-else-if="item.type === 'button'">
                <el-button
                  ref="loginBtnRef"
                  type="primary"
                  size="large"
                  :loading="loading"
                  class="login-btn"
                  @click="handleLogin"
                >
                  {{ loading ? '登录中...' : '登 录' }}
                </el-button>
              </el-form-item>
            </div>
          </el-form>

          <div class="auth-link">
            还没有账号？<router-link to="/register">立即注册</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const store = useUserStore()

const cardRef = ref(null)
const loginBtnRef = ref(null)
const formRef = ref(null)
const itemRefs = reactive({})
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const rules = {
  username: [{ required: true, message: '请输入学号/工号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const formItems = [
  { type: 'input',    prop: 'username',  placeholder: '学号/工号',  icon: h(User) },
  { type: 'password', prop: 'password',  placeholder: '密码',       icon: h(Lock) },
  { type: 'checkbox', prop: 'remember' },
  { type: 'button',   prop: 'submit' },
]

function shakeInput() {
  const inputs = document.querySelectorAll('.auth-form .el-input')
  inputs.forEach(el => {
    gsap.fromTo(el, { x: 0 }, { x: -5, duration: 0.05, repeat: 3, yoyo: true, ease: 'power2.inOut' })
  })
}

async function handleLogin() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await store.login(form.username, form.password)
    ElMessage.success('登录成功')
    if (store.isAdmin) { router.push('/admin/dashboard') } else { router.push('/dashboard') }
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '登录失败，请检查账号和密码'
    ElMessage.error(msg)
    shakeInput()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Card slides up + fades in
  gsap.fromTo(
    cardRef.value,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
  )

  // Form items stagger in from left
  gsap.fromTo(
    Object.values(itemRefs),
    { x: -20, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.3,
    }
  )

  // Button hover: slight scale up
  if (loginBtnRef.value) {
	    const btnEl = loginBtnRef.value.$el || loginBtnRef.value
	    if (btnEl && btnEl.addEventListener) {
	      btnEl.addEventListener('mouseenter', () => {
	        gsap.to(btnEl, { scale: 1.02, duration: 0.2, ease: 'power2.out' })
	      })
	      btnEl.addEventListener('mouseleave', () => {
	        gsap.to(btnEl, { scale: 1, duration: 0.2, ease: 'power2.out' })
	      })
	    }
  }
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 40%, #fdf2f8 100%);
  padding: 20px;
}

.auth-card {
  display: flex;
  width: 820px;
  min-height: 520px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(64, 128, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* ---- Left Branding ---- */
.auth-left {
  flex: 0 0 380px;
  background: linear-gradient(160deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 36px;
  position: relative;
  overflow: hidden;
}

.auth-left::before {
  content: '';
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  top: -60px;
  right: -80px;
}

.auth-left::after {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  bottom: -40px;
  left: -50px;
}

.auth-logo {
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: #fff;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.system-name {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px;
  letter-spacing: 2px;
}

.system-subtitle {
  font-size: 13px;
  opacity: 0.75;
  margin: 0;
  letter-spacing: 1px;
  font-weight: 300;
}

.auth-illustration {
  width: 200px;
  margin: 24px 0;
  position: relative;
  z-index: 1;
  color: #fff;
}

.auth-illustration svg {
  width: 100%;
  height: auto;
}

.auth-slogan {
  font-size: 13px;
  opacity: 0.7;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* ---- Right Form ---- */
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 48px;
}

.auth-form-wrapper {
  width: 100%;
  max-width: 300px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px;
}

.form-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 28px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
  transition: box-shadow 0.25s;
}

.auth-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #93c5fd inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #3b82f6 inset;
}

.login-btn {
  width: 100%;
  border-radius: 10px;
  font-size: 15px;
  letter-spacing: 4px;
  height: 44px;
}

.auth-link {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  margin-top: 12px;
}

.auth-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.auth-link a:hover {
  text-decoration: underline;
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .auth-card {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
    min-height: auto;
  }

  .auth-left {
    flex: none;
    padding: 32px 24px;
  }

  .auth-illustration {
    display: none;
  }

  .system-name {
    font-size: 22px;
  }

  .auth-right {
    padding: 32px 28px;
  }
}
</style>
