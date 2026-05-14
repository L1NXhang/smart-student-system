<template>
  <div class="sc-page">
    <div class="page-header">
      <h2>第二课堂成绩单</h2>
      <p>查看第二课堂活动参与情况和学分统计</p>
    </div>

    <!-- 统计卡片 -->
    <div class="summary-row" ref="summaryRow">
      <div class="summary-card total">
        <div class="card-icon">📚</div>
        <div class="card-value">{{ summary.totalHours || 0 }}</div>
        <div class="card-label">总时长 (小时)</div>
      </div>
      <div class="summary-card points">
        <div class="card-icon">⭐</div>
        <div class="card-value">{{ summary.totalPoints || 0 }}</div>
        <div class="card-label">总学分</div>
      </div>
      <div class="summary-card academic">
        <div class="card-icon">📖</div>
        <div class="card-value">{{ summary.academicHours || 0 }}h</div>
        <div class="card-label">学术活动</div>
      </div>
      <div class="summary-card sports">
        <div class="card-icon">⚽</div>
        <div class="card-value">{{ summary.sportsHours || 0 }}h</div>
        <div class="card-label">体育活动</div>
      </div>
      <div class="summary-card volunteer">
        <div class="card-icon">🤝</div>
        <div class="card-value">{{ summary.volunteerHours || 0 }}h</div>
        <div class="card-label">志愿活动</div>
      </div>
    </div>

    <!-- 活动列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="list-header">
          <span class="card-header-title">活动记录</span>
          <el-select
            v-model="semesterFilter"
            placeholder="筛选学期"
            clearable
            style="width: 200px"
            @change="fetchData"
          >
            <el-option
              v-for="s in semesters"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </div>
      </template>

      <el-table
        :data="activities"
        stripe
        v-loading="loading"
        empty-text="暂无活动记录，请联系管理员导入数据"
      >
        <el-table-column prop="activity_name" label="活动名称" min-width="180" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.activity_type)" size="small">
              {{ typeText(row.activity_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hours" label="时长(h)" width="90" align="center" />
        <el-table-column prop="points" label="学分" width="80" align="center" />
        <el-table-column prop="semester" label="学期" width="140" />
        <el-table-column prop="created_at" label="记录时间" width="160" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSecondClassroom } from '@/api/academic'
import gsap from 'gsap'

const loading = ref(false)
const activities = ref([])
const summary = ref({})
const semesterFilter = ref('')
const summaryRow = ref(null)

const semesters = [
  { label: '2025-2026 第一学期', value: '2025-2026-1' },
  { label: '2025-2026 第二学期', value: '2025-2026-2' },
  { label: '2026-2027 第一学期', value: '2026-2027-1' },
  { label: '2026-2027 第二学期', value: '2026-2027-2' },
]

function typeTag(type) {
  const map = { academic: '', sports: 'success', volunteer: 'warning', culture: 'danger', other: 'info' }
  return map[type] || 'info'
}

function typeText(type) {
  const map = { academic: '学术', sports: '体育', volunteer: '志愿', culture: '文化', other: '其他' }
  return map[type] || type
}

async function fetchData() {
  loading.value = true
  try {
    const params = {}
    if (semesterFilter.value) params.semester = semesterFilter.value
    const res = await getSecondClassroom(params)
    activities.value = res.data.activities || []
    summary.value = res.data.summary || {}
    // GSAP animate summary cards
    setTimeout(() => animateSummary(), 100)
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
  }
}

function animateSummary() {
  if (summaryRow.value) {
    const cards = summaryRow.value.querySelectorAll('.summary-card')
    gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' })
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.sc-page {
  max-width: 960px;
}

/* Summary cards */
.summary-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  min-width: 140px;
  text-align: center;
  padding: 24px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card .card-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.summary-card .card-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.summary-card.points .card-value { color: #E6A23C; }
.summary-card.sports .card-value { color: #67C23A; }
.summary-card.volunteer .card-value { color: #E6A23C; }

.summary-card .card-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* List */
.list-card {
  margin-top: 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-title {
  font-weight: 600;
}
</style>
