<template>
  <div class="auth-container" :class="{ 'is-mobile': isMobile }">
    <!-- Aurora 极光背景 -->
    <AuroraBackground
      :speed="isMobile ? 0.8 : 0.6"
      :intensity="isMobile ? 3.0 : 2.0"
      color1="#4fc3f7" color2="#66bb6a" color3="#ab47bc" color4="#64ffda"
    />

    <!-- ═══════════ 移动端布局 ═══════════ -->
    <template v-if="isMobile">
      <div class="mobile-login" ref="cardRef">
        <div class="mobile-logo-area" ref="logoRef">
          <div class="mobile-logo-icon">
            <img src="@/assets/logo.png" alt="校徽" class="school-logo" />
          </div>
          <h1 class="mobile-system-name">
            <ShinyText color="#1f2937" :speed="5">智慧学工</ShinyText>
          </h1>
        </div>

        <div class="mobile-form-area" ref="formWrapperRef">
          <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @keyup.enter="handleLogin">
            <el-form-item prop="username" class="form-item-fx" ref="userItemRef">
              <el-input
                v-model="form.username"
                placeholder="学号/工号"
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>

            <el-form-item prop="password" class="form-item-fx" ref="passItemRef">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
                size="large"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                ref="loginBtnRef"
                type="primary"
                size="large"
                :loading="loading"
                :disabled="loading || !captchaPassed"
                class="login-btn"
                @click="handleLogin"
              >
                <span v-if="loading">登录中...</span>
                <span v-else>登 录</span>
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 滑块验证 -->
          <div class="captcha-section" ref="captchaRef">
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

          <div class="auth-link">
            还没有账号？<router-link to="/register">立即注册</router-link>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════ 桌面端布局 ═══════════ -->
    <template v-else>
    <div class="auth-card" ref="cardRef">
      <!-- 左侧品牌区 -->
      <div class="auth-left">
        <div class="auth-bg-rings">
          <span class="ring ring-1" ref="ring1Ref" />
          <span class="ring ring-2" ref="ring2Ref" />
          <span class="ring ring-3" ref="ring3Ref" />
        </div>

        <div class="auth-logo" ref="logoRef">
          <div class="logo-icon">
            <img src="@/assets/logo.png" alt="校徽" class="school-logo" />
          </div>
          <h1 class="system-name">
            <ShinyText color="#ffffff" :speed="5">智慧学工系统</ShinyText>
          </h1>
          <p class="system-subtitle">Smart Student Affairs System</p>
        </div>

        <p class="auth-slogan" ref="sloganRef">
          <BlurText text="以学生为本，用智慧服务成长" :duration="0.8" :stagger="0.06" />
        </p>
      </div>

      <!-- 右侧表单 -->
      <div class="auth-right">
        <div class="auth-form-wrapper" ref="formWrapperRef">
          <h2 class="form-title">
            <GradientText from="#3b82f6" to="#8b5cf6">欢迎登录</GradientText>
          </h2>
          <p class="form-desc">请输入您的账号信息</p>

          <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @keyup.enter="handleLogin">
            <el-form-item prop="username" class="form-item-fx" ref="userItemRef">
              <el-input
                v-model="form.username"
                placeholder="学号/工号"
                :prefix-icon="User"
                size="large"
              />
            </el-form-item>

            <el-form-item prop="password" class="form-item-fx" ref="passItemRef">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
                size="large"
              />
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="form.remember">记住我</el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                ref="loginBtnRef"
                type="primary"
                size="large"
                :loading="loading"
                :disabled="loading || !captchaPassed"
                class="login-btn"
                @click="handleLogin"
              >
                <span v-if="loading" class="btn-loading-text">登录中...</span>
                <span v-else>登 录</span>
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 滑块验证 -->
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

          <div class="auth-link">
            还没有账号？<router-link to="/register">立即注册</router-link>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { AuroraBackground, ShinyText, GradientText, BlurText } from '@/components/react-bits'

const router = useRouter()
const store = useUserStore()
const isMobile = ref(window.innerWidth < 768)

// Keep isMobile updated on resize
function onResize() {
  isMobile.value = window.innerWidth < 768
}
window.addEventListener('resize', onResize)

