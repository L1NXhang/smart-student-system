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
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === '待审核'"
                  type="success"
                  size="small"
                  link
                  @click="handleApprove('lateReturn', row)"
                >通过</el-button>
                <el-button
                  v-if="row.status === '待审核'"
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
          <el-table :data="outingList" stripe border style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" min-width="100" />
            <el-table-column prop="studentId" label="学号" min-width="130" />
            <el-table-column prop="date" label="日期" min-width="110" />
            <el-table-column prop="destination" label="目的地" min-width="120" />
            <el-table-column prop="purpose" label="事由" min-width="180" />
            <el-table-column prop="expectedReturn" label="预计返回" min-width="110" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === '待审核'"
                  type="success"
                  size="small"
                  link
                  @click="handleApprove('outing', row)"
                >通过</el-button>
                <el-button
                  v-if="row.status === '待审核'"
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
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">拒绝</el-radio>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import gsap from 'gsap'
import { FadeContent, GradientText } from '@/components/react-bits'

const pageRef = ref(null)
const activeTab = ref('lateReturn')

const reviewDialog = reactive({
  visible: false,
  type: '',
  row: null,
  result: 'approve',
  comment: '',
})

const detailDialog = reactive({
  visible: false,
  row: null,
})

// --- Mock Data: 晚归 ---
const lateReturnList = ref([
  { id: 1, studentName: '张伟', studentId: '20221102001', date: '2026-05-12', expectedReturn: '22:30', reason: '参加学术讲座', status: '待审核' },
  { id: 2, studentName: '李娜', studentId: '20221102002', date: '2026-05-12', expectedReturn: '22:00', reason: '实验室科研项目', status: '待审核' },
  { id: 3, studentName: '王磊', studentId: '20221102003', date: '2026-05-11', expectedReturn: '21:30', reason: '社团活动排练', status: '已通过' },
  { id: 4, studentName: '赵敏', studentId: '20221102004', date: '2026-05-11', expectedReturn: '23:00', reason: '家人临时来访', status: '已拒绝' },
  { id: 5, studentName: '孙浩然', studentId: '20221102005', date: '2026-05-10', expectedReturn: '22:00', reason: '兼职工作', status: '已通过' },
  { id: 6, studentName: '周小燕', studentId: '20221102006', date: '2026-05-10', expectedReturn: '21:00', reason: '参加竞赛培训', status: '待审核' },
])

// --- Mock Data: 外出报备 ---
const outingList = ref([
  { id: 1, studentName: '陈刚', studentId: '20221103001', date: '2026-05-13', destination: '南充市顺庆区', purpose: '参加Java开发培训', expectedReturn: '2026-05-13', status: '待审核' },
  { id: 2, studentName: '刘芳', studentId: '20221103002', date: '2026-05-13', destination: '成都市', purpose: '面试实习岗位', expectedReturn: '2026-05-14', status: '待审核' },
  { id: 3, studentName: '黄强', studentId: '20221103003', date: '2026-05-12', destination: '南充市高坪区', purpose: '参加志愿者活动', expectedReturn: '2026-05-12', status: '已通过' },
  { id: 4, studentName: '吴丽', studentId: '20221103004', date: '2026-05-11', destination: '重庆市', purpose: '探亲', expectedReturn: '2026-05-13', status: '已通过' },
  { id: 5, studentName: '马超', studentId: '20221103005', date: '2026-05-11', destination: '成都市', purpose: '参加学科竞赛', expectedReturn: '2026-05-12', status: '已拒绝' },
  { id: 6, studentName: '林小红', studentId: '20221103006', date: '2026-05-10', destination: '南充市嘉陵区', purpose: '购买学习用品', expectedReturn: '2026-05-10', status: '待审核' },
])

function statusTagType(status) {
  const map = { '待审核': 'warning', '已通过': 'success', '已拒绝': 'danger' }
  return map[status] || 'info'
}

function handleApprove(type, row) {
  reviewDialog.type = type
  reviewDialog.row = row
  reviewDialog.result = 'approve'
  reviewDialog.comment = ''
  reviewDialog.visible = true
}

function handleReject(type, row) {
  reviewDialog.type = type
  reviewDialog.row = row
  reviewDialog.result = 'reject'
  reviewDialog.comment = ''
  reviewDialog.visible = true
}

function submitReview() {
  const actionText = reviewDialog.result === 'approve' ? '通过' : '拒绝'
  ElMessage.success(`已${actionText}该申请（Mock）`)
  const list = reviewDialog.type === 'lateReturn' ? lateReturnList : outingList
  const target = list.value.find((i) => i.id === reviewDialog.row.id)
  if (target) {
    target.status = reviewDialog.result === 'approve' ? '已通过' : '已拒绝'
  }
  reviewDialog.visible = false
}

function openDetail(row) {
  detailDialog.row = row
  detailDialog.visible = true
}

// --- GSAP ---
let ctx
onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.page-card', {
      y: 30,
      autoAlpha: 0,
      duration: 0.5,
      ease: 'power2.out',
    })
    gsap.from('.el-table__row', {
      y: 20,
      autoAlpha: 0,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power2.out',
      delay: 0.2,
    })
  }, pageRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
.safety-review-page {
  max-width: 1200px;
}

.page-card {
  visibility: hidden;
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
