<template>
  <div class="evaluation-page">
    <div class="page-header">
      <h2>中期鉴定</h2>
      <p>填写学期中期自我鉴定，提交后由班主任进行审核评语</p>
    </div>

    <!-- 已提交的鉴定历史 -->
    <el-card v-if="history.length" class="history-card">
      <template #header>
        <span class="card-header-title">鉴定记录</span>
      </template>
      <el-table :data="history" stripe>
        <el-table-column prop="semester" label="学期" width="140" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacher_comment" label="班主任评语" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.teacher_comment || '暂无评语' }}
          </template>
        </el-table-column>
        <el-table-column prop="submitted_at" label="提交时间" width="160" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewEvaluation(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 填写 / 查看鉴定 -->
    <el-card class="form-card">
      <template #header>
        <span class="card-header-title">
          {{ viewing ? `查看鉴定 — ${form.semester}` : editing ? '编辑鉴定' : '新建鉴定' }}
        </span>
        <div v-if="!viewing">
          <el-button text type="primary" @click="saveDraft" :loading="saving">保存草稿</el-button>
          <el-button type="primary" @click="submit" :loading="submitting">提交鉴定</el-button>
        </div>
        <el-button v-else text type="primary" @click="resetForm">新建鉴定</el-button>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        :disabled="viewing"
      >
        <el-form-item label="学年学期" prop="semester">
          <el-select v-model="form.semester" placeholder="选择学期" style="width: 260px">
            <el-option
              v-for="s in semesters"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">思想品德表现</el-divider>
        <el-form-item prop="moralPerformance" label-width="0">
          <el-input
            v-model="form.moralPerformance"
            type="textarea"
            :rows="4"
            placeholder="请描述本学期的思想品德表现，包括政治态度、道德品质、遵纪守法等方面..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-divider content-position="left">学业情况</el-divider>
        <el-form-item prop="academicPerformance" label-width="0">
          <el-input
            v-model="form.academicPerformance"
            type="textarea"
            :rows="4"
            placeholder="请描述本学期的学业情况，包括学习成绩、科研活动、学术竞赛等方面..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-divider content-position="left">社会实践</el-divider>
        <el-form-item prop="socialPractice" label-width="0">
          <el-input
            v-model="form.socialPractice"
            type="textarea"
            :rows="4"
            placeholder="请描述本学期参与的社会实践活动，包括志愿服务、实习经历、社团活动等方面..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-divider content-position="left">身心健康</el-divider>
        <el-form-item prop="physicalMental" label-width="0">
          <el-input
            v-model="form.physicalMental"
            type="textarea"
            :rows="3"
            placeholder="请描述你的身体和心理健康状况..."
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <el-divider content-position="left">自我评价</el-divider>
        <el-form-item prop="selfEvaluation" label-width="0">
          <el-input
            v-model="form.selfEvaluation"
            type="textarea"
            :rows="4"
            placeholder="请对自己本学期的综合表现做出客观评价，包括进步、不足和努力方向..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 班主任评语（只读） -->
        <template v-if="viewing && form.teacherComment">
          <el-divider content-position="left">班主任评语</el-divider>
          <div class="teacher-comment">
            {{ form.teacherComment }}
          </div>
        </template>

        <el-form-item v-if="!viewing">
          <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
          <el-button type="primary" @click="submit" :loading="submitting">提交鉴定</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMidtermEvaluation, submitMidtermEvaluation } from '@/api/academic'
import api from '@/api/index'

const formRef = ref(null)
const saving = ref(false)
const submitting = ref(false)
const viewing = ref(false)
const editing = ref(false)
const history = ref([])

const form = reactive({
  semester: '',
  moralPerformance: '',
  academicPerformance: '',
  socialPractice: '',
  physicalMental: '',
  selfEvaluation: '',
  teacherComment: '',
})

const rules = {
  semester: [{ required: true, message: '请选择学期', trigger: 'change' }],
  moralPerformance: [{ required: true, message: '请填写思想品德表现', trigger: 'blur' }],
  academicPerformance: [{ required: true, message: '请填写学业情况', trigger: 'blur' }],
  socialPractice: [{ required: true, message: '请填写社会实践', trigger: 'blur' }],
  physicalMental: [{ required: true, message: '请填写身心健康', trigger: 'blur' }],
  selfEvaluation: [{ required: true, message: '请填写自我评价', trigger: 'blur' }],
}

const semesters = [
  { label: '2025-2026 第一学期', value: '2025-2026-1' },
  { label: '2025-2026 第二学期', value: '2025-2026-2' },
  { label: '2026-2027 第一学期', value: '2026-2027-1' },
  { label: '2026-2027 第二学期', value: '2026-2027-2' },
]

function statusTag(status) {
  const map = { draft: 'info', submitted: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || 'info'
}

function statusText(status) {
  const map = { draft: '草稿', submitted: '待审核', approved: '已通过', rejected: '已驳回' }
  return map[status] || status
}

async function fetchHistory() {
  try {
    // 简单地拉取几条记录 - 逐个学期检查
    const records = []
    for (const s of semesters) {
      try {
        const res = await getMidtermEvaluation(s.value)
        if (res.data) records.push(res.data)
      } catch {
        /* skip */
      }
    }
    history.value = records
  } catch {
    /* handled by interceptor */
  }
}

async function viewEvaluation(record) {
  // 如果传入的是历史记录对象，直接显示
  form.semester = record.semester
  form.moralPerformance = record.moral_performance || ''
  form.academicPerformance = record.academic_performance || ''
  form.socialPractice = record.social_practice || ''
  form.physicalMental = record.physical_mental || ''
  form.selfEvaluation = record.self_evaluation || ''
  form.teacherComment = record.teacher_comment || ''
  viewing.value = true
  editing.value = false
}

async function saveDraft() {
  saving.value = true
  try {
    await api.put('/academic/midterm-evaluation', {
      semester: form.semester || '2025-2026-2',
      moralPerformance: form.moralPerformance,
      academicPerformance: form.academicPerformance,
      socialPractice: form.socialPractice,
      physicalMental: form.physicalMental,
      selfEvaluation: form.selfEvaluation,
    })
    ElMessage.success('草稿已保存')
    await fetchHistory()
  } catch {
    /* handled by interceptor */
  } finally {
    saving.value = false
  }
}

async function submit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await submitMidtermEvaluation({
      semester: form.semester,
      moralPerformance: form.moralPerformance,
      academicPerformance: form.academicPerformance,
      socialPractice: form.socialPractice,
      physicalMental: form.physicalMental,
      selfEvaluation: form.selfEvaluation,
    })
    ElMessage.success('鉴定已提交，等待班主任审核')
    viewing.value = true
    editing.value = false
    await fetchHistory()
  } catch {
    /* handled by interceptor */
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  formRef.value?.resetFields()
  form.semester = ''
  form.moralPerformance = ''
  form.academicPerformance = ''
  form.socialPractice = ''
  form.physicalMental = ''
  form.selfEvaluation = ''
  form.teacherComment = ''
  viewing.value = false
  editing.value = true
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.evaluation-page {
  max-width: 860px;
}

.history-card {
  margin-bottom: 20px;
}

.form-card {
  margin-top: 20px;
}

.card-header-title {
  font-weight: 600;
}

.teacher-comment {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-primary);
  line-height: 1.6;
  color: var(--el-text-color-regular);
}
</style>
