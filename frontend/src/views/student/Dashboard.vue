<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>工作台</h2>
      <p>欢迎回来，快速查看你的学习与生活动态</p>
    </div>

    <!-- Error -->
    <el-alert
      v-if="loadError"
      title="数据加载失败，请刷新重试"
      type="error" show-icon :closable="false"
      style="margin-bottom: 20px"
    />

    <!-- Stat Cards -->
    <div class="stat-row" ref="statRow">
      <div class="stat-card" @click="$router.push('/scholarship')">
        <div class="stat-icon sch">
          <el-icon :size="24"><Trophy /></el-icon>
        </div>
        <div class="stat-body">
          <span class="stat-num">{{ displayScholarship }}</span>
          <span class="stat-lbl">我的奖学金</span>
        </div>
        <span class="stat-badge" v-if="pendingCount > 0">{{ pendingCount }} 待审</span>
      </div>

      <div class="stat-card" @click="$router.push('/message/notice')">
        <div class="stat-icon nt">
          <el-icon :size="24"><Bell /></el-icon>
        </div>
        <div class="stat-body">
          <span class="stat-num">{{ displayUnread }}</span>
          <span class="stat-lbl">未读通知</span>
        </div>
        <span class="stat-badge unread" v-if="unreadCount > 0">{{ unreadCount }} 条</span>
      </div>

      <div class="stat-card" @click="$router.push('/scholarship')">
        <div class="stat-icon pd">
          <el-icon :size="24"><Clock /></el-icon>
        </div>
        <div class="stat-body">
          <span class="stat-num">{{ displayPending }}</span>
          <span class="stat-lbl">待审核申请</span>
        </div>
      </div>

      <div class="stat-card" @click="$router.push('/message/events')">
        <div class="stat-icon ev">
          <el-icon :size="24"><Calendar /></el-icon>
        </div>
        <div class="stat-body">
          <span class="stat-num">{{ displayEvent }}</span>
          <span class="stat-lbl">近期活动</span>
        </div>
      </div>
    </div>

    <!-- Content Row -->
    <div class="content-row">
      <div class="list-card">
        <div class="card-head">
          <span>近期公告</span>
          <el-button text type="primary" size="small" @click="$router.push('/message/notice')">查看全部</el-button>
        </div>
        <div v-if="!announcements.length" class="empty-hint">暂无公告</div>
        <div v-for="item in announcements" :key="item.id" class="list-item" @click="$router.push('/message/notice')">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-time">{{ formatDate(item.created_at) }}</div>
        </div>
      </div>

      <div class="list-card">
        <div class="card-head">
          <span>近期活动</span>
          <el-button text type="primary" size="small" @click="$router.push('/message/events')">查看全部</el-button>
        </div>
        <div v-if="!events.length" class="empty-hint">暂无活动</div>
        <div v-for="item in events" :key="item.id" class="list-item" @click="$router.push('/message/events')">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-meta">
            <el-icon :size="14"><Calendar /></el-icon>
            <span>{{ formatDate(item.event_date) }}</span>
            <template v-if="item.location">
              <el-icon :size="14" style="margin-left:12px"><LocationFilled /></el-icon>
              <span>{{ item.location }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getAnnouncements, getEvents, getUnreadAnnounceCount } from '@/api/message'
import { getScholarshipApplications } from '@/api/scholarship'
import gsap from 'gsap'

const announcements = ref([])
const events = ref([])
const loading = ref(true)
const loadError = ref(false)

const scholarshipCount = ref(0), unreadCount = ref(0), pendingCount = ref(0), eventCount = ref(0)
const displayScholarship = ref(0), displayUnread = ref(0), displayPending = ref(0), displayEvent = ref(0)
const statRow = ref(null)
const countRefs = ref([])

function formatDate(d) {
  if (!d) return ''
  const t = new Date(d)
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0')
}

onMounted(async () => {
  try {
    const [a, e, s, u] = await Promise.all([
      getAnnouncements({ page: 1, pageSize: 5 }),
      getEvents({ page: 1, pageSize: 5 }),
      getScholarshipApplications(),
      getUnreadAnnounceCount(),
    ])
    announcements.value = a?.list || []
    events.value = e?.list || []
    const list = s?.list || []
    scholarshipCount.value = s?.total || list.length
    pendingCount.value = list.filter(i => i.status === 'pending').length
    unreadCount.value = u?.unread ?? 0
    eventCount.value = e?.total || events.value.length
  } catch { loadError.value = true }
  finally { loading.value = false }

  nextTick(() => {
    // Animate stat cards
    const cards = statRow.value?.querySelectorAll('.stat-card')
    if (cards) {
      gsap.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' })
    }
    // Animate counters
    const targets = [
      { ref: displayScholarship, end: scholarshipCount.value },
      { ref: displayUnread, end: unreadCount.value },
      { ref: displayPending, end: pendingCount.value },
      { ref: displayEvent, end: eventCount.value },
    ]
    targets.forEach((t, i) => {
      gsap.to({ v: 0 }, { v: t.end, duration: 1, delay: 0.2 + i * 0.1, ease: 'power2.out',
        onUpdate(p) { t.ref.value = Math.round(p.targets()[0].v) },
      })
    })
    // List items
    gsap.fromTo('.list-item', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, delay: 0.6 })
  })
})
</script>

<style scoped>
.dashboard { max-width: 100%; }

/* Stat row */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
@media (max-width: 900px) { .stat-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .stat-row { grid-template-columns: 1fr; } }

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }

.stat-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-icon.sch { background: #fff3e0; color: #e6a23c; }
.stat-icon.nt { background: #e8f5e9; color: #67c23a; }
.stat-icon.pd { background: #e3f2fd; color: #409eff; }
.stat-icon.ev { background: #fce4ec; color: #e91e63; }

.stat-body { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.stat-num { font-size: 26px; font-weight: 700; color: #303133; line-height: 1; }
.stat-lbl { font-size: 13px; color: #909399; }

.stat-badge {
  position: absolute; top: 12px; right: 12px;
  font-size: 11px; padding: 2px 8px; border-radius: 10px;
  color: #fff; background: #e6a23c;
}
.stat-badge.unread { background: #f56c6c; }

/* Content row */
.content-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 768px) { .content-row { grid-template-columns: 1fr; } }

.list-card {
  background: #fff; border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden; min-height: 280px;
}
.card-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #f0f0f0;
  font-size: 15px; font-weight: 600;
}
.empty-hint {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 40px 0; color: #c0c4cc; font-size: 14px;
}
.list-item {
  padding: 14px 20px; border-bottom: 1px solid #f5f5f5;
  cursor: pointer; transition: background 0.15s;
}
.list-item:last-child { border-bottom: none; }
.list-item:hover { background: #fafafa; }
.item-title {
  font-size: 14px; color: #303133; margin-bottom: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.item-time { font-size: 12px; color: #c0c4cc; }
.item-meta { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #c0c4cc; }
</style>
