<template>
  <div class="scholarship-list-page">
    <div class="page-header">
      <div class="header-left">
        <h2>奖助服务</h2>
        <p>查看奖学金申请记录及审核状态</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="$router.push('/scholarship/apply')">
          <el-icon><Plus /></el-icon> 申请奖学金
        </el-button>
      </div>
    </div>

    <el-table
      v-if="list.length"
      :data="list"
      stripe
      v-loading="loading"
      empty-text="暂无申请记录"
    >
      <el-table-column prop="scholarship_type" label="奖学金类型" width="160" />
      <el-table-column label="GPA / 排名" width="130">
        <template #default="{ row }">
          {{ row.gpa ? row.gpa + ' / ' + (row.ranking || '-') : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操行分" width="90">
        <template #default="{ row }">
          <el-tag v-if="row.conduct_score" type="warning" size="small">{{ row.conduct_score }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="申请理由" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="review_comment" label="审核意见" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">{{ row.review_comment || '-' }}</template>
      </el-table-column>
      <el-table-column label="申请时间" width="160">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'approved'"
            type="primary"
            link
            size="small"
            @click="exportDocx(row.id)"
          >
            导出Word
          </el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="暂无申请记录">
      <el-button type="primary" @click="$router.push('/scholarship/apply')">去申请</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getScholarshipApplications, exportScholarshipDocx } from '@/api/scholarship'
import { FadeContent, GradientText } from '@/components/react-bits'

const list = ref([])
const loading = ref(false)

function statusTag(s) {
  return { pending: 'warning', approved: 'success', rejected: 'danger' }[s] || 'info'
}
function statusText(s) {
  return { pending: '待审核', approved: '已通过', rejected: '已拒绝' }[s] || s
}
function formatTime(d) {
  if (!d) return ''
  const t = new Date(d)
  const pad = n => String(n).padStart(2, '0')
  return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()) + ' ' + pad(t.getHours()) + ':' + pad(t.getMinutes())
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getScholarshipApplications()
    list.value = res.data?.list || res.list || []
  } catch { /* handled */ }
  finally { loading.value = false }
})

async function exportDocx(id) {
  try {
    const res = await exportScholarshipDocx(id)
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `奖学金申请表_${id}.docx`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch { /* handled */ }
}
</script>

<style scoped>
.scholarship-list-page { max-width: 1000px; }
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px;
}
.header-left h2 { margin: 0 0 6px; font-size: 20px; }
.header-left p { margin: 0; color: #909399; font-size: 14px; }
</style>
