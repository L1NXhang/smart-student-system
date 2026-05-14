<template>
  <div class="notice-page">
    <div class="page-header">
      <h2>公告通知</h2>
      <p>查看班级和年级的最新通知公告</p>
    </div>

    <el-card>
      <div class="toolbar">
        <el-tabs v-model="tab" @tab-change="load">
          <el-tab-pane label="全部" value="all" />
          <el-tab-pane label="班级公告" value="class" />
          <el-tab-pane label="年级通知" value="grade" />
        </el-tabs>
        <div class="unread-badge" v-if="unreadCount > 0">
          <el-tag type="danger" round>{{ unreadCount }} 条未读</el-tag>
        </div>
      </div>

      <div v-loading="loading">
        <div
          v-for="a in list"
          :key="a.id"
          class="notice-card"
          :class="{ unread: !a.is_read }"
          @click="showDetail(a)"
        >
          <div class="notice-head">
            <div class="notice-title-row">
              <span v-if="!a.is_read" class="unread-dot" />
              <h4>{{ a.title }}</h4>
            </div>
            <el-tag size="small" :type="a.type === 'grade' ? 'warning' : ''">
              {{ a.type === 'grade' ? '年级通知' : '班级公告' }}
            </el-tag>
          </div>
          <p class="notice-meta">
            {{ a.created_at || a.createdAt }} · {{ a.publisher?.name || a.publisherName || '管理员' }}
          </p>
        </div>

        <el-empty v-if="!loading && !list.length" description="暂无公告" />
      </div>

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @change="load"
        />
      </div>
    </el-card>

    <el-dialog v-model="showDialog" :title="detail.title" width="640px" @opened="markRead(detail.id)">
      <div class="detail-content" v-html="detail.content" />
      <el-divider />
      <p class="detail-footer">
        {{ detail.created_at || detail.createdAt }}
        · {{ detail.publisher?.name || detail.publisherName || '管理员' }}
        <el-tag v-if="detail.type" size="small" style="margin-left: 8px">
          {{ detail.type === 'grade' ? '年级通知' : '班级公告' }}
        </el-tag>
      </p>
      <template #footer>
        <el-button @click="showDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAnnouncements, getAnnouncement, markAnnouncementRead, getUnreadAnnounceCount } from '@/api/message'

const tab = ref('all')
const list = ref([])
const loading = ref(false)
const showDialog = ref(false)
const detail = ref({})
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const unreadCount = ref(0)

onMounted(async () => {
  await load()
  fetchUnreadCount()
})

async function load() {
  loading.value = true
  try {
    const res = await getAnnouncements({
      type: tab.value === 'all' ? '' : tab.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
  }
}

async function showDetail(item) {
  try {
    const res = await getAnnouncement(item.id)
    detail.value = res.data || item
  } catch {
    detail.value = item
  }
  showDialog.value = true
  // Mark item as read locally
  const idx = list.value.findIndex((a) => a.id === item.id)
  if (idx >= 0) list.value[idx].is_read = true
}

async function markRead(id) {
  try {
    await markAnnouncementRead(id)
    fetchUnreadCount()
  } catch {
    /* ignore */
  }
}

async function fetchUnreadCount() {
  try {
    const res = await getUnreadAnnounceCount()
    unreadCount.value = res.data?.count || res.data || 0
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.notice-page {
  max-width: 860px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unread-badge {
  margin-bottom: 16px;
}

.notice-card {
  padding: 16px 20px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: all 0.2s;
}

.notice-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-5);
}

.notice-card.unread {
  background: var(--el-color-primary-light-9);
}

.notice-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-title-row h4 {
  margin: 0;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-danger);
  flex-shrink: 0;
}

.notice-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 8px 0 0 0;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.detail-content {
  line-height: 1.8;
}

.detail-footer {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0;
}
</style>
