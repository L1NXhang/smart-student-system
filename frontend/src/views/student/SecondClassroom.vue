<template>
  <div class="sc-page">
    <div class="page-header">
      <h2>第二课堂成绩单</h2>
      <p>查看第二课堂活动参与情况、学时进度与学分统计</p>
    </div>

    <!-- 总览 -->
    <div class="summary-row" ref="summaryRow">
      <div class="summary-card">
        <div class="card-icon">📚</div>
        <div class="card-value">{{ summary.totalHours || 0 }}<span class="unit">h</span></div>
        <div class="card-label">已修总时长</div>
      </div>
      <div class="summary-card">
        <div class="card-icon">⭐</div>
        <div class="card-value">{{ summary.totalPoints || 0 }}</div>
        <div class="card-label">已获总学分</div>
      </div>
      <div class="summary-card">
        <div class="card-icon">🎯</div>
        <div class="card-value">{{ remainingHours }}<span class="unit">h</span></div>
        <div class="card-label">距达标还差</div>
      </div>
    </div>

    <!-- 分类学时进度 -->
    <el-card class="progress-card">
      <template #header>
        <span class="card-header-title">分类学时进度</span>
        <span class="header-hint">达标要求：{{ requiredTotal }} 学时</span>
      </template>
      <div class="progress-list">
        <div v-for="cat in categories" :key="cat.key" class="progress-item">
          <div class="progress-header">
            <span class="progress-label">
              <span class="cat-icon">{{ cat.icon }}</span>
              {{ cat.label }}
            </span>
            <span class="progress-num" :class="{ done: cat.hours >= cat.required }">
              {{ cat.hours }} / {{ cat.required }} h
            </span>
          </div>
          <el-progress
            :percentage="cat.percent"
            :color="cat.color"
            :stroke-width="14"
            :text-inside="false"
          />
          <span v-if="cat.remaining > 0" class="progress-remaining">
            还差 {{ cat.remaining }} 学时
          </span>
          <span v-else class="progress-done">✓ 已达标</span>
        </div>
      </div>
    </el-card>

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
            <el-option v-for="s in semesters" :key="s.value" :label="s.label" :value="s.value" />
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
        <el-table-column label="类型" width="110">
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
import { ref, computed, onMounted } from 'vue'
import { getSecondClassroom } from '@/api/academic'
import gsap from 'gsap'

const loading = ref(false)
const activities = ref([])
const summary = ref({})
const semesterFilter = ref('')
const summaryRow = ref(null)

const requiredTotal = 40

const semesters = [
  { label: '2025-2026 第一学期', value: '2025-2026-1' },
  { label: '2025-2026 第二学期', value: '2025-2026-2' },
  { label: '2026-2027 第一学期', value: '2026-2027-1' },
  { label: '2026-2027 第二学期', value: '2026-2027-2' },
]

// Map raw activity types to 4 main categories
const categoryMap = {
  academic: 'academic',
  sports: 'sports',
  culture: 'sports',   // 文体 = sports + culture
  volunteer: 'volunteer',
  other: 'other',
}

const categoryConfig = {
  academic: { label: '学术科创', icon: '🔬', required: 8, color: '#409EFF' },
  sports: { label: '文体活动', icon: '⚽', required: 10, color: '#67C23A' },
  volunteer: { label: '志愿服务', icon: '🤝', required: 10, color: '#E6A23C' },
  other: { label: '其他活动', icon: '📋', required: 12, color: '#909399' },
}

const categories = computed(() => {
  const counts = { academic: 0, sports: 0, volunteer: 0, other: 0 }
  activities.value.forEach((a) => {
    const mapped = categoryMap[a.activity_type] || 'other'
    counts[mapped] = (counts[mapped] || 0) + (parseFloat(a.hours) || 0)
  })
  return Object.entries(categoryConfig).map(([key, cfg]) => {
    const hours = parseFloat(counts[key].toFixed(1))
    return {
      ...cfg,
      key,
      hours,
      remaining: Math.max(0, parseFloat((cfg.required - hours).toFixed(1))),
      percent: Math.min(100, Math.round((hours / cfg.required) * 100)),
    }
  })
})

const remainingHours = computed(() => {
  const total = summary.value.totalHours || 0
  return Math.max(0, parseFloat((requiredTotal - parseFloat(total)).toFixed(1)))
})

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
    setTimeout(() => animateSummary(), 100)
  } catch { /* handled */ }
  finally { loading.value = false }
}

function animateSummary() {
  if (summaryRow.value) {
    gsap.fromTo(summaryRow.value.querySelectorAll('.summary-card'),
      { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' })
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.sc-page { max-width: 960px; }

.summary-row {
  display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;
}

.summary-card {
  flex: 1; min-width: 140px; text-align: center; padding: 24px 16px;
  border-radius: 12px; background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: transform 0.2s;
}
.summary-card:hover { transform: translateY(-2px); }
.summary-card .card-icon { font-size: 28px; margin-bottom: 8px; }
.summary-card .card-value { font-size: 28px; font-weight: 700; color: var(--el-color-primary); margin-bottom: 4px; }
.summary-card .card-value .unit { font-size: 16px; font-weight: 400; }
.summary-card .card-label { font-size: 13px; color: #909399; }

/* Progress */
.progress-card { margin-bottom: 20px; }
.header-hint { font-size: 13px; color: #909399; font-weight: 400; }

.progress-list { display: flex; flex-direction: column; gap: 20px; }

.progress-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
}
.progress-label { font-size: 14px; font-weight: 500; }
.cat-icon { margin-right: 6px; }
.progress-num { font-size: 13px; color: #909399; }
.progress-num.done { color: #67C23A; font-weight: 600; }

.progress-remaining { font-size: 12px; color: #E6A23C; margin-top: 2px; display: block; }
.progress-done { font-size: 12px; color: #67C23A; margin-top: 2px; display: block; font-weight: 600; }

/* List */
.list-card { margin-top: 20px; }
.list-header { display: flex; justify-content: space-between; align-items: center; }
.card-header-title { font-weight: 600; }
</style>
