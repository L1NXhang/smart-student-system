<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAnnouncements, getEvents, getUnreadAnnounceCount } from '@/api/message'
import { getScholarshipApplications } from '@/api/scholarship'
import gsap from 'gsap'

const router = useRouter()

// --- stat data ---
const scholarshipCount = ref(0)
const unreadCount = ref(0)
const pendingCount = ref(0)
const eventCount = ref(0)

// --- animated display values ---
const displayScholarship = ref(0)
const displayUnread = ref(0)
const displayPending = ref(0)
const displayEvent = ref(0)

// --- list data ---
const announcements = ref([])
const events = ref([])

// --- loading ---
const loading = ref(true)
const loadError = ref(false)

async function fetchData() {
  try {
    loading.value = true
    loadError.value = false

    const [announceRes, eventRes, scholarshipRes, unreadRes] = await Promise.all([
      getAnnouncements({ page: 1, pageSize: 5 }),
      getEvents({ page: 1, pageSize: 5, status: 'upcoming' }),
      getScholarshipApplications(),
      getUnreadAnnounceCount()
    ])

    announcements.value = announceRes.data?.rows || announceRes.data || []
    events.value = eventRes.data?.rows || eventRes.data || []

    const scholarshipData = scholarshipRes.data?.rows || scholarshipRes.data || []
    scholarshipCount.value = scholarshipData.length
    pendingCount.value = scholarshipData.filter(
      item => item.status === 'pending' || item.status === 'reviewing'
    ).length

    unreadCount.value = unreadRes.data ?? 0
    eventCount.value = events.value.length
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function animateNumbers() {
  const counterObj = {
    scholarship: 0,
    unread: 0,
    pending: 0,
    event: 0
  }

  gsap.to(counterObj, {
    scholarship: scholarshipCount.value,
    unread: unreadCount.value,
    pending: pendingCount.value,
    event: eventCount.value,
    duration: 1,
    ease: 'power2.out',
    onUpdate: () => {
      displayScholarship.value = Math.round(counterObj.scholarship)
      displayUnread.value = Math.round(counterObj.unread)
      displayPending.value = Math.round(counterObj.pending)
      displayEvent.value = Math.round(counterObj.event)
    }
  })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function goNotice(id) {
  router.push({ name: 'Notice', query: { id } })
}

function goEvent(id) {
  router.push({ name: 'Events', query: { id } })
}

function goPage(routeName) {
  router.push({ name: routeName })
}

onMounted(async () => {
  await fetchData()
  animateNumbers()

  // stat cards stagger in from bottom
  gsap.from('.stat-card', {
    y: 40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out'
  })

  // list items fade in stagger, delayed after cards
  gsap.from('.notice-item, .event-item', {
    opacity: 0,
    y: 20,
    duration: 0.4,
    stagger: 0.08,
    ease: 'power2.out',
    delay: 0.4
  })
})
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <!-- page header -->
    <div class="page-header">
      <h2>工作台</h2>
      <p>欢迎回来，快速查看你的学习与生活动态</p>
    </div>

    <!-- error state -->
    <el-alert
      v-if="loadError"
      title="数据加载失败，请刷新重试"
      type="error"
      show-icon
      :closable="false"
      style="margin-bottom: 20px"
    />

    <!-- stat cards row -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-box" @click="goPage('ScholarshipList')">
          <div class="stat-icon scholarship">
            <el-icon :size="28"><Trophy /></el-icon>
          </div>
          <div class="stat-body">
            <span class="stat-number">{{ displayScholarship }}</span>
            <span class="stat-label">我的奖学金</span>
          </div>
          <span class="stat-badge" v-if="pendingCount > 0">{{ pendingCount }} 待审</span>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-box" @click="goPage('Notice')">
          <div class="stat-icon notice">
            <el-icon :size="28"><Bell /></el-icon>
          </div>
          <div class="stat-body">
            <span class="stat-number">{{ displayUnread }}</span>
            <span class="stat-label">未读通知</span>
          </div>
          <span class="stat-badge unread" v-if="unreadCount > 0">{{ unreadCount }} 条未读</span>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-box" @click="goPage('ScholarshipList')">
          <div class="stat-icon pending">
            <el-icon :size="28"><Clock /></el-icon>
          </div>
          <div class="stat-body">
            <span class="stat-number">{{ displayPending }}</span>
            <span class="stat-label">待审核申请</span>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card card-box" @click="goPage('Events')">
          <div class="stat-icon event">
            <el-icon :size="28"><Calendar /></el-icon>
          </div>
          <div class="stat-body">
            <span class="stat-number">{{ displayEvent }}</span>
            <span class="stat-label">近期活动</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- two-column content -->
    <el-row :gutter="20" class="content-row">
      <!-- left: recent announcements -->
      <el-col :xs="24" :md="12">
        <div class="card-box list-card">
          <div class="card-title">
            <span>近期公告</span>
            <el-button text type="primary" size="small" @click="goPage('Notice')">
              查看全部
            </el-button>
          </div>
          <div v-if="announcements.length === 0" class="empty-state">暂无公告</div>
          <div
            v-for="(item, idx) in announcements"
            :key="item.id || idx"
            class="notice-item list-item"
            @click="goNotice(item.id)"
          >
            <div class="item-title">{{ item.title }}</div>
            <div class="item-time">{{ formatDate(item.createdAt || item.createTime) }}</div>
          </div>
        </div>
      </el-col>

      <!-- right: upcoming events -->
      <el-col :xs="24" :md="12">
        <div class="card-box list-card">
          <div class="card-title">
            <span>近期活动</span>
            <el-button text type="primary" size="small" @click="goPage('Events')">
              查看全部
            </el-button>
          </div>
          <div v-if="events.length === 0" class="empty-state">暂无活动</div>
          <div
            v-for="(item, idx) in events"
            :key="item.id || idx"
            class="event-item list-item"
            @click="goEvent(item.id)"
          >
            <div class="item-title">{{ item.title }}</div>
            <div class="item-meta">
              <el-icon :size="14"><Calendar /></el-icon>
              <span>{{ formatDate(item.eventTime || item.startTime) }}</span>
              <template v-if="item.location">
                <el-icon :size="14" style="margin-left: 12px"><LocationFilled /></el-icon>
                <span>{{ item.location }}</span>
              </template>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 0;
}

/* ====== stat cards ====== */
.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  cursor: pointer;
  position: relative;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon.scholarship {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #e6a23c;
}
.stat-icon.notice {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #67c23a;
}
.stat-icon.pending {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #409eff;
}
.stat-icon.event {
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  color: #9c27b0;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  color: #fff;
}
.stat-badge.unread {
  background: #f56c6c;
}
.stat-badge:not(.unread) {
  background: #e6a23c;
}

/* ====== content row ====== */
.content-row {
  margin-bottom: 20px;
}

.list-card {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border, #dcdfe6);
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 14px;
  padding: 40px 0;
}

/* ====== list items ====== */
.list-item {
  padding: 14px 20px;
  border-bottom: 1px solid #f2f2f5;
  cursor: pointer;
  transition: background 0.2s ease;
}
.list-item:last-child {
  border-bottom: none;
}
.list-item:hover {
  background: #f5f7fa;
}

.item-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  font-size: 12px;
  color: #c0c4cc;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #c0c4cc;
}

/* ====== responsive ====== */
@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 12px;
  }
  .stat-number {
    font-size: 24px;
  }
}
</style>
