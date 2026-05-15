<template>
  <div class="dashboard">
    <FadeContent>
    <ParticlesBackground :count="40" color="rgba(64, 158, 255, 0.08)" :speed="0.2" />
    <div class="page-header">
      <h2>
        <ShinyText color="#303133" :speed="6">工作台</ShinyText>
      </h2>
      <p>
        <BlurText text="欢迎回来，快速查看你的学习与生活动态" :duration="0.5" :stagger="0.03" />
      </p>
    </div>

    <!-- Error -->
    <el-alert
      v-if="loadError"
      title="数据加载失败，请刷新重试"
      type="error" show-icon :closable="false"
      style="margin-bottom: 20px"
    />

    <!-- Stat Cards -->
    <Reveal :delay="0.1">
      <div class="stat-row" ref="statRow">
        <TiltCard v-for="card in statCards" :key="card.key" :max-tilt="6" :scale="1.03" class="stat-card-wrap">
          <div class="stat-card" @click="$router.push(card.path)">
            <div class="stat-icon" :class="card.cls">
              <el-icon :size="24"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-body">
              <span class="stat-num">
                <CountUp :to="card.value" :duration="1.2" />
              </span>
              <span class="stat-lbl">{{ card.label }}</span>
            </div>
            <span class="stat-badge" v-if="card.badge">{{ card.badge }}</span>
          </div>
        </TiltCard>
      </div>
    </Reveal>

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
    </FadeContent>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { getAnnouncements, getEvents, getUnreadAnnounceCount } from '@/api/message'
import { getScholarshipApplications } from '@/api/scholarship'
import { Trophy, Bell, Clock, Calendar } from '@element-plus/icons-vue'
import { ParticlesBackground, ShinyText, BlurText, CountUp, Reveal, TiltCard } from '@/components/react-bits'

const announcements = ref([])
const events = ref([])
const loading = ref(true)
const loadError = ref(false)

const scholarshipCount = ref(0), unreadCount = ref(0), pendingCount = ref(0), eventCount = ref(0)

const statCards = computed(() => [
  { key: 'scholarship', cls: 'sch', icon: Trophy, value: scholarshipCount.value, label: '我的奖学金', path: '/scholarship', badge: pendingCount.value > 0 ? `${pendingCount.value} 待审` : '' },
  { key: 'notice', cls: 'nt', icon: Bell, value: unreadCount.value, label: '未读通知', path: '/message/notice', badge: unreadCount.value > 0 ? `${unreadCount.value} 条` : '' },
  { key: 'pending', cls: 'pd', icon: Clock, value: pendingCount.value, label: '待审核申请', path: '/scholarship', badge: '' },
  { key: 'event', cls: 'ev', icon: Calendar, value: eventCount.value, label: '近期活动', path: '/message/events', badge: '' },
])
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
