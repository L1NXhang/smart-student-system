<template>
  <div class="grades-page">
    <div class="page-header">
      <h2>成绩查询</h2>
      <p>查看各学期课程成绩、绩点统计与学业趋势</p>
    </div>

    <!-- 学期筛选 -->
    <div class="filters">
      <el-select v-model="selectedSemester" placeholder="全部学期" clearable @change="refresh">
        <el-option v-for="s in semesters" :key="s" :label="s" :value="s" />
      </el-select>
    </div>

    <!-- 统计卡片 -->
    <div v-if="displayGrades.length" class="stats-row" ref="statsRef">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value" ref="totalCreditRef">{{ totalCredit.toFixed(1) }}</div>
        <div class="stat-label">总学分</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-value" ref="avgScoreRef">{{ avgScore.toFixed(1) }}</div>
        <div class="stat-label">平均分</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value" ref="avgGpaRef">{{ avgGpa.toFixed(2) }}</div>
        <div class="stat-label">平均绩点</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-value">{{ gpaTrend }}</div>
        <div class="stat-label">绩点趋势</div>
      </div>
    </div>

    <!-- 成绩表格 -->
    <el-table
      v-if="displayGrades.length"
      :data="displayGrades"
      stripe
      v-loading="loading"
      style="margin-top: 20px"
    >
      <el-table-column prop="semester" label="学期" width="140" sortable />
      <el-table-column prop="course_name" label="课程名称" min-width="180" />
      <el-table-column label="课程类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.course_type === 'required' ? 'danger' : 'primary'" size="small">
            {{ row.course_type === 'required' ? '必修' : '选修' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="credit" label="学分" width="80" sortable />
      <el-table-column label="成绩" width="100" sortable prop="score">
        <template #default="{ row }">
          <span :class="scoreClass(row.score)">{{ row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绩点" width="80" sortable prop="gpa">
        <template #default="{ row }">
          {{ row.gpa }}
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="暂无成绩数据，请联系管理员导入" />

    <!-- 学期GPA趋势 -->
    <el-card v-if="semesterGPA.length > 1" class="trend-card">
      <template #header><span class="card-title">学期绩点趋势</span></template>
      <div class="trend-bars">
        <div v-for="s in semesterGPA" :key="s.semester" class="trend-bar-item">
          <div class="trend-semester">{{ s.semester }}</div>
          <div class="trend-bar-wrap">
            <div
              class="trend-bar-fill"
              :style="{ width: (s.gpa / 5 * 100) + '%', background: s.gpa >= 3 ? '#67C23A' : s.gpa >= 2 ? '#E6A23C' : '#F56C6C' }"
            />
          </div>
          <div class="trend-value">{{ s.gpa.toFixed(2) }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { getGrades } from '@/api/academic'
import gsap from 'gsap'

const loading = ref(false)
const grades = ref([])
const selectedSemester = ref('')
const semesters = ref([])
const statsRef = ref(null)
const totalCreditRef = ref(null)
const avgScoreRef = ref(null)
const avgGpaRef = ref(null)

const displayGrades = computed(() => {
  if (!selectedSemester.value) return grades.value
  return grades.value.filter((g) => g.semester === selectedSemester.value)
})

const totalCredit = computed(() =>
  displayGrades.value.reduce((s, g) => s + (Number(g.credit) || 0), 0))
const avgScore = computed(() => {
  const list = displayGrades.value
  return list.length ? list.reduce((s, g) => s + (Number(g.score) || 0), 0) / list.length : 0
})
const avgGpa = computed(() => {
  const list = displayGrades.value
  return list.length ? list.reduce((s, g) => s + (Number(g.gpa) || 0), 0) / list.length : 0
})

// Semester GPA trend
const semesterGPA = computed(() => {
  const map = {}
  grades.value.forEach((g) => {
    if (!g.semester) return
    if (!map[g.semester]) map[g.semester] = { sum: 0, count: 0 }
    map[g.semester].sum += Number(g.gpa) || 0
    map[g.semester].count++
  })
  return Object.entries(map)
    .map(([semester, { sum, count }]) => ({ semester, gpa: sum / count }))
    .sort((a, b) => a.semester.localeCompare(b.semester))
})

const gpaTrend = computed(() => {
  if (semesterGPA.value.length < 2) return '-'
  const last = semesterGPA.value[semesterGPA.value.length - 1].gpa
  const prev = semesterGPA.value[semesterGPA.value.length - 2].gpa
  const diff = (last - prev).toFixed(2)
  return diff >= 0 ? `↑${diff}` : `↓${Math.abs(diff)}`
})

function scoreClass(score) {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getGrades()
    grades.value = res.list || res.data?.list || res.data || []
    const set = new Set(grades.value.map((g) => g.semester).filter(Boolean))
    semesters.value = Array.from(set).sort()
  } catch { /* handled */ }
  finally { loading.value = false; setTimeout(animateAll, 200) }
}

function refresh() { setTimeout(animateAll, 200) }

function animateAll() {
  gsap.fromTo('.el-table__body-wrapper tbody tr',
    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
  gsap.fromTo('.stat-card',
    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' })
}

onMounted(() => fetchData())
</script>

<style scoped>
.grades-page { max-width: 1000px; }
.filters { margin-bottom: 16px; }

.stats-row { display: flex; gap: 16px; flex-wrap: wrap; }
.stat-card {
  flex: 1; min-width: 120px; text-align: center; padding: 20px 16px;
  border-radius: 12px; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.stat-icon { font-size: 28px; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 700; color: #303133; margin-bottom: 4px; }
.stat-label { font-size: 13px; color: #909399; }

.score-excellent { color: #67C23A; font-weight: 700; }
.score-good { color: #409EFF; font-weight: 600; }
.score-pass { color: #303133; }
.score-fail { color: #F56C6C; font-weight: 600; }

.trend-card { margin-top: 24px; }
.card-title { font-weight: 600; }
.trend-bars { display: flex; flex-direction: column; gap: 12px; }
.trend-bar-item { display: flex; align-items: center; gap: 12px; }
.trend-semester { width: 140px; font-size: 13px; color: #606266; text-align: right; }
.trend-bar-wrap { flex: 1; height: 24px; background: #f0f0f0; border-radius: 12px; overflow: hidden; }
.trend-bar-fill { height: 100%; border-radius: 12px; transition: width 0.6s ease; min-width: 4px; }
.trend-value { width: 50px; font-size: 14px; font-weight: 600; }
</style>
