<template>
  <div class="scholarship-list-page">
    <div class="page-header">
      <div class="header-left">
        <h2>奖助服务</h2>
        <p>查看您已提交的奖学金申请记录及审核状态</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="router.push('/scholarship/apply')">
          申请奖学金
        </el-button>
      </div>
    </div>

    <el-table
      v-if="list.length"
      :data="list"
      border
      stripe
      style="width: 100%"
      row-class-name="table-row"
    >
      <el-table-column prop="scholarshipType" label="奖学金类型" min-width="160" />
      <el-table-column prop="reason" label="申请理由" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTagMap[row.status]?.type" size="small">
            {{ statusTagMap[row.status]?.label || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="申请时间" width="180" />
      <el-table-column prop="reviewComment" label="审核意见" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.reviewComment || '-' }}
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="暂无申请记录" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getScholarshipApplications } from '@/api/scholarship'
import gsap from 'gsap'

const router = useRouter()
const list = ref([])

const statusTagMap = {
  pending: { type: 'warning', label: '待审核' },
  approved: { type: 'success', label: '已通过' },
  rejected: { type: 'danger', label: '已拒绝' },
}

onMounted(async () => {
  try {
    const res = await getScholarshipApplications()
    list.value = res.data ?? []
  } catch { /* handled by interceptor */ }

  gsap.from('.table-row', {
    opacity: 0,
    y: 16,
    duration: 0.4,
    stagger: 0.08,
    ease: 'power2.out',
  })
})
</script>

<style scoped>
.scholarship-list-page {
  max-width: 1000px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}
</style>
