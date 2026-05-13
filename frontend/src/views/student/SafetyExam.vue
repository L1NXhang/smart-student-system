<template>
  <div class="page">
    <div class="page-header"><h2>安全考试</h2></div>

    <el-card v-if="!taking">
      <el-table :data="exams" stripe>
        <el-table-column prop="title" label="考试名称" />
        <el-table-column prop="duration" label="时长(分钟)" />
        <el-table-column prop="passScore" label="及格分数" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="startExam(row)">开始考试</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-else>
      <div class="exam-header">
        <h3>{{ currentExam.title }}</h3>
        <el-tag type="danger">剩余 {{ timeLeft }} 秒</el-tag>
      </div>
      <div v-for="(q, i) in questions" :key="i" class="q-item">
        <p><b>{{ i + 1 }}. {{ q.question }}</b></p>
        <el-radio-group v-model="answers[q.id]">
          <el-radio v-for="(opt, j) in parseOpts(q.options)" :key="j" :value="opt[0]">{{ opt }}</el-radio>
        </el-radio-group>
      </div>
      <el-button type="primary" size="large" @click="submitExam" :loading="submitting">提交答案</el-button>
    </el-card>

    <el-dialog v-model="showResult" title="考试结果" width="400px">
      <div class="result-box">
        <h2 :style="{ color: result.isPassed ? 'var(--color-success)' : 'var(--color-danger)' }">
          {{ result.score }} 分
        </h2>
        <p>{{ result.isPassed ? '恭喜通过！' : '未通过，请重新考试' }}</p>
        <p>正确 {{ result.correctCount }} / 错误 {{ result.wrongCount }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getExams, getExamQuestions, submitExam } from '@/api/safety'

const exams = ref([])
const taking = ref(false)
const currentExam = ref({})
const questions = ref([])
const answers = ref({})
const submitting = ref(false)
const timeLeft = ref(0)
const showResult = ref(false)
const result = ref({})
let timer = null

onMounted(async () => {
  try { const res = await getExams(); exams.value = res.data || [] } catch {}
})

function parseOpts(opts) {
  try { return typeof opts === 'string' ? JSON.parse(opts) : opts } catch { return [] }
}

async function startExam(exam) {
  const res = await getExamQuestions(exam.id)
  questions.value = res.data || []
  currentExam.value = exam
  answers.value = {}
  taking.value = true
  timeLeft.value = exam.duration * 60
  timer = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    else submitExam()
  }, 1000)
}

async function submitExam() {
  clearInterval(timer)
  submitting.value = true
  try {
    const res = await submitExam(currentExam.value.id, { answers: answers.value })
    result.value = res.data
    showResult.value = true
    taking.value = false
  } catch {}
  submitting.value = false
}

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.exam-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.q-item { margin-bottom: 18px; }
.result-box { text-align: center; padding: 20px; }
.result-box h2 { font-size: 48px; margin-bottom: 8px; }
</style>