const cardRef = ref(null)
const loginBtnRef = ref(null)
const formRef = ref(null)
const formWrapperRef = ref(null)
const logoRef = ref(null)
const sloganRef = ref(null)
const ring1Ref = ref(null)
const ring2Ref = ref(null)
const ring3Ref = ref(null)
const userItemRef = ref(null)
const passItemRef = ref(null)
const captchaRef = ref(null)
const trackRef = ref(null)
const sliderRef = ref(null)
const loading = ref(false)

const captchaPassed = ref(false)
const sliderLeft = ref(0)
const captchaProgress = ref(0)
let isDragging = false
let trackWidth = 300
const sliderWidth = 40
let maxLeft = 200

const form = reactive({ username: '', password: '', remember: false })

const rules = {
  username: [{ required: true, message: '请输入学号/工号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
}

// Slider captcha
function onDragStart(e) {
  if (captchaPassed.value) return
  isDragging = true
  trackWidth = trackRef.value.clientWidth
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
    // Success glow
    if (sliderRef.value) {
      gsap.to(sliderRef.value, { boxShadow: '0 0 12px rgba(16,185,129,0.6)', duration: 0.4 })
    }
  } else {
    gsap.to(sliderLeft, { value: 0, duration: 0.4, ease: 'power2.out',
      onUpdate() { captchaProgress.value = (sliderLeft.value / maxLeft) * 100 },
    })
  }
}

async function handleLogin() {
  if (!captchaPassed.value) { ElMessage.warning('请先完成安全验证'); return }
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }
  loading.value = true
  try {
    const result = await store.login(form.username, form.password)
    if (result.needChangePassword) { router.push('/change-password'); return }
    ElMessage.success('登录成功')
    router.push(store.isAdmin ? '/admin/dashboard' : '/dashboard')
  } catch (err) {
    ElMessage.error(err?.response?.data?.message || '登录失败')
    // Shake form
    if (formWrapperRef.value) {
      gsap.fromTo(formWrapperRef.value, { x: 0 }, { x: -6, duration: 0.05, repeat: 5, yoyo: true, ease: 'power2.inOut' })
    }
  } finally { loading.value = false }
}

