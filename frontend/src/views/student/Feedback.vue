<template>
  <div class="page">
    <div class="page-header">
      <h2>意见反馈</h2>
      <el-button type="primary" @click="showForm = true">提交反馈</el-button>
    </div>

    <div v-for="fb in list" :key="fb.id" class="card-box feedback-item">
      <div class="fb-head">
        <h4>{{ fb.title }}</h4>
        <el-tag size="small">{{ typeMap[fb.type || fb.feedbackType] || fb.type }}</el-tag>
      </div>
      <p>{{ fb.content }}</p>
      <p class="fb-meta">{{ fb.createdAt }}</p>
      <div v-if="fb.reply" class="fb-reply">
        <b>管理员回复：</b>{{ fb.reply }}
        <p class="fb-meta">{{ fb.repliedAt }}</p>
      </div>
    </div>
    <el-empty v-if="!list.length" description="暂无反馈" />

    <el-dialog v-model="showForm" title="提交意见反馈" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.feedbackType">
            <el-option label="建议" value="suggestion" />
            <el-option label="投诉" value="complaint" />
            <el-option label="咨询" value="consultation" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { submitFeedback, getMyFeedbacks } from '@/api/message'

const typeMap = { suggestion: '建议', complaint: '投诉', consultation: '咨询', other: '其他' }
const list = ref([])
const showForm = ref(false)
const form = ref({ title: '', feedbackType: 'suggestion', content: '' })

onMounted(async () => {
  try { const res = await getMyFeedbacks(); list.value = res.data || [] } catch {}
})

async function submit() {
  await submitFeedback(form.value)
  ElMessage.success('反馈已提交')
  showForm.value = false
  form.value = { title: '', feedbackType: 'suggestion', content: '' }
}
</script>

<style scoped>
.feedback-item { margin-bottom: 12px; }
.fb-head { display: flex; justify-content: space-between; align-items: center; }
.fb-meta { font-size: 12px; color: var(--color-info); margin-top: 8px; }
.fb-reply { margin-top: 12px; padding: 12px; background: #f0f9eb; border-radius: 6px; }
</style>
