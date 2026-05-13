<template>
  <div class="page">
    <div class="page-header"><h2>就业信息</h2></div>
    <el-row :gutter="16">
      <el-col :span="6">
        <el-radio-group v-model="filter.type" @change="load" size="small">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="recruitment">招聘</el-radio-button>
          <el-radio-button value="lecture">宣讲会</el-radio-button>
          <el-radio-button value="policy">政策</el-radio-button>
        </el-radio-group>
      </el-col>
      <el-col :span="6">
        <el-input v-model="filter.keyword" placeholder="搜索" clearable @clear="load" @keyup.enter="load" />
      </el-col>
    </el-row>

    <el-card v-for="job in list" :key="job.id" class="job-card" @click="showDetail(job)">
      <div class="job-header">
        <h4>{{ job.title }}</h4>
        <el-tag size="small">{{ typeLabel(job.jobType || job.type) }}</el-tag>
      </div>
      <p class="job-time">{{ job.createdAt }}</p>
    </el-card>
    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="load"
    />

    <el-dialog v-model="showDialog" :title="detail.title" width="600px">
      <div v-html="detail.content || detail.description" />
      <template #footer>
        <el-button type="primary" @click="favoriteJob(detail.id)">收藏</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getJobInfos, getJobInfo, favoriteJob } from '@/api/career'

const list = ref([])
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const filter = reactive({ type: '', keyword: '' })
const showDialog = ref(false)
const detail = ref({})

const typeMap = { recruitment: '招聘', lecture: '宣讲会', policy: '政策', other: '其他' }
function typeLabel(t) { return typeMap[t] || t }

onMounted(() => load())

async function load() {
  const res = await getJobInfos({ page: page.value, pageSize: pageSize.value, ...filter })
  list.value = res.data?.list || []
  total.value = res.data?.total || 0
}

async function showDetail(job) {
  try {
    const res = await getJobInfo(job.id)
    detail.value = res.data
  } catch {
    detail.value = job
  }
  showDialog.value = true
}
</script>

<style scoped>
.job-card { margin-bottom: 12px; cursor: pointer; }
.job-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
.job-header { display: flex; justify-content: space-between; align-items: center; }
.job-time { font-size: 12px; color: var(--color-info); margin-top: 8px; }
</style>
