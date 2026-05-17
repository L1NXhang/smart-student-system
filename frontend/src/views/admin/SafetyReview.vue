<template>
  <div class="safety-review-page" ref="pageRef">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">安全管理审核</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 晚归审核 -->
        <el-tab-pane label="晚归审核" name="lateReturn">
          <el-table :data="lateReturnList" stripe border style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" min-width="100" />
            <el-table-column prop="studentId" label="学号" min-width="130" />
            <el-table-column prop="date" label="日期" min-width="110" />
            <el-table-column prop="expectedReturn" label="预计返回" min-width="110" />
            <el-table-column prop="reason" label="原因" min-width="180" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">
                  {{ row.displayStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  type="success"
                  size="small"
                  link
                  @click="handleApprove('lateReturn', row)"
                >通过</el-button>
                <el-button
                  v-if="row.status === 'pending'"
                  type="danger"
                  size="small"
                  link
                  @click="handleReject('lateReturn', row)"
                >拒绝</el-button>
                <el-button type="primary" size="small" link @click="openDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 外出报备审核 -->
        <el-tab-pane label="外出报备审核" name="outing">
          <el-table :data="outingList" stripe border style="width: 100%" v-loading="loading">
            <el-table-column prop="studentName" label="学生姓名" min-width="100" />
            <el-table-column prop="studentId" label="学号" min-width="130" />
            <el-table-column prop="date" label="日期" min-width="110" />
            <el-table-column prop="destination" label="目的地" min-width="120" />
            <el-table-column prop="purpose" label="事由" min-width="180" />
            <el-table-column prop="expectedReturn" label="预计返回" min-width="110" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">
                  {{ row.displayStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  type="success"
                  size="small"
                  link
                  @click="handleApprove('outing', row)"
                >通过</el-button>
                <el-button
                  v-if="row.status === 'pending'"
                  type="danger"
                  size="small"
                  link
                  @click="handleReject('outing', row)"
                >拒绝</el-button>
                <el-button type="primary" size="small" link @click="openDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 审核意见 Dialog -->
    <el-dialog v-model="reviewDialog.visible" title="审核意见" width="480px">
      <el-form label-width="80px">
        <el-form-item label="学生">
          <span>{{ reviewDialog.row?.studentName }}</span>
          <span style="margin-left: 12px; color: #909399">{{ reviewDialog.row?.studentId }}</span>
        </el-form-item>
        <el-form-item label="类型">
          {{ reviewDialog.type === 'lateReturn' ? '晚归登记' : '外出报备' }}
        </el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="reviewDialog.result">
            <el-radio label="approved">通过</el-radio>
            <el-radio label="rejected">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input
            v-model="reviewDialog.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入审核意见（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交</el-button>
      </template>
    </el-dialog>

    <!-- 详情 Dialog -->
    <el-dialog v-model="detailDialog.visible" title="申请详情" width="520px">
      <template v-if="detailDialog.row">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ detailDialog.row.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ detailDialog.row.studentId }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ detailDialog.row.date }}</el-descriptions-item>
          <el-descriptions-item label="预计返回">{{ detailDialog.row.expectedReturn }}</el-descriptions-item>
          <el-descriptions-item
            v-if="detailDialog.row.destination"
            label="目的地"
          >{{ detailDialog.row.destination }}</el-descriptions-item>
          <el-descriptions-item
            :label="detailDialog.row.destination ? '事由' : '原因'"
            :span="2"
          >{{ detailDialog.row.reason || detailDialog.row.purpose }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import gsap from 'gsap'
import { getLateReturnList, auditLateReturn, getLeaveList, auditLeave } from '@/api/safety'

const pageRef = ref(null)
const activeTab = ref('lateReturn')
const loading = ref(false)

const reviewDialog = reactive({
  visible: false, type: '', row: null, result: 'approved', comment: '',
})

const detailDialog = reactive({
  visible: false, row: null,
})

const lateReturnList = ref([])
const outingList = ref([])

const statusMap = { pending: '待审核', approved: '已通过', rejected: '已拒绝', cancelled: '已取消' }

function mapLateReturn(r) {
  return {
    id: r.id,
    studentName: r.student?.user?.name || r.studentName || '',
    studentId: r.student?.user?.username || r.studentId || '',
    date: r.return_date || r.date || '',
    expectedReturn: r.expected_time || r.expectedReturn || '',
    reason: r.reason || '',
    status: r.status || 'pending',
    displayStatus: statusMap[r.status] || r.status,
  }
}

function mapLeave(r) {
  return {
    id: r.id,
    studentName: r.student?.user?.name || r.studentName || '',
    studentId: r.student?.user?.username || r.studentId || '',
    date: r.leave_date || r.date || '',
    destination: r.destination || '',
    purpose: r.reason || r.purpose || '',
    expectedReturn: r.expected_return || r.expectedReturn || '',
    status: r.status || 'pending',
    displayStatus: statusMap[r.status] || r.status,
  }
}

async function loadLateReturn() {
  try {
    const res = await getLateReturnList({ pageSize: 100 })
    const data = res.data || res
    lateReturnList.value = (data.list || []).map(mapLateReturn)
  } catch { ElMessage.error('加载晚归列表失败') }
}

async function loadLeave() {
  try {
    const res = await getLeaveList({ pageSize: 100 })
    const data = res.data || res
    outingList.value = (data.list || []).map(mapLeave)
  } catch { ElMessage.error('加载外出列表失败') }
}

function loadAll() {
  loading.value = true
  Promise.all([loadLateReturn(), loadLeave()]).finally(() => { loading.value = false })
}

function statusTagType(status) {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'info' }
  return map[status] || 'info'
}

function handleApprove(type, row) {
  reviewDialog.type = type
  reviewDialog.row = row
  reviewDialog.result = 'approved'
  reviewDialog.comment = ''
  reviewDialog.visible = true
}

function handleReject(type, row) {
  reviewDialog.type = type
  reviewDialog.row = row
  reviewDialog.result = 'rejected'
  reviewDialog.comment = ''
  reviewDialog.visible = true
}

async function submitReview() {
  try {
    if (reviewDialog.type === 'lateReturn') {
      await auditLateReturn(reviewDialog.row.id, { status: reviewDialog.result, reviewComment: reviewDialog.comment })
    } else {
      await auditLeave(reviewDialog.row.id, { status: reviewDialog.result, reviewComment: reviewDialog.comment })
    }
    const actionText = reviewDialog.result === 'approved' ? '通过' : '拒绝'
    ElMessage.success(`已${actionText}该申请`)
    reviewDialog.visible = false
    loadAll()
  } catch {
    ElMessage.error('审核失败')
  }
}

function openDetail(row) {
  detailDialog.row = row
  detailDialog.visible = true
}

let ctx
onMounted(() => {
  loadAll()
  ctx = gsap.context(() => {
    gsap.from('.page-card', { y: 30, autoAlpha: 0, duration: 0.5, ease: 'power2.out' })
  }, pageRef.value)
})

onUnmounted(() => { ctx?.revert() })
</script>

<style scoped>
.safety-review-page {
  max-width: 1200px;
}

.page-card {
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>
