<template>
  <div class="info-change-page">
    <div class="page-header">
      <h2>信息变更审核</h2>
      <p>审核学生提交的个人信息变更申请</p>
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
        <el-table-column prop="fieldName" label="变更字段" width="140" />
        <el-table-column prop="oldValue" label="原值" min-width="140" show-overflow-tooltip />
        <el-table-column prop="newValue" label="新值" min-width="140" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="申请时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.status]?.type" size="small">
              {{ statusTagMap[row.status]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openReview(row)">
              {{ row.status === 'pending' ? '审核' : '查看' }}
            </el-button>
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

    <!-- Review Dialog -->
    <el-dialog v-model="showReview" title="变更审核" width="560px">
      <template v-if="current">
        <el-descriptions :column="1" border class="review-descriptions">
          <el-descriptions-item label="学生姓名">{{ current.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ current.studentId }}</el-descriptions-item>
          <el-descriptions-item label="变更字段">{{ current.fieldName }}</el-descriptions-item>
          <el-descriptions-item label="变更原因">{{ current.reason || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="compare-section">
          <div class="compare-card old">
            <div class="compare-label">原值</div>
            <div class="compare-value">{{ current.oldValue }}</div>
          </div>
          <el-icon class="compare-arrow" :size="20"><ArrowRight /></el-icon>
          <div class="compare-card new">
            <div class="compare-label">新值</div>
            <div class="compare-value highlight">{{ current.newValue }}</div>
          </div>
        </div>

        <div v-if="current.status === 'pending'" class="comment-section">
          <el-input
            v-model="reviewComment"
            type="textarea"
            :rows="3"
            placeholder="审核意见（选填）"
            maxlength="200"
            show-word-limit
          />
        </div>

        <div
          v-if="current.status !== 'pending'"
          class="comment-section resolved"
        >
          <span class="comment-label">审核意见：</span>
          <span>{{ current.reviewComment || '-' }}</span>
        </div>
      </template>
      <template #footer>
        <el-button @click="showReview = false">关闭</el-button>
        <template v-if="current?.status === 'pending'">
          <el-button type="success" @click="handleApprove">通过</el-button>
          <el-button type="danger" @click="handleReject">拒绝</el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import gsap from 'gsap'
import { getInfoChangeRequests, auditInfoChangeRequest } from '@/api/admin'

const activeTab = ref('pending')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const applications = ref([])
const statusCounts = ref({ pending: 0, approved: 0, rejected: 0 })

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

function mapApp(a) {
  return {
    id: a.id,
    studentName: a.student_name || a.studentName || '',
    studentId: a.student_username || a.studentId || '',
    fieldName: a.field_name || a.fieldName || '',
    oldValue: a.old_value || a.oldValue || '',
    newValue: a.new_value || a.newValue || '',
    reason: a.reason || '',
    createdAt: a.created_at || a.createdAt || '',
    status: a.status || 'pending',
    reviewComment: a.review_comment || a.reviewComment || '',
  }
}

async function loadList() {
  loading.value = true
  try {
    const res = await getInfoChangeRequests({ status: activeTab.value, page: page.value, pageSize: pageSize.value })
    const data = res.data || res
    applications.value = (data.list || []).map(mapApp)
    total.value = data.total || 0
    updateCounts()
  } catch { ElMessage.error('加载申请列表失败') } finally {
    loading.value = false
    setTimeout(() => animateRows(), 50)
  }
}

async function updateCounts() {
  try {
    for (const s of ['pending', 'approved', 'rejected']) {
      const r = await getInfoChangeRequests({ status: s, pageSize: 1 })
      const d = r.data || r
      statusCounts.value[s] = d.total || 0
    }
  } catch { /* ignore */ }
}

const countByStatus = (status) => statusCounts.value[status] || 0

function onTabChange() { page.value = 1; loadList() }

const showReview = ref(false)
const current = ref(null)
const reviewComment = ref('')

function openReview(row) { current.value = row; reviewComment.value = ''; showReview.value = true }

async function handleApprove() {
  try {
    await auditInfoChangeRequest(current.value.id, { status: 'approved', comment: reviewComment.value || '审核通过。' })
    ElMessage.success('申请已通过')
    showReview.value = false
    loadList()
  } catch { ElMessage.error('操作失败') }
}

async function handleReject() {
  try {
    await auditInfoChangeRequest(current.value.id, { status: 'rejected', comment: reviewComment.value || '审核不通过。' })
    ElMessage.success('申请已拒绝')
    showReview.value = false
    loadList()
  } catch { ElMessage.error('操作失败') }
}

function animateRows() {
  gsap.from('.table-row', { opacity: 0, y: 20, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
}

onMounted(() => { loadList() })
</script>

<style scoped>
.info-change-page {
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

/* --- Compare Section --- */
.compare-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 20px 0;
}

.compare-card {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #ebeef5;
}

.compare-card.old {
  background: #f5f7fa;
}

.compare-card.new {
  background: #ecf5ff;
  border-color: #409eff;
}

.compare-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.compare-value {
  font-size: 15px;
  color: #303133;
  word-break: break-all;
}

.compare-value.highlight {
  color: #409eff;
  font-weight: 500;
}

.compare-arrow {
  color: #c0c4cc;
  flex-shrink: 0;
}

.comment-section {
  margin-top: 16px;
}

.comment-section.resolved {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
  color: #606266;
}

.comment-label {
  font-weight: 500;
  margin-right: 4px;
}
</style>
