<template>
  <div class="scholarship-review-page">
    <div class="page-header">
      <h2>奖学金审核</h2>
      <p>审核学生提交的奖学金申请</p>
    </div>

    <!-- Filter Tabs -->
    <el-card shadow="never" class="tabs-card">
      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.key"
          :label="`${tab.label} (${countByStatus(tab.key)})`"
          :name="tab.key"
        />
      </el-tabs>
    </el-card>

    <!-- Applications Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="applications"
        border
        stripe
        style="width: 100%"
        row-class-name="table-row"
        v-loading="loading"
      >
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="studentId" label="学号" width="140" />
        <el-table-column prop="scholarshipType" label="奖学金类型" min-width="150" />
        <el-table-column prop="reason" label="申请理由" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="申请时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.status]?.type" size="small">
              {{ statusTagMap[row.status]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">查看详情</el-button>
            <template v-if="row.status === 'pending'">
              <el-button type="success" link @click="handleApprove(row)">通过</el-button>
              <el-button type="danger" link @click="handleReject(row)">拒绝</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          background
          @current-change="loadList"
        />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="showDetail" title="申请详情" width="600px">
      <template v-if="current">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ current.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ current.studentId }}</el-descriptions-item>
          <el-descriptions-item label="学院">{{ current.college }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ current.major }}</el-descriptions-item>
          <el-descriptions-item label="奖学金类型">{{ current.scholarshipType }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ current.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="GPA">{{ current.gpa }}</el-descriptions-item>
          <el-descriptions-item label="综测排名">{{ current.rank }}</el-descriptions-item>
          <el-descriptions-item label="申请理由" :span="2">{{ current.reason }}</el-descriptions-item>
          <el-descriptions-item label="获奖情况" :span="2">{{ current.awards || '无' }}</el-descriptions-item>
          <el-descriptions-item label="证明材料" :span="2">
            <template v-if="current.materials?.length">
              <el-link
                v-for="(m, i) in current.materials"
                :key="i"
                type="primary"
                style="margin-right: 12px"
                :underline="false"
              >
                {{ m.name || `材料${i + 1}` }}
              </el-link>
            </template>
            <span v-else>无</span>
          </el-descriptions-item>
          <el-descriptions-item label="审核意见" :span="2" v-if="current.status !== 'pending'">
            {{ current.reviewComment || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
        <template v-if="current?.status === 'pending'">
          <el-button type="success" @click="handleApprove(current); showDetail = false">通过</el-button>
          <el-button type="danger" @click="handleReject(current); showDetail = false">拒绝</el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import gsap from 'gsap'
import { getScholarshipApplications, auditScholarshipApplication } from '@/api/admin'

const activeTab = ref('pending')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const applications = ref([])

const tabs = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
]

const statusTagMap = {
  pending: { type: 'warning', label: '待审核' },
  approved: { type: 'success', label: '已通过' },
  rejected: { type: 'danger', label: '已拒绝' },
}

const showDetail = ref(false)
const current = ref(null)

const statusCounts = ref({ pending: 0, approved: 0, rejected: 0 })

const countByStatus = (status) => statusCounts.value[status] || 0

function mapApp(a) {
  return {
    id: a.id,
    studentName: a.student_name || a.studentName || '',
    studentId: a.student_username || a.studentId || '',
    scholarshipType: a.scholarship_type || a.scholarshipType || '',
    reason: a.reason || '',
    gpa: a.gpa || '',
    rank: a.rank || '',
    college: a.college || '',
    major: a.major || '',
    awards: a.awards || '',
    materials: a.materials || [],
    createdAt: a.created_at || a.createdAt || '',
    status: a.status || 'pending',
    reviewComment: a.review_comment || a.reviewComment || '',
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await getScholarshipApplications({ status: activeTab.value, page: page.value, pageSize: pageSize.value })
    const data = res.data || res
    applications.value = (data.list || []).map(mapApp)
    total.value = data.total || 0
    updateCounts()
  } catch {
    ElMessage.error('加载申请列表失败')
  } finally {
    loading.value = false
    setTimeout(() => animateRows(), 50)
  }
}

async function updateCounts() {
  try {
    for (const s of ['pending', 'approved', 'rejected']) {
      const r = await getScholarshipApplications({ status: s, pageSize: 1 })
      const d = r.data || r
      statusCounts.value[s] = d.total || 0
    }
  } catch { /* ignore */ }
}

function onTabChange() {
  page.value = 1
  loadList()
}

function openDetail(row) {
  current.value = row
  showDetail.value = true
}

async function handleApprove(row) {
  ElMessageBox.confirm(
    `确定通过 ${row.studentName} 的${row.scholarshipType}申请吗？`,
    '审核确认',
    { confirmButtonText: '确定通过', cancelButtonText: '取消', type: 'success' }
  ).then(async () => {
    try {
      await auditScholarshipApplication(row.id, { status: 'approved', comment: '审核通过。' })
      ElMessage.success(`已通过 ${row.studentName} 的申请`)
      loadList()
    } catch { ElMessage.error('操作失败') }
  }).catch(() => {})
}

async function handleReject(row) {
  ElMessageBox.prompt(
    '请输入拒绝原因',
    '审核拒绝',
    { confirmButtonText: '拒绝', cancelButtonText: '取消', type: 'warning',
      inputValidator: (val) => val ? true : '请输入拒绝原因',
      inputErrorMessage: '拒绝原因不能为空'
    }
  ).then(async ({ value }) => {
    try {
      await auditScholarshipApplication(row.id, { status: 'rejected', comment: value })
      ElMessage.success(`已拒绝 ${row.studentName} 的申请`)
      loadList()
    } catch { ElMessage.error('操作失败') }
  }).catch(() => {})
}

function animateRows() {
  gsap.from('.table-row', {
    opacity: 0, y: 20, duration: 0.4, stagger: 0.06, ease: 'power2.out',
  })
}

onMounted(() => {
  loadList()
  // Don't animate on mount, wait for data
})
</script>

<style scoped>
.scholarship-review-page {
  max-width: 1200px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.tabs-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
