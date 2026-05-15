<template>
  <div class="admin-dashboard" ref="dashboardRef">
    <FadeContent>
    <GridMotionBackground color="rgba(64, 158, 255, 0.06)" :grid-size="60" :speed="0.2" />
    <!-- Stat Cards -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="(card, idx) in statCards" :key="idx">
        <div
          class="stat-card"
          :ref="el => statRefs[idx] = el"
          @click="navigateTo(card.path)"
          @mouseenter="onCardHover($event.currentTarget, true)"
          @mouseleave="onCardHover($event.currentTarget, false)"
        >
          <div class="stat-icon" :style="{ background: card.bg }">
            <el-icon :size="24" :color="card.color"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-body">
            <span class="stat-count" :ref="el => countRefs[idx] = el">0</span>
            <span class="stat-label">{{ card.label }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- Two Column -->
    <el-row :gutter="20">
      <!-- Pending Review -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">待审核事项</span>
              <el-tag v-if="stats.totalPending" type="danger" round>{{ stats.totalPending }} 项待处理</el-tag>
            </div>
          </template>
          <div class="pending-grid">
            <div
              v-for="item in pendingCards"
              :key="item.key"
              class="pending-card-item"
              :class="{ active: item.count > 0 }"
              @click="navigateTo(item.path)"
            >
              <div class="pending-count" :style="{ color: item.color }">
                {{ item.count }}
              </div>
              <div class="pending-label">{{ item.label }}</div>
            </div>
          </div>
          <el-empty v-if="!stats.totalPending" description="暂无待审核事项" :image-size="60" />
        </el-card>
      </el-col>

      <!-- Quick Actions -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="content-card">
          <template #header>
            <span class="card-title">快捷操作</span>
          </template>
          <el-row :gutter="12" class="action-row">
            <el-col :xs="12" :sm="6" v-for="act in quickActions" :key="act.label">
              <div class="action-btn" @click="navigateTo(act.path)">
                <el-icon :size="22" :color="act.color"><component :is="act.icon" /></el-icon>
                <span>{{ act.label }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    </FadeContent>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboardStats } from '@/api/admin'
import gsap from 'gsap'
import { GridMotionBackground } from '@/components/react-bits'

const router = useRouter()
const dashboardRef = ref(null)
const statRefs = ref([])
const countRefs = ref([])

const stats = reactive({
  totalStudents: 0, pendingScholarship: 0, pendingInfoChange: 0,
  pendingDifficulty: 0, unhandledFeedback: 0, pendingLateReturn: 0,
  pendingLeave: 0, totalPending: 0, totalEvents: 0,
})

const statCards = computed(() => [
  { icon: 'User', label: '学生总数', count: stats.totalStudents, bg: '#ECF5FF', color: '#409EFF', path: '/admin/students' },
  { icon: 'Clock', label: '待审核申请', count: stats.totalPending, bg: '#FDF6EC', color: '#E6A23C', path: '/admin/applications/scholarship' },
  { icon: 'ChatLineSquare', label: '未处理反馈', count: stats.unhandledFeedback, bg: '#FEF0F0', color: '#F56C6C', path: '/admin/notice' },
  { icon: 'Warning', label: '今日晚归/外出', count: stats.pendingLateReturn + stats.pendingLeave, bg: '#FDE2E2', color: '#E6A23C', path: '/admin/safety' },
])

const pendingCards = computed(() => [
  { key: 'scholarship', label: '奖学金申请', count: stats.pendingScholarship, color: '#409EFF', path: '/admin/applications/scholarship' },
  { key: 'infoChange', label: '信息变更', count: stats.pendingInfoChange, color: '#67C23A', path: '/admin/applications/info-change' },
  { key: 'difficulty', label: '困难认定', count: stats.pendingDifficulty, color: '#E6A23C', path: '/admin/applications/info-change' },
  { key: 'lateReturn', label: '晚归登记', count: stats.pendingLateReturn, color: '#F56C6C', path: '/admin/safety' },
  { key: 'leave', label: '外出报备', count: stats.pendingLeave, color: '#909399', path: '/admin/safety' },
])

const quickActions = [
  { label: '发布公告', icon: 'Bell', path: '/admin/notice', color: '#409EFF' },
  { label: '管理活动', icon: 'Calendar', path: '/admin/events', color: '#67C23A' },
  { label: '导入成绩', icon: 'Upload', path: '/admin/academic/grades', color: '#E6A23C' },
  { label: '考试管理', icon: 'EditPen', path: '/admin/exams', color: '#909399' },
  { label: '学生管理', icon: 'UserFilled', path: '/admin/students', color: '#409EFF' },
  { label: '勤工助学', icon: 'Briefcase', path: '/admin/work-study', color: '#67C23A' },
  { label: '活动发布', icon: 'Present', path: '/admin/events', color: '#E6A23C' },
  { label: '安全管理', icon: 'Lock', path: '/admin/safety', color: '#F56C6C' },
]

function navigateTo(path) { router.push(path) }

let ctx
onMounted(async () => {
  try {
    const res = await getDashboardStats()
    if (res.data) Object.assign(stats, res.data)
  } catch { /* handled */ }
  // GSAP
  ctx = gsap.context(() => {
    gsap.from(statRefs.value, { y: 40, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' })
    gsap.from('.content-card', { y: 30, autoAlpha: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out', delay: 0.5 })
    countRefs.value.forEach((el, i) => {
      if (!el) return
      const proxy = { value: 0 }
      gsap.to(proxy, {
        value: statCards.value[i]?.count || 0,
        duration: 1.5, delay: 0.3 + i * 0.12, ease: 'power2.out',
        snap: { value: 1 },
        onUpdate() { el.textContent = String(Math.round(proxy.value)) },
      })
    })
  }, dashboardRef.value)
})

onUnmounted(() => ctx?.revert())

function onCardHover(el, entering) {
  gsap.to(el, {
    y: entering ? -6 : 0,
    boxShadow: entering ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
    duration: 0.3, ease: 'power2.out',
  })
}
</script>

<style scoped>
.admin-dashboard { padding: 0; }

.stat-row { margin-bottom: 20px; }

.stat-card {
  display: flex; align-items: center; gap: 16px; background: #fff;
  border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer; margin-bottom: 16px;
}
.stat-icon {
  width: 52px; height: 52px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-body { display: flex; flex-direction: column; }
.stat-count { font-size: 28px; font-weight: 700; color: #303133; line-height: 1.3; }
.stat-label { font-size: 14px; color: #909399; margin-top: 2px; }

.content-card { margin-bottom: 16px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-title { font-size: 16px; font-weight: 600; color: #303133; }

/* Pending Grid */
.pending-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
.pending-card-item {
  text-align: center; padding: 20px 12px; border-radius: 10px;
  background: #fafafa; cursor: pointer; transition: all 0.2s;
}
.pending-card-item:hover { background: #f0f2f5; transform: translateY(-2px); }
.pending-card-item.active { background: #fef0f0; }
.pending-count { font-size: 32px; font-weight: 700; }
.pending-label { font-size: 13px; color: #909399; margin-top: 4px; }

/* Quick Actions */
.action-row { padding: 8px 0; }
.action-btn {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 20px 12px; border-radius: 8px; background: #fafafa;
  cursor: pointer; transition: background 0.2s; margin-bottom: 12px;
}
.action-btn:hover { background: #f0f2f5; }
.action-btn span { font-size: 13px; color: #606266; white-space: nowrap; }
</style>
