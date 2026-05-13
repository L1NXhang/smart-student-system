<template>
  <div class="admin-dashboard" ref="dashboardRef">
    <!-- Stat Cards Row -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="(card, idx) in statCards" :key="idx">
        <div class="stat-card" :ref="el => statRefs[idx] = el" @mouseenter="onCardHover($event.currentTarget, true)" @mouseleave="onCardHover($event.currentTarget, false)">
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

    <!-- Two-Column Grid -->
    <el-row :gutter="20" class="content-row">
      <!-- Left: Pending Items -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="pending-card content-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">待审核事项</span>
            </div>
          </template>
          <el-tabs v-model="activeTab" class="pending-tabs">
            <el-tab-pane label="奖学金申请" name="scholarship">
              <div v-if="pendingItems.scholarship.length" class="pending-list">
                <div
                  v-for="item in pendingItems.scholarship"
                  :key="item.id"
                  class="pending-item"
                >
                  <div class="pending-info">
                    <span class="pending-name">{{ item.name }}</span>
                    <span class="pending-type">{{ item.type }}</span>
                  </div>
                  <span class="pending-time">{{ item.time }}</span>
                </div>
              </div>
              <el-empty v-else description="暂无待审核事项" :image-size="80" />
            </el-tab-pane>
            <el-tab-pane label="信息变更" name="infoChange">
              <div v-if="pendingItems.infoChange.length" class="pending-list">
                <div
                  v-for="item in pendingItems.infoChange"
                  :key="item.id"
                  class="pending-item"
                >
                  <div class="pending-info">
                    <span class="pending-name">{{ item.name }}</span>
                    <span class="pending-type">{{ item.type }}</span>
                  </div>
                  <span class="pending-time">{{ item.time }}</span>
                </div>
              </div>
              <el-empty v-else description="暂无待审核事项" :image-size="80" />
            </el-tab-pane>
            <el-tab-pane label="困难认定" name="difficulty">
              <div v-if="pendingItems.difficulty.length" class="pending-list">
                <div
                  v-for="item in pendingItems.difficulty"
                  :key="item.id"
                  class="pending-item"
                >
                  <div class="pending-info">
                    <span class="pending-name">{{ item.name }}</span>
                    <span class="pending-type">{{ item.type }}</span>
                  </div>
                  <span class="pending-time">{{ item.time }}</span>
                </div>
              </div>
              <el-empty v-else description="暂无待审核事项" :image-size="80" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <!-- Right: System Overview -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="overview-card content-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">系统概览</span>
            </div>
          </template>
          <el-row :gutter="16" class="action-row">
            <el-col :xs="12" :sm="6" v-for="(action, idx) in quickActions" :key="idx">
              <div class="action-btn" @click="navigateTo(action.path)">
                <el-icon :size="22" :color="action.color"><component :is="action.icon" /></el-icon>
                <span>{{ action.label }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'

const router = useRouter()
const dashboardRef = ref(null)
const statRefs = ref([])
const countRefs = ref([])

// --- Stat Cards Data ---
const statCards = [
  { icon: 'User', label: '学生总数', count: 1256, bg: '#ECF5FF', color: '#409EFF' },
  { icon: 'Clock', label: '待审核申请', count: 23, bg: '#FDF6EC', color: '#E6A23C' },
  { icon: 'ChatLineSquare', label: '未处理反馈', count: 8, bg: '#FEF0F0', color: '#F56C6C' },
  { icon: 'Warning', label: '今日晚归', count: 5, bg: '#FDE2E2', color: '#E6A23C' },
]

// --- Pending Items ---
const activeTab = ref('scholarship')

const pendingItems = ref({
  scholarship: [
    { id: 1, name: '张三', type: '国家奖学金', time: '2025-05-12 14:30' },
    { id: 2, name: '李四', type: '学业奖学金', time: '2025-05-12 10:15' },
    { id: 3, name: '王五', type: '国家励志奖学金', time: '2025-05-11 16:42' },
    { id: 4, name: '赵六', type: '校级奖学金', time: '2025-05-11 09:20' },
    { id: 5, name: '孙七', type: '国家奖学金', time: '2025-05-10 15:08' },
  ],
  infoChange: [
    { id: 1, name: '周八', type: '联系方式变更', time: '2025-05-12 11:00' },
    { id: 2, name: '吴九', type: '家庭地址变更', time: '2025-05-11 08:30' },
    { id: 3, name: '郑十', type: '银行卡号变更', time: '2025-05-10 14:15' },
  ],
  difficulty: [],
})

// --- Quick Actions ---
const quickActions = [
  { label: '发布公告', icon: 'Bell', path: '/admin/notice', color: '#409EFF' },
  { label: '管理活动', icon: 'Calendar', path: '/admin/events', color: '#67C23A' },
  { label: '导入成绩', icon: 'Upload', path: '/admin/academic/grades', color: '#E6A23C' },
  { label: '管理考试', icon: 'EditPen', path: '/admin/exams', color: '#909399' },
]

function navigateTo(path) {
  router.push(path)
}

// --- GSAP Animations ---
let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    // Stat cards stagger in from bottom
    gsap.from(statRefs.value, {
      y: 40,
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power3.out',
    })

    // Content cards stagger in (delayed after stat cards)
    gsap.from('.content-card', {
      y: 30,
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: 'power2.out',
      delay: 0.5,
    })

    // Number count-up animation
    countRefs.value.forEach((el, i) => {
      if (!el) return
      const target = statCards[i].count
      const proxy = { value: 0 }
      gsap.to(proxy, {
        value: target,
        duration: 1.8,
        delay: 0.3 + i * 0.12,
        ease: 'power2.out',
        snap: { value: 1 },
        onUpdate() {
          el.textContent = String(Math.round(proxy.value))
        },
      })
    })
  }, dashboardRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})

// --- Card Hover ---
function onCardHover(el, entering) {
  gsap.to(el, {
    y: entering ? -6 : 0,
    boxShadow: entering
      ? '0 8px 24px rgba(0,0,0,0.12)'
      : '0 2px 8px rgba(0,0,0,0.06)',
    duration: 0.3,
    ease: 'power2.out',
  })
}
</script>

<style scoped>
.admin-dashboard {
  padding: 0;
}

/* --- Stat Cards --- */
.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  visibility: hidden;
  margin-bottom: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-body {
  display: flex;
  flex-direction: column;
}

.stat-count {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.3;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 2px;
}

/* --- Content Cards --- */
.content-row {
  margin-bottom: 20px;
}

.content-card {
  visibility: hidden;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* --- Pending Tabs --- */
.pending-tabs {
  min-height: 200px;
}

:deep(.pending-tabs .el-tabs__header) {
  margin-bottom: 12px;
}

.pending-list {
  display: flex;
  flex-direction: column;
}

.pending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.pending-item:last-child {
  border-bottom: none;
}

.pending-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pending-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.pending-type {
  font-size: 12px;
  color: #909399;
}

.pending-time {
  font-size: 12px;
  color: #c0c4cc;
}

/* --- Quick Actions --- */
.action-row {
  padding: 8px 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 12px;
}

.action-btn:hover {
  background: #f0f2f5;
}

.action-btn span {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}
</style>
