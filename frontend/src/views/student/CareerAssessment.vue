<template>
  <div class="page">
    <div class="page-header"><h2>生涯测评</h2></div>
    <el-card v-if="!result">
      <el-radio-group v-model="type" style="margin-bottom:20px">
        <el-radio-button value="interest">职业兴趣测评（霍兰德）</el-radio-button>
        <el-radio-button value="personality">性格测评（MBTI简化版）</el-radio-button>
      </el-radio-group>
      <div v-if="questions.length" v-loading="loading">
        <div v-for="(q, i) in questions" :key="i" class="q-item">
          <p class="q-title">{{ i + 1 }}. {{ q.question }}</p>
          <el-radio-group v-model="answers[i]">
            <el-radio v-for="(opt, j) in q.options" :key="j" :value="opt[0]">{{ opt }}</el-radio>
          </el-radio-group>
        </div>
        <el-button type="primary" size="large" @click="submit" :loading="submitting">提交测评</el-button>
      </div>
      <el-button type="primary" size="large" v-else @click="loadQuestions">开始测评</el-button>
    </el-card>

    <el-card v-else>
      <div class="result-box">
        <h3>测评结果：{{ result.resultType }}</h3>
        <p>{{ result.resultDescription }}</p>
        <h4 style="margin-top:16px">职业建议</h4>
        <el-tag v-for="c in result.careerSuggestions" :key="c" style="margin:4px">{{ c }}</el-tag>
      </div>
      <el-button style="margin-top:16px" @click="reset">重新测评</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAssessmentQuestions, submitAssessment } from '@/api/career'

const type = ref('interest')
const questions = ref([])
const answers = ref({})
const loading = ref(false)
const submitting = ref(false)
const result = ref(null)

watch(type, () => { questions.value = []; answers.value = {}; result.value = null })

async function loadQuestions() {
  loading.value = true
  try {
    const res = await getAssessmentQuestions(type.value)
    questions.value = res.data.questions || []
    answers.value = {}
  } catch {}
  loading.value = false
}

async function submit() {
  submitting.value = true
  try {
    const ans = questions.value.map((_, i) => answers.value[i] || '')
    const res = await submitAssessment(type.value, ans)
    result.value = res.data
    ElMessage.success('测评完成')
  } catch {}
  submitting.value = false
}

function reset() { result.value = null; questions.value = []; answers.value = {} }
</script>

<style scoped>
.q-item { margin-bottom: 20px; }
.q-title { font-weight: 600; margin-bottom: 8px; }
.result-box { padding: 20px; background: var(--color-primary-light); border-radius: 8px; }
</style>
