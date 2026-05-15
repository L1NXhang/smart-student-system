<template>
  <div class="events-page">
    <div class="page-header">
      <h2>活动报名</h2>
      <p>浏览校园活动并在线报名参加</p>
    </div>

    <el-card>
      <div class="toolbar">
        <el-tabs v-model="tab" @tab-change="load">
          <el-tab-pane label="活动列表" value="all" />
          <el-tab-pane label="我的报名" value="my" />
        </el-tabs>
        <el-select
          v-if="tab === 'all'"
          v-model="filter.type"
          placeholder="筛选类型"
          clearable
          style="width: 140px"
          @change="load"
        >
          <el-option label="学术" value="academic" />
          <el-option label="文体" value="sports" />
          <el-option label="志愿" value="volunteer" />
          <el-option label="文化" value="culture" />
          <el-option label="其他" value="other" />
        </el-select>
      </div>

      <!-- 活动列表 -->
      <el-row v-if="tab === 'all'" :gutter="16" v-loading="loading">
        <el-col :xs="24" :sm="12" :md="8" v-for="ev in list" :key="ev.id" class="event-col">
          <el-card class="event-card" shadow="hover" @click="showDetail(ev)">
            <div class="event-type-tag">
              <el-tag size="small" :type="typeTag(ev.event_type || ev.type)">
                {{ typeText(ev.event_type || ev.type) }}
              </el-tag>
              <el-tag v-if="isExpired(ev.deadline)" size="small" type="danger">已截止</el-tag>
            </div>
            <h4 class="event-title">{{ ev.title }}</h4>
            <div class="event-meta">
              <p><el-icon><Clock /></el-icon> {{ ev.event_time || ev.eventTime }}</p>
              <p><el-icon><Location /></el-icon> {{ ev.location || '待定' }}</p>
              <p><el-icon><User /></el-icon> {{ ev.quota ? `限${ev.quota}人` : '不限人数' }}</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="24" v-if="!loading && !list.length">
          <el-empty description="暂无活动" />
        </el-col>
      </el-row>

      <!-- 我的报名 -->
      <div v-if="tab === 'my'" v-loading="loading">
        <el-table :data="myRegistrations" stripe empty-text="暂未报名任何活动">
          <el-table-column prop="event?.title || event_title" label="活动名称" min-width="180" />
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="typeTag(row.event?.event_type || row.event_type)">
                {{ typeText(row.event?.event_type || row.event_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="event?.event_time || row.event_time" label="活动时间" width="160" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 'registered' ? 'success' : 'info'">
                {{ row.status === 'registered' ? '已报名' : row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-popconfirm
                v-if="row.status === 'registered'"
                title="确定取消报名？"
                @confirm="handleCancel(row.event_id || row.eventId)"
              >
                <template #reference>
                  <el-button type="danger" link size="small">取消报名</el-button>
                </template>
              </el-popconfirm>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDialog" :title="detail.title" width="560px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="活动类型">
          <el-tag size="small" :type="typeTag(detail.event_type || detail.type)">
            {{ typeText(detail.event_type || detail.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="活动时间">{{ detail.event_time || detail.eventTime }}</el-descriptions-item>
        <el-descriptions-item label="活动地点">{{ detail.location || '待定' }}</el-descriptions-item>
        <el-descriptions-item label="名额">{{ detail.quota ? `${detail.quota} 人` : '不限' }}</el-descriptions-item>
        <el-descriptions-item label="报名截止">{{ detail.deadline || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发布者">{{ detail.publisher?.name || '管理员' }}</el-descriptions-item>
        <el-descriptions-item label="活动简介" :span="2">{{ detail.description || '暂无简介' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="showDialog = false">关闭</el-button>
        <el-button
          type="primary"
          @click="handleRegister"
          :loading="registering"
          :disabled="isExpired(detail.deadline) || detail.is_registered"
        >
          {{ detail.is_registered ? '已报名' : isExpired(detail.deadline) ? '已截止' : '立即报名' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Location, User } from '@element-plus/icons-vue'
import { FadeContent, GradientText } from '@/components/react-bits'
import {
  getEvents, getEvent, registerEvent, cancelEvent, getMyEventRegistrations,
} from '@/api/message'

const tab = ref('all')
const filter = ref({ type: '' })
const list = ref([])
const myRegistrations = ref([])
const loading = ref(false)
const registering = ref(false)
const showDialog = ref(false)
const detail = ref({})

function typeTag(type) {
  const map = { academic: '', sports: 'success', volunteer: 'warning', culture: 'danger', other: 'info' }
  return map[type] || 'info'
}

function typeText(type) {
  const map = { academic: '学术', sports: '文体', volunteer: '志愿', culture: '文化', other: '其他' }
  return map[type] || type
}

function isExpired(deadline) {
  if (!deadline) return false
  return new Date(deadline).getTime() < Date.now()
}

async function load() {
  loading.value = true
  try {
    if (tab.value === 'my') {
      const res = await getMyEventRegistrations()
      myRegistrations.value = res.data || []
    } else {
      const res = await getEvents({ eventType: filter.value.type || '' })
      list.value = res.data?.list || res.data || []
    }
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
  }
}

async function showDetail(ev) {
  try {
    const res = await getEvent(ev.id)
    detail.value = res.data || ev
  } catch {
    detail.value = ev
  }
  showDialog.value = true
}

async function handleRegister() {
  if (detail.value.is_registered || isExpired(detail.value.deadline)) return
  registering.value = true
  try {
    await registerEvent(detail.value.id)
    ElMessage.success('报名成功')
    detail.value.is_registered = true
    showDialog.value = false
    if (tab.value === 'my') await load()
  } catch {
    /* handled by interceptor */
  } finally {
    registering.value = false
  }
}

async function handleCancel(eventId) {
  try {
    await cancelEvent(eventId)
    ElMessage.success('已取消报名')
    await load()
  } catch {
    /* handled by interceptor */
  }
}

onMounted(() => load())
</script>

<style scoped>
.events-page {
  max-width: 960px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-col {
  margin-bottom: 16px;
}

.event-card {
  cursor: pointer;
  height: 100%;
  transition: all 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}

.event-type-tag {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.event-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  line-height: 1.4;
}

.event-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 2;
}

.event-meta p {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}

.event-meta .el-icon {
  flex-shrink: 0;
}
</style>
