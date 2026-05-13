<template>
  <div class="auth-container">
    <div class="auth-card" ref="cardRef">
      <div class="auth-left">
        <div class="auth-logo">
          <h1 class="system-name">智慧学工系统</h1>
          <p class="system-subtitle">Smart Student Affairs System</p>
        </div>
        <p class="auth-slogan">首次登录，请修改密码</p>
      </div>
      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2 class="form-title">修改密码</h2>
          <p class="form-desc">为了账号安全，请设置新密码</p>
          <el-form ref="formRef" :model="form" :rules="rules" class="auth-form" @keyup.enter="handleSubmit">
            <el-form-item prop="newPassword">
              <el-input v-model="form.newPassword" type="password" placeholder="新密码（8位以上，含字母+数字）" prefix-icon="Lock" show-password size="large" />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input v-model="form.confirmPassword" type="password" placeholder="确认新密码" prefix-icon="Lock" show-password size="large" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" :loading="loading" class="submit-btn" @click="handleSubmit">
                {{ loading ? '提交中...' : '确认修改' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const store = useUserStore()
const cardRef = ref(null)
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ newPassword: '', confirmPassword: '' })

const validatePassword = (_rule, value, callback) => {
  if (!value) return callback(new Error('请输入新密码'))
  if (value.length < 8) return callback(new Error('密码长度不能少于8位'))
  if (!/[a-zA-Z]/.test(value)) return callback(new Error('密码必须包含字母'))
  if (!/[0-9]/.test(value)) return callback(new Error('密码必须包含数字'))
  callback()
}

const validateConfirm = (_rule, value, callback) => {
  if (!value) return callback(new Error('请再次输入密码'))
  if (value !== form.newPassword) return callback(new Error('两次输入的密码不一致'))
  callback()
}

const rules = {
  newPassword: [{ required: true, validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }],
}

async function handleSubmit() {
  if (!formRef.value) return
  try { await formRef.value.validate() } catch { return }
  loading.value = true
  try {
    await store.changePassword('', form.newPassword)
    ElMessage.success('密码修改成功')
    localStorage.setItem('first_login_done', '1')
    if (store.isAdmin) router.push('/admin/dashboard')
    else router.push('/dashboard')
  } catch (err) {
    ElMessage.error(err?.message || '修改失败')
  } finally { loading.value = false }
}

onMounted(() => {
  gsap.fromTo(cardRef.value, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
})
</script>

<style scoped>
.auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 40%, #fdf2f8 100%); padding: 20px; }
.auth-card { display: flex; width: 720px; min-height: 420px; background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(64,128,255,0.1); overflow: hidden; }
.auth-left { flex: 0 0 320px; background: linear-gradient(160deg, #3b82f6 0%, #2563eb 100%); color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
.system-name { font-size: 24px; font-weight: 700; letter-spacing: 2px; }
.system-subtitle { font-size: 13px; opacity: 0.75; margin-top: 6px; }
.auth-slogan { font-size: 14px; opacity: 0.8; margin-top: 20px; }
.auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
.auth-form-wrapper { width: 100%; max-width: 300px; }
.form-title { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
.form-desc { font-size: 13px; color: #9ca3af; margin-bottom: 24px; }
.auth-form :deep(.el-input__wrapper) { border-radius: 10px; }
.submit-btn { width: 100%; border-radius: 10px; height: 44px; letter-spacing: 4px; }
</style>
