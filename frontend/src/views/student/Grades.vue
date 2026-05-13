<template>
  <div class="grades-page">
    <div class="page-header">
      <h2>成绩查询</h2>
      <p>查看各学期课程成绩与绩点统计</p>
    </div>

    <div class="filters">
      <el-select
        v-model="selectedSemester"
        placeholder="选择学期"
        clearable
        @change="onSemesterChange"
      >
        <el-option
          v-for="s in semesters"
          :key="s"
          :label="s"
          :value="s"
        />
      </el-select>
    </div>

    <el-table
      v-if="displayGrades.length"
      :data="displayGrades"
      stripe
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="semester" label="学期" width="140" />
      <el-table-column prop="courseName" label="课程名称" min-width="180" />
      <el-table-column prop="courseType" label="课程类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.courseType === '必修' ? 'danger' : 'primary'" size="small">
            {{ row.courseType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="credit" label="学分" width="80" />
      <el-table-column prop="score" label="成绩" width="100" />
      <el-table-column prop="gpa" label="绩点" width="80" />
    </el-table>

    <el-empty v-else description="暂无成绩数据" />

    <!-- 统计卡片 -->
    <div v-if="displayGrades.length" class="stats-row" ref="statsRef">
      <div class="stat-card">
        <div class="stat-label">总学分</div>
        <div class="stat-value" ref="totalCreditRef">{{ totalCredit.toFixed(1) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">平均分</div>
        <div class="stat-value" ref="avgScoreRef">{{ avgScore.toFixed(1) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">平均绩点</div>
        <div class="stat-value" ref="avgGpaRef">{{ avgGpa.toFixed(2) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
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

const totalCredit = computed(() => {
  return displayGrades.value.reduce((sum, g) => sum + (Number(g.credit) || 0), 0)
})

const avgScore = computed(() => {
  const list = displayGrades.value
  if (!list.length) return 0
  return list.reduce((sum, g) => sum + (Number(g.score) || 0), 0) / list.length
})

const avgGpa = computed(() => {
  const list = displayGrades.value
  if (!list.length) return 0
  return list.reduce((sum, g) => sum + (Number(g.gpa) || 0), 0) / list.length
})

onMounted(async () => {
  try {
    loading.value = true
    const res = await getGrades()
    grades.value = res.data?.list || res.data || []
    // Extract unique semesters
    const set = new Set(grades.value.map((g) => g.semester).filter(Boolean))
    semesters.value = Array.from(set).sort()
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
  }
  animateTable()
  animateStats()
})

function onSemesterChange() {
  setTimeout(() => {
    animateTable()
    animateStats()
  }, 0)
}

function animateTable() {
  gsap.fromTo(
    '.el-table__body-wrapper tbody tr',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
  )
}

function animateStats() {
  if (!statsRef.value) return

  // Fade in stats cards
  gsap.fromTo(
    '.stat-card',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
  )

  // Count-up animation for numbers
  nextTick(() => {
    const targets = [
      { ref: totalCreditRef, end: totalCredit.value },
      { ref: avgScoreRef, end: avgScore.value },
      { ref: avgGpaRef, end: avgGpa.value },
    ]
    targets.forEach(({ ref, end }) => {
      if (!ref) return
      gsap.fromTo(
        ref,
        { textContent: 0 },
        {
          textContent: end,
          duration: 1.2,
          ease: 'power2.out',
          snap: { textContent: 0.01 },
          onUpdate() {
            const val = Number(ref.textContent)
            if (ref === totalCreditRef) ref.textContent = val.toFixed(1)
            else if (ref === avgGpaRef) ref.textContent = val.toFixed(2)
            else ref.textContent = val.toFixed(1)
          },
        }
      )
    })
  })
}
</script>

<style scoped>
.grades-page {
  max-width: 1100px;
}

.filters {
  margin-bottom: 20px;
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-top: 24px;
}

.stat-card {
  flex: 1;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}
</style>
