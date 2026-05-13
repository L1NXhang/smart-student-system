<template>
  <div class="page">
    <div class="page-header"><h2>公告通知</h2></div>
    <el-tabs v-model="tab" @tab-change="load">
      <el-tab-pane label="全部" value="all" />
      <el-tab-pane label="班级" value="class" />
      <el-tab-pane label="年级" value="grade" />
    </el-tabs>
    <div v-loading="loading">
      <el-card v-for="a in list" :key="a.id" class="notice-card" @click="showDetail(a)">
        <div class="notice-head">
          <h4>{{ a.title }}</h4>
          <el-tag size="small" :type="a.type === 'grade' ? 'warning' : ''">{{ a.type === 'grade' ? '年级' : '班级' }}</el-tag>
        </div>
        <p class="notice-meta">{{ a.createdAt }} · {{ a.publisherName || '管理员' }}</p>
      </el-card>
      <el-empty v-if="!loading && !list.length" description="暂无公告" />
    </div>

    <el-dialog v-model="showDialog" :title="detail.title" width="600px">
      <div v-html="detail.content" />
      <p style="margin-top:12px;color:var(--color-info);font-size:13px">
        {{ detail.createdAt }} · {{ detail.publisherName || '管理员' }}
      </p>
      <template #footer>
        <el-button type="primary" @click="markRead(detail.id); showDialog = false">确认已读</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAnnouncements, getAnnouncement, markAnnouncementRead } from '@/api/message'

const tab = ref('all')
const list = ref([])
const loading = ref(false)
const showDialog = ref(false)
const detail = ref({})

onMounted(() => load())

async function load() {
  loading.value = true
  try {
    const res = await getAnnouncements({ type: tab.value === 'all' ? '' : tab.value })
    list.value = res.data?.list || res.data || []
  } catch {}
  loading.value = false
}

async function showDetail(item) {
  try {
    const res = await getAnnouncement(item.id)
    detail.value = res.data
  } catch { detail.value = item }
  showDialog.value = true
}

async function markRead(id) { await markAnnouncementRead(id) }
</script>

<style scoped>
.notice-card { margin-bottom: 10px; cursor: pointer; }
.notice-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
.notice-head { display: flex; justify-content: space-between; align-items: center; }
.notice-meta { font-size: 12px; color: var(--color-info); margin-top: 8px; }
</style>
