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
            <circle cx="130" cy="150" r="20" fill="currentColor" fill-opacity="0.15"/>
            <path d="M130 140v20m-10-10h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
            <rect x="75" y="105" width="60" height="4" rx="2" fill="currentColor" fill-opacity="0.1"/>
            <circle cx="165" cy="107" r="10" fill="currentColor" fill-opacity="0.08"/>
          </svg>
        </div>
        <p class="auth-slogan">以学生为本，用智慧服务成长</p>
      </div>

      <!-- Right: Register Form -->
      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2 class="form-title">创建账号</h2>
          <p class="form-desc">填写以下信息完成注册</p>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="auth-form"
            @keyup.enter="handleRegister"
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

              <el-form-item v-else-if="item.type === 'button'">
                <el-button
                  ref="registerBtnRef"
                  type="primary"
                  size="large"
                  :loading="loading"
                  class="register-btn"
                  @click="handleRegister"
                >
                  {{ loading ? '注册中...' : '注 册' }}
                </el-button>
              </el-form-item>
            </div>
          </el-form>

          <div class="auth-link">
            已有账号？<router-link to="/login">返回登录</router-link>
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
import { User, Lock, Phone } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const store = useUserStore()

const cardRef = ref(null)
const registerBtnRef = ref(null)
const formRef = ref(null)
const itemRefs = reactive({})
const loading = ref(false)

const form = reactive({
  name: '',
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  name:            [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username:        [{ required: true, message: '请输入学号', trigger: 'blur' }],
  phone:           [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  password:        [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}

const formItems = [
  { type: 'input',    prop: 'name',     placeholder: '姓名',   icon: h(User) },
  { type: 'input',    prop: 'username', placeholder: '学号',   icon: h(User) },
  { type: 'input',    prop: 'phone',    placeholder: '联系方式', icon: h(Phone) },
  { type: 'password', prop: 'password', placeholder: '密码',   icon: h(Lock) },
  { type: 'password', prop: 'confirmPassword', placeholder: '确认密码', icon: h(Lock) },
  { type: 'button',   prop: 'submit' },
]

function shakeInput() {
  const inputs = document.querySelectorAll('.auth-form .el-input')
  inputs.forEach(el => {
    gsap.fromTo(el, { x: 0 }, { x: -5, duration: 0.05, repeat: 3, yoyo: true, ease: 'power2.inOut' })
  })
}

async function handleRegister() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    await store.register({
      username: form.username,
      password: form.password,
      name: form.name,
      phone: form.phone,
    })
    ElMessage.success('注册成功，请等待审核')
    ElMessage.info('注册成功，请等待管理员审核'); router.push('/login')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '注册失败，请稍后重试'
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
  if (registerBtnRef.value) {
    const btnEl = registerBtnRef.value.$el || registerBtnRef.value
    btnEl.addEventListener('mouseenter', () => {
      gsap.to(btnEl, { scale: 1.02, duration: 0.2, ease: 'power2.out' })
    })
    btnEl.addEventListener('mouseleave', () => {
      gsap.to(btnEl, { scale: 1, duration: 0.2, ease: 'power2.out' })
    })
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
  min-height: 580px;
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

.register-btn {
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
