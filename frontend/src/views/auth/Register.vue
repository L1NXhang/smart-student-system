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
        <div class="auth-form-wrapper" ref="formWrapperRef">
          <h2 class="form-title">
            <GradientText from="#8b5cf6" to="#ec4899">创建账号</GradientText>
          </h2>
          <p class="form-desc">填写以下信息完成注册</p>

          <!-- Step Indicator -->
          <div class="step-indicator" ref="stepIndicatorRef">
            <div class="step-dot" :class="{ active: currentStep >= 0, done: currentStep > 0 }">
              <span v-if="currentStep > 0">&#10003;</span>
              <span v-else>1</span>
            </div>
            <div class="step-line" :class="{ done: currentStep > 0 }"></div>
            <div class="step-dot" :class="{ active: currentStep >= 1, done: currentStep > 1 }">
              <span v-if="currentStep > 1">&#10003;</span>
              <span v-else>2</span>
            </div>
            <div class="step-line" :class="{ done: currentStep > 1 }"></div>
            <div class="step-dot" :class="{ active: currentStep >= 2 }">
              <span>3</span>
            </div>
          </div>
          <div class="step-labels">
            <span :class="{ active: currentStep >= 0 }">账号信息</span>
            <span :class="{ active: currentStep >= 1 }">学籍信息</span>
            <span :class="{ active: currentStep >= 2 }">设置密码</span>
          </div>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="auth-form"
            @keyup.enter="handleEnter"
          >
            <!-- Step 0: Account Info -->
            <Transition name="step-fade" mode="out-in">
              <div v-if="currentStep === 0" key="step0" class="step-fields">
                <el-form-item prop="name">
                  <el-input
                    v-model="form.name"
                    placeholder="姓名"
                    :prefix-icon="User"
                    size="large"
                  />
                </el-form-item>
                <el-form-item prop="username">
                  <el-input
                    v-model="form.username"
                    placeholder="学号"
                    :prefix-icon="User"
                    size="large"
                  />
                </el-form-item>
                <el-form-item prop="phone">
                  <el-input
                    v-model="form.phone"
                    placeholder="联系方式"
                    :prefix-icon="Phone"
                    size="large"
                  />
                </el-form-item>
              </div>

              <!-- Step 1: Academic Info -->
              <div v-else-if="currentStep === 1" key="step1" class="step-fields">
                <el-form-item prop="college">
                  <el-select
                    v-model="form.college"
                    placeholder="请选择学院"
                    size="large"
                    style="width:100%"
                  >
                    <el-option
                      v-for="opt in collegeOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item prop="major">
                  <el-input
                    v-model="form.major"
                    placeholder="专业（如：计算机科学与技术）"
                    :prefix-icon="User"
                    size="large"
                  />
                </el-form-item>
                <el-form-item prop="grade">
                  <el-select
                    v-model="form.grade"
                    placeholder="请选择年级"
                    size="large"
                    style="width:100%"
                  >
                    <el-option
                      v-for="opt in gradeOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <!-- Step 2: Password + Captcha -->
              <div v-else-if="currentStep === 2" key="step2" class="step-fields">
                <el-form-item prop="password">
                  <el-input
                    v-model="form.password"
                    type="password"
                    placeholder="密码（8位以上，含字母和数字）"
                    :prefix-icon="Lock"
                    show-password
                    size="large"
                  />
                  <div v-if="form.password.length > 0" class="password-strength">
                    <div class="strength-bars">
                      <span v-for="level in 3" :key="level" class="strength-bar" :class="strengthBarClass(level)"></span>
                    </div>
                    <span class="strength-text" :class="strengthTextClass">{{ strengthLabel }}</span>
                  </div>
                </el-form-item>
                <el-form-item prop="confirmPassword">
                  <el-input
                    v-model="form.confirmPassword"
                    type="password"
                    placeholder="确认密码"
                    :prefix-icon="Lock"
                    show-password
                    size="large"
                  />
                </el-form-item>

                <!-- Captcha -->
                <div class="captcha-section" ref="captchaRef">
                  <p class="captcha-label">安全验证</p>
                  <div class="captcha-track" ref="trackRef" @mousedown="onDragStart" @touchstart.prevent="onDragStart">
                    <div class="captcha-track-bg" :style="{ width: captchaProgress + '%' }" />
                    <div
                      class="captcha-slider"
                      ref="sliderRef"
                      :class="{ passed: captchaPassed }"
                      :style="{ left: sliderLeft + 'px' }"
                      @mousedown.stop="onDragStart"
                      @touchstart.stop.prevent="onDragStart"
                    >
                      <span v-if="captchaPassed">&#10003;</span>
                      <span v-else>&rarr;</span>
                    </div>
                    <span class="captcha-hint" :class="{ success: captchaPassed }">
                      {{ captchaPassed ? '✓ 验证通过' : '请按住滑块拖动到最右边' }}
                    </span>
                  </div>
                </div>

                <!-- Register Button -->
                <el-form-item style="margin-top: 8px">
                  <el-button
                    ref="registerBtnRef"
                    type="primary"
                    size="large"
                    :loading="loading"
                    :disabled="loading || !captchaPassed"
                    class="register-btn"
                    @click="handleRegister"
                  >
                    {{ loading ? '注册中...' : '注 册' }}
                  </el-button>
                </el-form-item>
              </div>
            </Transition>
          </el-form>

          <!-- Step Navigation -->
          <div class="step-nav">
            <el-button v-if="currentStep > 0" size="large" @click="prevStep" class="nav-btn">上一步</el-button>
            <el-button v-if="currentStep < 2" type="primary" size="large" @click="nextStep" class="nav-btn">下一步</el-button>
          </div>

          <div class="auth-link">
            已有账号？<router-link to="/login">返回登录</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
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
const formWrapperRef = ref(null)
const stepIndicatorRef = ref(null)
const captchaRef = ref(null)
const trackRef = ref(null)
const sliderRef = ref(null)
const loading = ref(false)
const currentStep = ref(0)

