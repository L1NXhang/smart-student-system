<template>
  <div class="auth-container">
    <ParticlesBackground :count="30" color="rgba(245, 158, 11, 0.1)" />
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
          <h1 class="system-name">
            <ShinyText color="#ffffff" :speed="5">智慧学工系统</ShinyText>
          </h1>
          <p class="system-subtitle">Smart Student Affairs System</p>
        </div>
        <p class="auth-slogan">
          <DecryptedText text="首次登录，请修改密码" :speed="50" />
        </p>
      </div>

      <!-- Right: Change Password Form -->
      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2 class="form-title">
            <GradientText from="#f59e0b" to="#ef4444">修改密码</GradientText>
          </h2>
          <p class="form-desc">为保障账户安全，首次登录请设置新密码</p>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="auth-form"
            @keyup.enter="handleSubmit"
          >
            <div
              v-for="(item, index) in formItems"
              :key="index"
              class="form-item-animate"
              :ref="el => { if (el) itemRefs[index] = el }"
            >
              <el-form-item v-if="item.type === 'password'" :prop="item.prop">
                <el-input
                  v-model="form[item.prop]"
                  type="password"
                  :placeholder="item.placeholder"
                  :prefix-icon="item.icon"
                  show-password
                  size="large"
                />
                <!-- Password strength indicator for new password -->
                <div
                  v-if="item.prop === 'newPassword' && form.newPassword.length > 0"
                  class="password-strength"
                >
                  <div class="strength-bars">
                    <span
                      v-for="level in 3"
                      :key="level"
                      class="strength-bar"
                      :class="strengthBarClass(level)"
                    ></span>
                  </div>
                  <span class="strength-text" :class="strengthTextClass">{{ strengthLabel }}</span>
                </div>
              </el-form-item>

              <el-form-item v-else-if="item.type === 'button'">
                <el-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  class="submit-btn"
                  @click="handleSubmit"
                >
                  {{ loading ? '提交中...' : '确认修改' }}
                </el-button>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { ParticlesBackground, ShinyText, GradientText, DecryptedText } from '@/components/react-bits'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { changePassword } from '@/api/auth'

const router = useRouter()
const store = useUserStore()

const cardRef = ref(null)
const formRef = ref(null)
const itemRefs = reactive({})
const loading = ref(false)

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// ---- Password strength computation ----
const strengthLevel = computed(() => {
  const pwd = form.newPassword || ''
  if (pwd.length === 0) return 0
  let score = 0
  if (pwd.length >= 8) score++
  if (/[a-zA-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  if (pwd.length >= 12) score++
  return Math.min(score, 3)
})

const strengthLabel = computed(() => {
  const labels = ['', '弱', '中', '强']
  return labels[strengthLevel.value] || ''
})

const strengthTextClass = computed(() => {
  return `text-${['', 'weak', 'medium', 'strong'][strengthLevel.value] || ''}`
})

function strengthBarClass(level) {
  if (strengthLevel.value >= level) {
    return ['bar-weak', 'bar-medium', 'bar-strong'][level - 1]
  }
  return ''
}

// ---- Validation ----
const validateNewPassword = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
    return
  }
  if (value.length < 8) {
    callback(new Error('密码长度不能少于8位'))
    return
  }
  const hasLetter = /[a-zA-Z]/.test(value)
  const hasDigit = /\d/.test(value)
  if (!hasLetter || !hasDigit) {
    callback(new Error('密码必须包含字母和数字'))
    return
  }
  callback()
}

const validateConfirmPassword = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  newPassword:     [{ required: true, validator: validateNewPassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}

const formItems = [
  { type: 'password', prop: 'newPassword',     placeholder: '新密码',   icon: h(Lock) },
  { type: 'password', prop: 'confirmPassword', placeholder: '确认新密码', icon: h(Lock) },
  { type: 'button',   prop: 'submit' },
]

function shakeInput() {
  const inputs = document.querySelectorAll('.auth-form .el-input')
  inputs.forEach(el => {
    gsap.fromTo(el, { x: 0 }, { x: -5, duration: 0.05, repeat: 3, yoyo: true, ease: 'power2.inOut' })
  })
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await changePassword(form.currentPassword || '', form.newPassword)
    // Clear first-login flag
    localStorage.removeItem('smart_student_first_login')
    ElMessage.success('密码修改成功')
    if (store.isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '密码修改失败，请稍后重试'
    ElMessage.error(msg)
    shakeInput()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  gsap.fromTo(
    cardRef.value,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
  )

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

/* ---- Password Strength ---- */
.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: #e5e7eb;
  transition: background 0.3s;
}

.strength-bar.bar-weak {
  background: #ef4444;
}

.strength-bar.bar-medium {
  background: #f59e0b;
}

.strength-bar.bar-strong {
  background: #10b981;
}

.strength-text {
  font-size: 11px;
  font-weight: 500;
  min-width: 20px;
  text-align: right;
}

.strength-text.text-weak {
  color: #ef4444;
}

.strength-text.text-medium {
  color: #f59e0b;
}

.strength-text.text-strong {
  color: #10b981;
}

.submit-btn {
  width: 100%;
  border-radius: 10px;
  font-size: 15px;
  letter-spacing: 4px;
  height: 44px;
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


  .system-name {
    font-size: 22px;
  }

  .auth-right {
    padding: 32px 28px;
  }
}
</style>
