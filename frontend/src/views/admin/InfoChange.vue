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
        :data="filteredList"
        border
        stripe
        style="width: 100%"
        row-class-name="table-row"
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
          :total="filteredList.length"
          layout="total, prev, pager, next"
          background
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import gsap from 'gsap'

const activeTab = ref('pending')
const page = ref(1)
const pageSize = ref(10)

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

// --- Mock Data ---
const applications = ref([
  { id: 1, studentName: '张三', studentId: '20210101001', fieldName: '联系方式', oldValue: '13800000000', newValue: '13800001111', reason: '更换手机号码，原号码已停用。', createdAt: '2025-05-12 10:30', status: 'pending', reviewComment: '' },
  { id: 2, studentName: '李四', studentId: '20210101002', fieldName: '宿舍号', oldValue: '南2-205', newValue: '南2-308', reason: '因宿舍调整，已搬至新宿舍。', createdAt: '2025-05-12 09:15', status: 'pending', reviewComment: '' },
  { id: 3, studentName: '王五', studentId: '20210102001', fieldName: '家庭住址', oldValue: '北京市朝阳区XX路1号', newValue: '北京市海淀区YY路2号', reason: '家庭搬迁至新地址。', createdAt: '2025-05-11 14:00', status: 'pending', reviewComment: '' },
  { id: 4, studentName: '周八', studentId: '20210202001', fieldName: '银行卡号', oldValue: '622200XXXXXXXX1234', newValue: '622588XXXXXXXX5678', reason: '更换银行卡，旧卡已注销。', createdAt: '2025-05-11 11:20', status: 'pending', reviewComment: '' },
  { id: 5, studentName: '吴九', studentId: '20210301001', fieldName: '联系方式', oldValue: '13800000001', newValue: '13800007777', reason: '手机号更换。', createdAt: '2025-05-10 16:42', status: 'pending', reviewComment: '' },
  { id: 6, studentName: '孙七', studentId: '20210201001', fieldName: '班主任', oldValue: '钱老师', newValue: '周老师', reason: '因班级调整，班主任已变更。', createdAt: '2025-05-10 08:30', status: 'approved', reviewComment: '情况属实，班主任调整已确认。' },
  { id: 7, studentName: '赵六', studentId: '20210102002', fieldName: '校外住宿地址', oldValue: '无', newValue: '学校西门XX小区3栋502', reason: '因个人原因申请校外住宿。', createdAt: '2025-05-09 15:00', status: 'approved', reviewComment: '手续齐全，同意校外住宿申请。' },
  { id: 8, studentName: '郑十', studentId: '20210302001', fieldName: '身份证号', oldValue: 'XXXXXX', newValue: '320102200408080088', reason: '之前登记信息有误，申请更正。', createdAt: '2025-05-08 10:15', status: 'rejected', reviewComment: '请提供身份证原件照片及派出所证明后再申请。' },
])

const showReview = ref(false)
const current = ref(null)
const reviewComment = ref('')

const countByStatus = (status) => applications.value.filter((a) => a.status === status).length

const filteredList = computed(() => {
  return applications.value.filter((a) => a.status === activeTab.value)
})

function onTabChange() {
  page.value = 1
  setTimeout(() => animateRows(), 50)
}

function openReview(row) {
  current.value = row
  reviewComment.value = ''
  showReview.value = true
}

function handleApprove() {
  ElMessageBox.confirm(
    `确定通过 ${current.value.studentName} 的${current.value.fieldName}变更申请吗？`,
    '审核确认',
    { confirmButtonText: '确定通过', cancelButtonText: '取消', type: 'success' }
  ).then(() => {
    current.value.status = 'approved'
    current.value.reviewComment = reviewComment.value || '审核通过。'
    ElMessage.success('申请已通过')
    showReview.value = false
  }).catch(() => {})
}

function handleReject() {
  ElMessageBox.confirm(
    `确定拒绝 ${current.value.studentName} 的${current.value.fieldName}变更申请吗？`,
    '审核拒绝',
    { confirmButtonText: '确定拒绝', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    current.value.status = 'rejected'
    current.value.reviewComment = reviewComment.value || '审核不通过。'
    ElMessage.success('申请已拒绝')
    showReview.value = false
  }).catch(() => {})
}

function animateRows() {
  gsap.from('.table-row', {
    opacity: 0,
    y: 20,
    duration: 0.4,
    stagger: 0.06,
    ease: 'power2.out',
  })
}

onMounted(() => {
  animateRows()
})
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
