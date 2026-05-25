<template>
  <div class="auth-container">
    <AuroraBackground :speed="0.6" :intensity="2.0" color1="#4fc3f7" color2="#66bb6a" color3="#ab47bc" color4="#64ffda" />
    <div class="auth-card" ref="cardRef">
      <!-- Left: Illustration / Branding -->
      <div class="auth-left">
        <div class="auth-logo">
          <div class="logo-icon">
            <img src="@/assets/logo.png" alt="校徽" class="school-logo" />
          </div>
          <h1 class="system-name">
            <ShinyText color="#ffffff" :speed="10">智慧学工系统</ShinyText>
          </h1>
          <p class="system-subtitle">Smart Student Affairs System</p>
        </div>
        <p class="auth-slogan">
          <BlurText text="以学生为本，用智慧服务成长" :duration="0.6" :stagger="0.04" />
        </p>
      </div>

      <!-- Right: Register Form -->
      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2 class="form-title">
            <GradientText from="#8b5cf6" to="#ec4899">创建账号</GradientText>
          </h2>
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
                <!-- Password strength indicator (only for password, not confirmPassword) -->
                <div
                  v-if="item.prop === 'password' && form.password.length > 0"
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

              <el-form-item v-else-if="item.type === 'select'" :prop="item.prop">
                <el-select
                  v-model="form[item.prop]"
                  :placeholder="item.placeholder"
                  size="large"
                  style="width:100%"
                >
                  <el-option
                    v-for="opt in item.options"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
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
import { ref, reactive, onMounted, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { ShinyText, GradientText, BlurText, AuroraBackground } from '@/components/react-bits'
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
  college: '',
  major: '',
  grade: '',
  password: '',
  confirmPassword: '',
})

const collegeOptions = [
  { label: '计算机学院', value: '计算机学院' },
  { label: '电子信息工程学院', value: '电子信息工程学院' },
  { label: '外国语学院', value: '外国语学院' },
  { label: '数学与信息学院', value: '数学与信息学院' },
  { label: '物理与天文学院', value: '物理与天文学院' },
  { label: '文学院', value: '文学院' },
  { label: '商学院', value: '商学院' },
  { label: '政治与行政学院', value: '政治与行政学院' },
]

const currentYear = new Date().getFullYear()
const gradeOptions = Array.from({ length: 6 }, (_, i) => {
  const y = currentYear - i
  return { label: `${y}级`, value: `${y}级` }
})

// ---- Password strength validation ----
const validatePassword = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
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
  college:         [{ required: true, message: '请选择学院', trigger: 'change' }],
  major:           [{ required: true, message: '请输入专业', trigger: 'blur' }],
  grade:           [{ required: true, message: '请选择年级', trigger: 'change' }],
  password:        [{ required: true, validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}

const formItems = [
  { type: 'input',    prop: 'name',     placeholder: '姓名',   icon: h(User) },
  { type: 'input',    prop: 'username', placeholder: '学号',   icon: h(User) },
  { type: 'input',    prop: 'phone',    placeholder: '联系方式', icon: h(Phone) },
  { type: 'select',   prop: 'college',  placeholder: '请选择学院', options: collegeOptions },
  { type: 'input',    prop: 'major',    placeholder: '专业（如：计算机科学与技术）', icon: h(User) },
  { type: 'select',   prop: 'grade',    placeholder: '请选择年级', options: gradeOptions },
  { type: 'password', prop: 'password', placeholder: '密码',   icon: h(Lock) },
  { type: 'password', prop: 'confirmPassword', placeholder: '确认密码', icon: h(Lock) },
  { type: 'button',   prop: 'submit' },
]

// ---- Password strength computation ----
const strengthLevel = computed(() => {
  const pwd = form.password || ''
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
      college: form.college,
      major: form.major,
      grade: form.grade,
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '注册失败，请稍后重试'
    ElMessage.error(msg)
    shakeInput()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.fromTo(cardRef.value, { y: 40, opacity: 0, scale: 0.96 },
    { y: 0, opacity: 1, scale: 1, duration: 0.7 })
  tl.fromTo(Object.values(itemRefs), { x: -24, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.45, stagger: 0.1 }, '-=0.3')
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
  width: 880px;
  min-height: 680px;
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
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  color: #fff;
}

.school-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
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

.auth-form :deep(.el-select) {
  width: 100%;
}

.auth-form :deep(.el-select .el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
  transition: box-shadow 0.25s;
}

.auth-form :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #93c5fd inset;
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


  .system-name {
    font-size: 22px;
  }

  .auth-right {
    padding: 32px 28px;
  }
}
</style>
