<template>
  <div class="safety-exam-page">
    <div class="page-header">
      <h2>安全考试</h2>
      <p>参加安全知识考试，增强安全防范意识</p>
    </div>

    <!-- 考试列表 -->
    <el-card v-if="!taking && !showResult">
      <template #header>
        <span class="card-header-title">考试列表</span>
      </template>
      <el-table :data="exams" stripe v-loading="loadingExams" empty-text="暂无可参加的考试">
        <el-table-column prop="title" label="考试名称" min-width="180" />
        <el-table-column prop="duration" label="时长(分钟)" width="100" align="center" />
        <el-table-column prop="pass_score" label="及格分数" width="100" align="center" />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="examStatus[row.id] === 'passed'" type="success" size="small">已通过</el-tag>
            <el-tag v-else-if="examStatus[row.id] === 'failed'" type="warning" size="small">未通过</el-tag>
            <el-tag v-else type="info" size="small">未参加</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              v-if="examStatus[row.id] !== 'passed'"
              type="primary"
              size="small"
              @click="startExam(row)"
            >
              {{ examStatus[row.id] === 'failed' ? '重新考试' : '开始考试' }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 考试界面 -->
    <el-card v-if="taking" class="exam-card">
      <div class="exam-header">
        <div class="exam-info">
          <h3>{{ currentExam.title }}</h3>
          <span class="exam-meta">
            {{ questions.length }} 题 · 满分 100 分 · 及格 {{ currentExam.pass_score }} 分
          </span>
        </div>
        <el-tag :type="timeLeft <= 60 ? 'danger' : 'warning'" size="large" effect="dark">
          {{ formatTime(timeLeft) }}
        </el-tag>
      </div>

      <el-divider />

      <div class="questions-area">
        <div v-for="(q, i) in questions" :key="q.id" class="question-item">
          <p class="question-title">
            <span class="question-num">{{ i + 1 }}.</span>
            {{ q.question }}
            <span class="question-score">({{ q.score }}分)</span>
          </p>
          <el-radio-group
            v-model="answers[q.id]"
            class="options-group"
          >
            <el-radio
              v-for="(opt, j) in parseOpts(q.options)"
              :key="j"
              :value="opt[0]"
              class="option-item"
            >
              {{ opt }}
            </el-radio>
          </el-radio-group>
        </div>
      </div>

      <el-divider />

      <div class="exam-footer">
        <div class="answer-progress">
          已答 {{ answeredCount }} / {{ questions.length }} 题
        </div>
        <el-button
          type="primary"
          size="large"
          @click="submitExam"
          :loading="submitting"
          :disabled="answeredCount < questions.length"
        >
          提交答案
        </el-button>
      </div>
    </el-card>

    <!-- 结果展示 -->
    <el-card v-if="showResult" class="result-card">
      <div class="result-box" :class="{ passed: result.isPassed, failed: !result.isPassed }">
        <div class="result-icon">{{ result.isPassed ? '🎉' : '😞' }}</div>
        <h1 class="result-score">{{ result.score }} 分</h1>
        <p class="result-verdict">{{ result.isPassed ? '恭喜通过考试！' : '很遗憾，未通过考试' }}</p>
        <div class="result-detail">
          <div class="detail-item">
            <span class="label">正确</span>
            <span class="value correct">{{ result.correctCount }}</span>
          </div>
          <div class="detail-item">
            <span class="label">错误</span>
            <span class="value wrong">{{ result.wrongCount }}</span>
          </div>
        </div>
        <el-button type="primary" @click="backToList">返回考试列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExams, getExamQuestions, submitExam as submitExamApi, getExamRecord } from '@/api/safety'

const exams = ref([])
const loadingExams = ref(false)
const examStatus = ref({})

const taking = ref(false)
const showResult = ref(false)
const currentExam = ref({})
const questions = ref([])
const answers = ref({})
const submitting = ref(false)
const timeLeft = ref(0)
const result = ref({})
let timer = null