const isTestMode = import.meta.env.VITE_TEST_MODE === '1'

// ─── Captcha state ───
const captchaPassed = ref(false)
const sliderLeft = ref(0)
const captchaProgress = ref(0)
let isDragging = false
let trackWidth = 300
let maxLeft = 200
let sliderWidth = 40

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

// ─── Step field config ───
const stepFields = [
  ['name', 'username', 'phone'],
  ['college', 'major', 'grade'],
  ['password', 'confirmPassword'],
]

// ─── Validation rules ───
const validatePassword = (_rule, value, callback) => {
  if (!value) { callback(new Error('请输入密码')); return }
  if (value.length < 8) { callback(new Error('密码长度不能少于8位')); return }
  const hasLetter = /[a-zA-Z]/.test(value)
  const hasDigit = /\d/.test(value)
  if (!hasLetter || !hasDigit) { callback(new Error('密码必须包含字母和数字')); return }
  callback()
}

const validateConfirmPassword = (_rule, value, callback) => {
  if (!value) { callback(new Error('请再次输入密码')) }
  else if (value !== form.password) { callback(new Error('两次输入的密码不一致')) }
  else { callback() }
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

// ─── Password strength ───
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

const strengthTextClass = computed(() => `text-${['', 'weak', 'medium', 'strong'][strengthLevel.value] || ''}`)

function strengthBarClass(level) {
  if (strengthLevel.value >= level) return ['bar-weak', 'bar-medium', 'bar-strong'][level - 1]
  return ''
}

// ─── Slider captcha ───
function onDragStart(e) {
  if (captchaPassed.value) return
  isDragging = true
  trackWidth = trackRef.value.clientWidth
  sliderWidth = sliderRef.value ? sliderRef.value.clientWidth : 42
  maxLeft = trackWidth - sliderWidth
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const rect = trackRef.value.getBoundingClientRect()
  sliderLeft.value = Math.max(0, Math.min(clientX - rect.left - sliderWidth / 2, maxLeft))
  window.addEventListener('mousemove', onDragging)
  window.addEventListener('mouseup', onDragEnd)
  window.addEventListener('touchmove', onDragging, { passive: false })
  window.addEventListener('touchend', onDragEnd)
}

function onDragging(e) {
  if (!isDragging) return
  e.preventDefault()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const rect = trackRef.value.getBoundingClientRect()
  sliderLeft.value = Math.max(0, Math.min(clientX - rect.left - sliderWidth / 2, maxLeft))
  captchaProgress.value = (sliderLeft.value / maxLeft) * 100
}

function onDragEnd() {
  if (!isDragging) return
  isDragging = false
  window.removeEventListener('mousemove', onDragging)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchmove', onDragging)
  window.removeEventListener('touchend', onDragEnd)

  if (sliderLeft.value >= maxLeft - 5) {
    sliderLeft.value = maxLeft
    captchaProgress.value = 100
    captchaPassed.value = true
    if (sliderRef.value) {
      gsap.to(sliderRef.value, { boxShadow: '0 0 12px rgba(16,185,129,0.6)', duration: 0.4 })
    }
  } else {
    gsap.to(sliderLeft, { value: 0, duration: 0.4, ease: 'power2.out',
      onUpdate() { captchaProgress.value = (sliderLeft.value / maxLeft) * 100 },
    })
  }
}

// ─── Step navigation ───
async function nextStep() {
  if (!formRef.value) return
  const fields = stepFields[currentStep.value]
  try {
    for (const field of fields) {
      await formRef.value.validateField(field)
    }
  } catch { return }
  currentStep.value++
  await nextTick()
  animateStepEntrance()
}

function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function animateStepEntrance() {
  if (!formWrapperRef.value) return
  const fields = formWrapperRef.value.querySelectorAll('.step-fields .el-form-item')
  gsap.fromTo(fields, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' })
}

function handleEnter() {
  if (currentStep.value < 2) {
    nextStep()
  } else {
    handleRegister()
  }
}

// ─── Register ───
async function handleRegister() {
  if (!captchaPassed.value) { ElMessage.warning('请先完成安全验证'); return }
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }

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
  } finally {
    loading.value = false
  }
}