onMounted(() => {
  isMobile.value = window.innerWidth < 768

  if (isMobile.value) {
    // Mobile: simpler entrance animation
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(cardRef.value, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
    tl.fromTo(logoRef.value, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.2')
    tl.fromTo('.form-item-fx', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1 }, '-=0.2')
    if (captchaRef.value) {
      tl.fromTo(captchaRef.value, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, '-=0.05')
    }
    tl.fromTo('.auth-link', { opacity: 0 }, { opacity: 1, duration: 0.25 }, '-=0.05')
    return
  }

  // Desktop animations
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // Card enter
  tl.fromTo(cardRef.value, { y: 40, opacity: 0, scale: 0.96 },
    { y: 0, opacity: 1, scale: 1, duration: 0.7 })

  // Left panel rings expand
  tl.fromTo([ring1Ref.value, ring2Ref.value, ring3Ref.value],
    { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.15 }, '-=0.4')

  // Logo bounce in
  tl.fromTo(logoRef.value, { y: -20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3')

  // Slogan
  tl.fromTo(sloganRef.value, { opacity: 0 },
    { opacity: 1, duration: 0.4 }, '-=0.1')

  // Form elements stagger
  tl.fromTo('.form-item-fx', { x: -24, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.45, stagger: 0.12 }, '-=0.3')

  // Captcha
  if (captchaRef.value) {
    tl.fromTo(captchaRef.value, { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4 }, '-=0.1')
  }

  // Link
  tl.fromTo('.auth-link', { opacity: 0 },
    { opacity: 1, duration: 0.3 }, '-=0.1')

  // Animate background rings forever
  if (ring1Ref.value) {
    gsap.to(ring1Ref.value, { rotation: 360, duration: 30, repeat: -1, ease: 'none' })
    gsap.to(ring2Ref.value, { rotation: -360, duration: 25, repeat: -1, ease: 'none' })
    gsap.to(ring3Ref.value, { rotation: 360, duration: 35, repeat: -1, ease: 'none' })
  }
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDragging)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchmove', onDragging)
  window.removeEventListener('touchend', onDragEnd)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
/* ===== Background ===== */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2ff 0%, #f0f4ff 30%, #fdf2f8 70%, #fef3c7 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* ===== Card (Desktop) ===== */
.auth-card {
  display: flex;
  width: 860px;
  min-height: 540px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(59,130,246,0.12), 0 4px 16px rgba(0,0,0,0.04);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* ===== Desktop: Left Panel ===== */
.auth-left {
  flex: 0 0 400px;
  background: linear-gradient(160deg, #3b82f6 0%, #2563eb 40%, #1d4ed8 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 36px;
  position: relative;
  overflow: hidden;
}

.auth-bg-rings {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.08);
}
.ring-1 { width: 300px; height: 300px; top: -80px; right: -100px; }
.ring-2 { width: 220px; height: 220px; top: 40%; left: -60px; }
.ring-3 { width: 160px; height: 160px; bottom: -30px; right: 40px; border-color: rgba(255,255,255,0.06); }

.auth-logo { text-align: center; position: relative; z-index: 1; flex: 0.618; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.logo-icon { width: 120px; height: 120px; margin: 0 auto 20px; }
.school-logo { width: 100%; height: 100%; object-fit: contain; border-radius: 16px; }
.system-name { font-size: 28px; font-weight: 700; margin: 0 0 8px; letter-spacing: 3px; }
.system-subtitle { font-size: 13px; opacity: 0.7; margin: 0; letter-spacing: 1px; font-weight: 300; }
.auth-slogan { font-size: 13px; opacity: 0.65; margin: 0; position: relative; z-index: 1; flex: 0.382; display: flex; align-items: flex-end; padding-bottom: 24px; }

/* ===== Desktop: Right Panel ===== */
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 52px;
}
.auth-form-wrapper { width: 100%; max-width: 320px; }
.form-title { font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 4px; }
.form-desc { font-size: 13px; color: #9ca3af; margin: 0 0 32px; }

/* Shared form styles */
.auth-form :deep(.el-form-item) { margin-bottom: 20px; }
.auth-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
  transition: all 0.25s ease;
}
.auth-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #93c5fd inset;
  transform: translateY(-1px);
}
.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #3b82f6 inset, 0 0 20px rgba(59,130,246,0.1);
}

.login-btn {
  width: 100%;
  height: 46px;
  border-radius: 12px;
  font-size: 16px;
  letter-spacing: 6px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  transition: all 0.3s ease;
}
.login-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37,99,235,0.35);
}
.login-btn:not(:disabled):active { transform: translateY(0); }

.btn-loading-text { letter-spacing: 2px; }

/* ===== Captcha (shared) ===== */
.captcha-section { max-width: 320px; margin: 0 auto 12px; }
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

.auth-link { text-align: center; font-size: 13px; color: #9ca3af; margin-top: 16px; }
.auth-link a { color: #3b82f6; text-decoration: none; font-weight: 500; }
.auth-link a:hover { text-decoration: underline; }

/* ═══════════════ Mobile Layout ═══════════════ */
.auth-container.is-mobile {
  background: #fff;
  padding: 0;
  align-items: flex-start;
}

.mobile-login {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 28px 40px;
}

.mobile-logo-area {
  text-align: center;
  margin-bottom: 36px;
}
.mobile-logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
}
.mobile-logo-icon .school-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 16px;
}
.mobile-system-name {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 3px;
}

.mobile-form-area {
  width: 100%;
  max-width: 360px;
}

.mobile-form-area .captcha-section {
  max-width: 100%;
}

.mobile-form-area .login-btn {
  height: 48px;
  font-size: 17px;
  border-radius: 14px;
}

/* ===== Desktop Tablet ===== */
@media (min-width: 768px) and (max-width: 900px) {
  .auth-card { width: 92%; max-width: 700px; }
  .auth-left { flex: 0 0 320px; padding: 40px 28px; }
  .auth-right { padding: 40px 36px; }
}
</style>
