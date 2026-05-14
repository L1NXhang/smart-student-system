<template>
  <div class="assessment-page">
    <div class="page-header">
      <h2>生涯测评</h2>
      <p>通过科学的测评工具，帮助你更好地认识自己，规划职业方向</p>
    </div>

    <!-- 测评选择 / 历史 -->
    <el-card v-if="!started && !showResult">
      <div class="test-types">
        <div class="test-card" @click="selectType('interest')">
          <div class="test-icon">🔬</div>
          <h3>职业兴趣测评</h3>
          <p>基于霍兰德职业兴趣理论，通过10道题评估你的职业兴趣倾向，帮助你找到最适合的职业方向。</p>
          <div class="test-meta">
            <el-tag size="small" type="info">10 题</el-tag>
            <el-tag size="small" type="info">约 5 分钟</el-tag>
          </div>
          <el-button type="primary" class="start-btn">开始测评</el-button>
        </div>

        <div class="test-card" @click="selectType('personality')">
          <div class="test-icon">🧠</div>
          <h3>性格测评</h3>
          <p>简化版 MBTI 性格测试，通过8道题了解你的性格特征和工作风格偏好。</p>
          <div class="test-meta">
            <el-tag size="small" type="info">8 题</el-tag>
            <el-tag size="small" type="info">约 3 分钟</el-tag>
          </div>
          <el-button type="primary" class="start-btn">开始测评</el-button>
        </div>
      </div>

      <!-- 测评历史 -->
      <div v-if="history.length" class="history-section">
        <h3 class="section-title">测评历史</h3>
        <el-table :data="history" stripe>
          <el-table-column label="类型" width="120">
            <template #default="{ row }">
              {{ row.assessment_type === 'interest' ? '职业兴趣' : '性格测评' }}
            </template>
          </el-table-column>
          <el-table-column prop="result_type" label="测评结果" width="120" />
          <el-table-column prop="result_description" label="结果描述" min-width="200" show-overflow-tooltip />
          <el-table-column label="职业建议" min-width="200">
            <template #default="{ row }">
              <template v-if="row.career_suggestions">
                <el-tag
                  v-for="s in row.career_suggestions"
                  :key="s"
                  size="small"
                  class="suggestion-tag"
                >{{ s }}</el-tag>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="测评时间" width="160" />
        </el-table>
      </div>
    </el-card>

    <!-- 答题界面 -->
    <el-card v-if="started && !showResult" class="exam-card">
      <div class="exam-header">
        <h3>{{ assessmentType === 'interest' ? '职业兴趣测评' : '性格测评' }}</h3>
        <div class="progress-info">
          已答 {{ answeredCount }} / {{ questions.length }} 题
        </div>
      </div>

      <el-progress
        :percentage="Math.round((answeredCount / questions.length) * 100)"
        :stroke-width="6"
        style="margin-bottom: 24px"
      />

      <div class="questions-area">
        <div v-for="(q, i) in questions" :key="i" class="question-item">
          <p class="question-title">
            <span class="question-num">{{ i + 1 }}.</span>
            {{ q.question }}
          </p>
          <el-radio-group v-model="answers[i]" class="options-group">
            <el-radio
              v-for="(opt, j) in q.options"
              :key="j"
              :value="opt[0]"
              class="option-item"
            >
              {{ opt }}
            </el-radio>
          </el-radio-group>
        </div>
      </div>

      <div class="exam-footer">
        <el-button @click="started = false">返回选择</el-button>
        <el-button
          type="primary"
          size="large"
          @click="submit"
          :loading="submitting"
          :disabled="answeredCount < questions.length"
        >
          提交测评
        </el-button>
      </div>
    </el-card>

    <!-- 结果展示 -->
    <el-card v-if="showResult" class="result-card">
      <div class="result-box">
        <div class="result-icon">📊</div>
        <h2 class="result-type">{{ result.resultType }}</h2>
        <p class="result-desc">{{ result.resultDescription }}</p>

        <div class="suggestions">
          <h4>适合你的职业方向</h4>
          <div class="suggestion-list">
            <el-tag
              v-for="c in result.careerSuggestions"
              :key="c"
              size="large"
              effect="plain"
              class="suggestion-item"
            >
              {{ c }}
            </el-tag>
          </div>
        </div>

        <div class="result-actions">
          <el-button type="primary" @click="backToList">返回测评列表</el-button>
          <el-button @click="retakeAssessment">重新测评</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAssessmentQuestions, submitAssessment, getAssessmentHistory } from '@/api/career'

const assessmentType = ref('interest')
const questions = ref([])
const answers = ref({})
const submitting = ref(false)
const started = ref(false)
const showResult = ref(false)
const result = ref({})
const history = ref([])

const answeredCount = computed(() => Object.keys(answers.value).filter((k) => answers.value[k]).length)

async function selectType(type) {
  assessmentType.value = type
  answers.value = {}
  try {
    const res = await getAssessmentQuestions(type)
    questions.value = res.data.questions || []
    if (!questions.value.length) {
      ElMessage.warning('该测评暂无题目')
      return
    }
    started.value = true
    showResult.value = false
  } catch {
    ElMessage.error('获取测评题目失败')
  }
}

async function submit() {
  if (submitting.value) return
  const unanswered = questions.value.filter((_, i) => !answers.value[i])
  if (unanswered.length > 0) {
    ElMessage.warning(`还有 ${unanswered.length} 题未作答`)
    return
  }
  submitting.value = true
  try {
    const ans = questions.value.map((_, i) => answers.value[i])
    const res = await submitAssessment(assessmentType.value, ans)
    result.value = res.data
    started.value = false
    showResult.value = true
    ElMessage.success('测评完成')
    await fetchHistory()
  } catch {
    /* handled by interceptor */
  } finally {
    submitting.value = false
  }
}

function backToList() {
  showResult.value = false
  started.value = false
}

function retakeAssessment() {
  showResult.value = false
  started.value = false
  selectType(assessmentType.value)
}

async function fetchHistory() {
  try {
    const res = await getAssessmentHistory()
    history.value = res.data || []
  } catch {
    /* handled by interceptor */
  }
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.assessment-page {
  max-width: 860px;
}

/* Test type selection */
.test-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 640px) {
  .test-types {
    grid-template-columns: 1fr;
  }
}

.test-card {
  padding: 28px;
  background: var(--el-fill-color-lighter);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.test-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.test-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.test-card h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.test-card p {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.test-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.start-btn {
  width: 100%;
}

/* History */
.history-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-light);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.suggestion-tag {
  margin: 2px;
}

/* Exam */
.exam-card {
  max-width: 100%;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.exam-header h3 {
  margin: 0;
}

.progress-info {
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
  margin-top: 8px;
}

/* Result */
.result-card {
  max-width: 560px;
  margin: 0 auto;
}

.result-box {
  text-align: center;
  padding: 24px 16px;
}

.result-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.result-type {
  font-size: 28px;
  color: var(--el-color-primary);
  margin: 0 0 8px 0;
}

.result-desc {
  color: var(--el-text-color-secondary);
  font-size: 15px;
  line-height: 1.6;
  margin: 0 auto;
  max-width: 420px;
}

.suggestions {
  margin-top: 24px;
}

.suggestions h4 {
  margin: 0 0 12px 0;
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.suggestion-item {
  font-size: 14px !important;
}

.result-actions {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
