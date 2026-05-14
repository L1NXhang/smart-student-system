<template>
  <div class="feedback-page">
    <div class="page-header">
      <h2>意见反馈</h2>
      <p>向管理员提交意见、建议或问题反馈</p>
      <el-button type="primary" @click="openForm">提交反馈</el-button>
    </div>

    <!-- 反馈列表 -->
    <div v-loading="loading">
      <div v-for="fb in list" :key="fb.id" class="feedback-card">
        <div class="fb-header">
          <div class="fb-title-row">
            <h4>{{ fb.title }}</h4>
            <el-tag size="small" :type="typeTag(fb.feedback_type || fb.type)">
              {{ typeText(fb.feedback_type || fb.type) }}
            </el-tag>
          </div>
          <span class="fb-date">{{ fb.created_at || fb.createdAt }}</span>
        </div>
        <p class="fb-content">{{ fb.content }}</p>

        <!-- 管理员回复 -->
        <div v-if="fb.reply" class="fb-reply">
          <div class="reply-header">
            <el-icon><UserFilled /></el-icon>
            <b>管理员回复</b>
            <span class="reply-date">{{ fb.replied_at || fb.repliedAt }}</span>
          </div>
          <p class="reply-content">{{ fb.reply }}</p>
        </div>
      </div>

      <el-empty v-if="!loading && !list.length" description="暂无反馈记录">
        <el-button type="primary" @click="openForm">提交第一条反馈</el-button>
      </el-empty>
    </div>

    <!-- 提交表单 -->
    <el-dialog
      v-model="showForm"
      title="提交意见反馈"
      width="520px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请简要概括反馈内容"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="类型" prop="feedbackType">
          <el-select v-model="form.feedbackType" style="width: 100%">
            <el-option label="💡 建议" value="suggestion" />
            <el-option label="⚠️ 投诉" value="complaint" />
            <el-option label="❓ 咨询" value="consultation" />
            <el-option label="📝 其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            placeholder="请详细描述你的意见或问题（不少于10字）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" @click="submit" :loading="submitting">提交反馈</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { submitFeedback, getMyFeedbacks } from '@/api/message'

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const list = ref([])
const showForm = ref(false)

const form = reactive({
  title: '',
  feedbackType: 'suggestion',
  content: '',
})

const rules = {
  title: [{ required: true, message: '请填写标题', trigger: 'blur' }],
  feedbackType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  content: [
    { required: true, message: '请填写反馈内容', trigger: 'blur' },
    { min: 10, message: '反馈内容不少于10字', trigger: 'blur' },
  ],
}

function typeTag(type) {
  const map = { suggestion: '', complaint: 'danger', consultation: 'warning', other: 'info' }
  return map[type] || 'info'
}

function typeText(type) {
  const map = { suggestion: '建议', complaint: '投诉', consultation: '咨询', other: '其他' }
  return map[type] || type
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getMyFeedbacks()
    list.value = res.data || []
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
  }
}

function openForm() {
  showForm.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  form.title = ''
  form.feedbackType = 'suggestion'
  form.content = ''
}

async function submit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await submitFeedback({
      title: form.title,
      feedbackType: form.feedbackType,
      content: form.content,
    })
    ElMessage.success('反馈已提交，管理员会尽快回复')
    showForm.value = false
    resetForm()
    await fetchList()
  } catch {
    /* handled by interceptor */
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.feedback-page {
  max-width: 860px;
}

/* Feedback cards */
.feedback-card {
  padding: 20px;
  margin-bottom: 14px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}

.fb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.fb-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fb-title-row h4 {
  margin: 0;
}

.fb-date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.fb-content {
  margin: 0;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

/* Admin reply */
.fb-reply {
  margin-top: 16px;
  padding: 16px;
  background: #f0f9eb;
  border-radius: 8px;
  border-left: 3px solid var(--el-color-success);
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
}

.reply-date {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 400;
}

.reply-content {
  margin: 0;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}
</style>