function shakeInput() {
  const inputs = document.querySelectorAll('.auth-form .el-input')
  inputs.forEach(el => {
    gsap.fromTo(el, { x: 0 }, { x: -5, duration: 0.05, repeat: 3, yoyo: true, ease: 'power2.inOut' })
  })
}

onMounted(() => {
  // 测试模式：自动通过滑块验证码
  if (isTestMode) {
    captchaPassed.value = true
    captchaProgress.value = 100
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.fromTo(cardRef.value, { y: 40, opacity: 0, scale: 0.96 },
    { y: 0, opacity: 1, scale: 1, duration: 0.7 })
  if (stepIndicatorRef.value) {
    tl.fromTo(stepIndicatorRef.value, { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4 }, '-=0.3')
  }
  tl.fromTo('.step-fields .el-form-item', { x: -24, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.45, stagger: 0.1 }, '-=0.2')
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDragging)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchmove', onDragging)
  window.removeEventListener('touchend', onDragEnd)
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

/* ── Left Branding ── */
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

.auth-logo { text-align: center; position: relative; z-index: 1; }
.logo-icon { width: 80px; height: 80px; margin: 0 auto 16px; color: #fff; }
.school-logo { width: 100%; height: 100%; object-fit: contain; border-radius: 12px; }
.system-name { font-size: 26px; font-weight: 700; margin: 0 0 6px; letter-spacing: 2px; }
.system-subtitle { font-size: 13px; opacity: 0.75; margin: 0; letter-spacing: 1px; font-weight: 300; }
.auth-slogan { font-size: 13px; opacity: 0.7; margin: 0; position: relative; z-index: 1; }

/* ── Right Form ── */
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 48px;
  overflow-y: auto;
}

.auth-form-wrapper { width: 100%; max-width: 300px; }

.form-title { font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 4px; }
.form-desc { font-size: 13px; color: #9ca3af; margin: 0 0 20px; }

/* ── Step Indicator ── */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 8px;
}

.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  background: #e5e7eb; color: #9ca3af;
  transition: all 0.3s ease;
  flex-shrink: 0;
}
.step-dot.active { background: #8b5cf6; color: #fff; }
.step-dot.done { background: #10b981; color: #fff; }

.step-line {
  width: 40px; height: 2px;
  background: #e5e7eb;
  transition: background 0.3s ease;
}
.step-line.done { background: #10b981; }

.step-labels {
  display: flex; justify-content: space-between;
  font-size: 11px; color: #c0c4cc;
  margin-bottom: 20px; padding: 0 4px;
}
.step-labels span.active { color: #8b5cf6; font-weight: 600; }

/* ── Form ── */
.auth-form :deep(.el-form-item) { margin-bottom: 18px; }
.auth-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
  transition: box-shadow 0.25s;
}
.auth-form :deep(.el-input__wrapper:hover) { box-shadow: 0 0 0 1px #93c5fd inset; }
.auth-form :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 2px #3b82f6 inset; }
.auth-form :deep(.el-select) { width: 100%; }
.auth-form :deep(.el-select .el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
}
.auth-form :deep(.el-select .el-input__wrapper:hover) { box-shadow: 0 0 0 1px #93c5fd inset; }

.step-fields { min-height: 200px; }

/* Step transition */
.step-fade-enter-active, .step-fade-leave-active { transition: all 0.25s ease; }
.step-fade-enter-from { opacity: 0; transform: translateX(20px); }
.step-fade-leave-to { opacity: 0; transform: translateX(-20px); }

/* ── Password Strength ── */
.password-strength { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.strength-bars { display: flex; gap: 4px; flex: 1; }
.strength-bar { height: 4px; flex: 1; border-radius: 2px; background: #e5e7eb; transition: background 0.3s; }
.strength-bar.bar-weak { background: #ef4444; }
.strength-bar.bar-medium { background: #f59e0b; }
.strength-bar.bar-strong { background: #10b981; }
.strength-text { font-size: 11px; font-weight: 500; min-width: 20px; text-align: right; }
.strength-text.text-weak { color: #ef4444; }
.strength-text.text-medium { color: #f59e0b; }
.strength-text.text-strong { color: #10b981; }

/* ── Captcha ── */
.captcha-section { max-width: 300px; margin: 0 auto 4px; }
.captcha-label { font-size: 12px; color: #9ca3af; margin: 0 0 6px; text-align: center; }
.captcha-track {
  position: relative; width: 100%; height: 42px; background: #f3f4f6;
  border-radius: 21px; overflow: hidden; user-select: none; cursor: pointer;
  border: 1px solid #e5e7eb;
}
.captcha-track-bg {
  position: absolute; top: 0; left: 0; height: 100%;
  background: linear-gradient(90deg, #a7f3d0, #10b981);
  border-radius: 21px 0 0 21px; transition: width 0.05s;
}
.captcha-slider {
  position: absolute; top: 0; width: 42px; height: 42px; background: #fff;
  border: 2px solid #d1d5db; border-radius: 50%; display: flex;
  align-items: center; justify-content: center; cursor: grab; z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: border-color 0.3s, box-shadow 0.3s;
  font-size: 18px; color: #9ca3af; font-weight: bold;
}
.captcha-slider:active { cursor: grabbing; }
.captcha-slider.passed { border-color: #10b981; color: #10b981; }
.captcha-hint {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 12px; color: #9ca3af; pointer-events: none; white-space: nowrap;
}
.captcha-hint.success { color: #10b981; }

/* ── Register Button ── */
.register-btn {
  width: 100%;
  border-radius: 10px;
  font-size: 15px;
  letter-spacing: 4px;
  height: 44px;
}

/* ── Step Navigation ── */
.step-nav { display: flex; justify-content: center; gap: 16px; margin-top: 4px; }
.nav-btn { min-width: 100px; border-radius: 10px; }

/* ── Link ── */
.auth-link { text-align: center; font-size: 13px; color: #9ca3af; margin-top: 12px; }
.auth-link a { color: #3b82f6; text-decoration: none; font-weight: 500; }
.auth-link a:hover { text-decoration: underline; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .auth-card { flex-direction: column; width: 100%; max-width: 400px; min-height: auto; }
  .auth-left { flex: none; padding: 32px 24px; }
  .system-name { font-size: 22px; }
  .auth-right { padding: 32px 28px; overflow-y: visible; }
}

@media (max-height: 750px) {
  .auth-card { min-height: auto; }
  .auth-right { padding: 30px 36px; }
  .auth-left { padding: 30px 28px; }
}
</style>
