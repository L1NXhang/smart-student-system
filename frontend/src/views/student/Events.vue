<template>
  <div class="page">
    <div class="page-header"><h2>活动报名</h2></div>

    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="6">
        <el-select v-model="filter.type" placeholder="活动类型" clearable @change="load">
          <el-option label="学术" value="academic" />
          <el-option label="文体" value="sports" />
          <el-option label="志愿" value="volunteer" />
          <el-option label="文化" value="culture" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="8" v-for="ev in list" :key="ev.id">
        <el-card class="event-card" @click="showDetail(ev)">
          <h4>{{ ev.title }}</h4>
          <el-tag size="small" style="margin:8px 0">{{ typeMap[ev.type || ev.eventType] || ev.type }}</el-tag>
          <div class="event-info">
            <p><el-icon><Clock /></el-icon> {{ ev.eventTime }}</p>
            <p><el-icon><Location /></el-icon> {{ ev.location }}</p>
            <p>名额：{{ ev.quota || '不限' }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-if="!list.length" description="暂无活动" />

    <el-dialog v-model="showDialog" :title="detail.title" width="550px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="活动类型">{{ typeMap[detail.type || detail.eventType] || detail.type }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ detail.eventTime }}</el-descriptions-item>
        <el-descriptions-item label="地点">{{ detail.location }}</el-descriptions-item>
        <el-descriptions-item label="简介">{{ detail.description }}</el-descriptions-item>
        <el-descriptions-item label="名额">{{ detail.quota || '不限' }}</el-descriptions-item>
        <el-descriptions-item label="报名截止">{{ detail.deadline }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="register">立即报名</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Clock, Location } from '@element-plus/icons-vue'
import { getEvents, getEvent, registerEvent } from '@/api/message'

const typeMap = { academic: '学术', sports: '文体', volunteer: '志愿', culture: '文化', other: '其他' }
const filter = ref({ type: '' })
const list = ref([])
const showDialog = ref(false)
const detail = ref({})

onMounted(() => load())

async function load() {
  const res = await getEvents({ eventType: filter.value.type })
  list.value = res.data?.list || res.data || []
}

async function showDetail(ev) {
  try { const res = await getEvent(ev.id); detail.value = res.data } catch { detail.value = ev }
  showDialog.value = true
}

async function register() {
  await registerEvent(detail.value.id)
  ElMessage.success('报名成功')
  showDialog.value = false
}
</script>

<style scoped>
.event-card { cursor: pointer; height: 100%; }
.event-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); transform: translateY(-2px); }
.event-info { margin-top: 12px; font-size: 13px; color: var(--color-info); line-height: 1.8; }
.event-info .el-icon { vertical-align: middle; }
</style>
