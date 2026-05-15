<template>
  <div class="jobs-page">
    <div class="page-header">
      <h2>就业信息</h2>
      <p>浏览招聘信息、宣讲会和就业政策</p>
    </div>

    <el-card>
      <!-- 搜索过滤 -->
      <div class="toolbar">
        <el-radio-group v-model="filter.type" @change="search" size="small">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="recruitment">招聘</el-radio-button>
          <el-radio-button value="lecture">宣讲会</el-radio-button>
          <el-radio-button value="policy">政策</el-radio-button>
          <el-radio-button value="other">其他</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="filter.keyword"
          placeholder="搜索标题或内容"
          clearable
          :prefix-icon="Search"
          style="width: 260px"
          @clear="search"
          @keyup.enter="search"
        />
      </div>

      <!-- 列表 -->
      <div v-loading="loading">
        <div v-for="job in list" :key="job.id" class="job-card" @click="openDetail(job)">
          <div class="job-main">
            <div class="job-left">
              <h4 class="job-title">{{ job.title }}</h4>
              <div class="job-meta">
                <el-tag :type="typeTag(job.job_type || job.type)" size="small">
                  {{ typeText(job.job_type || job.type) }}
                </el-tag>
                <span class="job-date">{{ job.created_at || job.createdAt }}</span>
                <span v-if="job.view_count" class="job-views">
                  <el-icon><View /></el-icon> {{ job.view_count }}
                </span>
              </div>
            </div>
            <div class="job-right">
              <el-button
                type="warning"
                size="small"
                :icon="Star"
                circle
                :plain="!job.is_favorite"
                @click.stop="toggleFav(job)"
              />
            </div>
          </div>
          <p v-if="job.summary" class="job-summary">{{ job.summary }}</p>
        </div>

        <el-empty v-if="!loading && !list.length" description="暂无就业信息" />
      </div>

      <!-- 分页 -->
      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="search"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDialog" :title="detail.title" width="640px" destroy-on-close>
      <div class="detail-header">
        <el-tag :type="typeTag(detail.job_type || detail.type)" size="small">
          {{ typeText(detail.job_type || detail.type) }}
        </el-tag>
        <span class="detail-date">{{ detail.created_at || detail.createdAt }}</span>
        <span class="detail-views">
          <el-icon><View /></el-icon> {{ detail.view_count || 0 }}
        </span>
      </div>
      <el-divider />
      <div class="detail-body" v-html="detail.content || detail.description || '暂无详细内容'" />
      <template #footer>
        <el-button @click="showDialog = false">关闭</el-button>
        <el-button type="warning" @click="toggleFav(detail)" :icon="detail.is_favorite ? StarFilled : Star">
          {{ detail.is_favorite ? '已收藏' : '收藏' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Star, StarFilled, View } from '@element-plus/icons-vue'
import { getJobInfos, getJobInfo, favoriteJob } from '@/api/career'
import { FadeContent, GradientText } from '@/components/react-bits'

const list = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const filter = reactive({ type: '', keyword: '' })
const showDialog = ref(false)
const detail = ref({})

function typeTag(t) {
  const map = { recruitment: '', lecture: 'success', policy: 'warning', other: 'info' }
  return map[t] || 'info'
}
function typeText(t) {
  const map = { recruitment: '招聘', lecture: '宣讲会', policy: '政策', other: '其他' }
  return map[t] || t
}

async function search() {
  page.value = 1
  await fetchList()
}

async function fetchList() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (filter.type) params.jobType = filter.type
    if (filter.keyword) params.keyword = filter.keyword
    const res = await getJobInfos(params)
    list.value = res.list || res.data?.list || []
    total.value = res.total || res.data?.total || 0
  } catch { /* handled */ }
  finally { loading.value = false }
}

async function openDetail(job) {
  try {
    const res = await getJobInfo(job.id)
    detail.value = { ...res.data, is_favorite: job.is_favorite }
  } catch {
    detail.value = job
  }
  showDialog.value = true
}

async function toggleFav(job) {
  try {
    await favoriteJob(job.id)
    job.is_favorite = !job.is_favorite
    if (detail.value.id === job.id) detail.value.is_favorite = job.is_favorite
    ElMessage.success(job.is_favorite ? '已收藏' : '已取消收藏')
  } catch { /* handled */ }
}

onMounted(() => fetchList())
</script>

<style scoped>
.jobs-page { max-width: 900px; }

.toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
}

/* Job cards */
.job-card {
  padding: 18px 20px; margin-bottom: 10px; border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter); cursor: pointer;
  transition: all 0.2s;
}
.job-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  border-color: var(--el-color-primary-light-5);
}

.job-main {
  display: flex; justify-content: space-between; align-items: flex-start;
}

.job-title { margin: 0 0 8px; font-size: 16px; }

.job-meta {
  display: flex; align-items: center; gap: 12px;
  font-size: 12px; color: #909399;
}
.job-views { display: flex; align-items: center; gap: 2px; }

.job-summary {
  margin: 10px 0 0; font-size: 13px; color: #606266;
  line-height: 1.5; overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

/* Detail */
.detail-header {
  display: flex; align-items: center; gap: 12px; font-size: 13px; color: #909399;
}
.detail-views { display: flex; align-items: center; gap: 4px; }
.detail-body { line-height: 1.8; }

.pagination-wrap { margin-top: 16px; display: flex; justify-content: center; }
</style>
