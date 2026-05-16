<template>
  <div class="disciplinary-page">
    <div class="page-header">
      <h2>违纪记录</h2>
      <p>查看个人违纪处分记录</p>
    </div>

    <!-- 违纪记录表格 -->
    <el-table
      v-if="records.length"
      :data="records"
      stripe
      v-loading="loading"
    >
      <el-table-column label="违纪类型" width="140">
        <template #default="{ row }">
          <el-tag :type="typeTag(row.violation_type)" size="small">
            {{ row.violation_type || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="违纪描述" min-width="220" show-overflow-tooltip />
      <el-table-column label="处分措施" width="160" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.punishment || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="记录日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.record_date) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !records.length" description="暂无违纪记录" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDisciplinary } from '@/api/academic'
import gsap from 'gsap'

const loading = ref(false)
const records = ref([])

function typeTag(type) {
  const map = {
    'warning': 'warning', 'serious-warning': 'warning',
    'demerit': 'danger', 'probation': 'danger', 'expulsion': 'danger',
  }
  return map[type] || 'info'
}

function statusTag(status) {
  const map = { approved: 'success', pending: 'warning', rejected: 'danger' }
  return map[status] || 'info'
}

function statusText(status) {
  const map = { approved: '已确认', pending: '待确认', rejected: '已撤销' }
  return map[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

async function fetchRecords() {
  loading.value = true
  try {
    const res = await getDisciplinary()
    records.value = Array.isArray(res) ? res : (res.list || res.data?.list || [])
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
    setTimeout(animateTable, 200)
  }
}

function animateTable() {
  gsap.fromTo('.el-table__body-wrapper tbody tr',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
}

onMounted(() => fetchRecords())
</script>

<style scoped>
.disciplinary-page {
  max-width: 1000px;
}
</style>