const answeredCount = computed(() => Object.keys(answers.value).length)

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function parseOpts(opts) {
  try { return typeof opts === 'string' ? JSON.parse(opts) : opts } catch { return [] }
}

async function fetchExams() {
  loadingExams.value = true
  try {
    const res = await getExams()
    exams.value = res.data || []
    // 检查每个考试的记录
    for (const exam of exams.value) {
      try {
        const recordRes = await getExamRecord(exam.id)
        if (recordRes.data) {
          examStatus.value[exam.id] = recordRes.data.is_passed ? 'passed' : 'failed'
        }
      } catch {
        examStatus.value[exam.id] = 'none'
      }
    }
  } catch {
    /* handled by interceptor */
  } finally {
    loadingExams.value = false
  }
}

async function startExam(exam) {
  try {
    const hasPassed = examStatus.value[exam.id] === 'passed'
    if (hasPassed) {
      ElMessage.info('你已经通过了该考试')
      return
    }

    const res = await getExamQuestions(exam.id)
    if (!res.data || !res.data.length) {
      ElMessage.warning('该考试暂无题目')
      return
    }

    questions.value = res.data
    currentExam.value = exam
    answers.value = {}
    taking.value = true
    showResult.value = false
    timeLeft.value = exam.duration * 60
    submitting.value = false

    timer = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        submitExam()
      }
    }, 1000)
  } catch {
    ElMessage.error('获取考试题目失败')
  }
}

async function submitExam() {
  if (submitting.value) return
  clearInterval(timer)

  const unanswered = questions.value.filter((q) => !answers.value[q.id]).length
  if (unanswered > 0) {
    try {
      await ElMessageBox.confirm(
        `还有 ${unanswered} 道题未作答，确定提交吗？`,
        '确认提交',
        { confirmButtonText: '确定提交', cancelButtonText: '继续作答', type: 'warning' }
      )
    } catch {
      // 用户选择继续作答，重启计时器
      timer = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--
        } else {
          submitExam()
        }
      }, 1000)
      return
    }
  }

  submitting.value = true
  try {
    const res = await submitExamApi(currentExam.value.id, answers.value)
    result.value = res.data
    if (res.data.isPassed) {
      examStatus.value[currentExam.value.id] = 'passed'
    } else {
      examStatus.value[currentExam.value.id] = 'failed'
    }
    taking.value = false
    showResult.value = true
  } catch {
    /* handled by interceptor */
  } finally {
    submitting.value = false
  }
}

function backToList() {
  showResult.value = false
  taking.value = false
}

onMounted(() => {
  fetchExams()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.safety-exam-page {
  max-width: 860px;
}

.card-header-title {
  font-weight: 600;
}

.exam-card {
  max-width: 100%;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.exam-info h3 {
  margin: 0 0 6px 0;
}

.exam-meta {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.questions-area {
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 8px;
}

.question-item {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.question-title {
  margin: 0 0 12px 0;
  font-weight: 600;
  line-height: 1.6;
}

.question-num {
  color: var(--el-color-primary);
}

.question-score {
  color: var(--el-text-color-secondary);
  font-weight: 400;
  font-size: 13px;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 20px;
}

.option-item {
  margin-right: 0;
}

.exam-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.answer-progress {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

/* Result */
.result-card {
  max-width: 480px;
  margin: 0 auto;
}

.result-box {
  text-align: center;
  padding: 40px 20px;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.result-score {
  font-size: 56px;
  margin: 0 0 8px 0;
}

.result-box.passed .result-score {
  color: var(--el-color-success);
}

.result-box.failed .result-score {
  color: var(--el-color-danger);
}

.result-verdict {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 20px 0;
}

.result-detail {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 28px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.detail-item .label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.detail-item .value {
  font-size: 28px;
  font-weight: 700;
}

.detail-item .value.correct {
  color: var(--el-color-success);
}

.detail-item .value.wrong {
  color: var(--el-color-danger);
}
</style>
