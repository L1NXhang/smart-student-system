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
        :data="filteredList"
        border
        stripe
        style="width: 100%"
        row-class-name="table-row"
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
          :total="filteredList.length"
          layout="total, prev, pager, next"
          background
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import gsap from 'gsap'
import { FadeContent, GradientText } from '@/components/react-bits'

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
  { id: 1, studentName: '张三', studentId: '20210101001', college: '计算机科学与技术学院', major: '计算机科学与技术', scholarshipType: '国家奖学金', gpa: '4.2', rank: '1/120', reason: '在校期间成绩优异，连续三年获得校级一等奖学金，发表SCI论文两篇，参与国家级大创项目一项并顺利结题。积极参加学科竞赛，获得蓝桥杯全国二等奖、数学建模省一等奖。', awards: '蓝桥杯全国二等奖、数学建模省一等奖、校级一等奖学金', materials: [{ name: '成绩单.pdf' }, { name: '论文录用证明.pdf' }], createdAt: '2025-05-10 14:30', status: 'pending', reviewComment: '' },
  { id: 2, studentName: '李四', studentId: '20210101002', college: '计算机科学与技术学院', major: '软件工程', scholarshipType: '学业奖学金', gpa: '3.8', rank: '5/90', reason: '学习刻苦，成绩排名专业前5%，积极参与科研项目，担任班长期间组织多项班级活动，具有较强的组织协调能力。', awards: '校级二等奖学金、优秀学生干部', materials: [{ name: '成绩单.pdf' }], createdAt: '2025-05-11 09:15', status: 'pending', reviewComment: '' },
  { id: 3, studentName: '王五', studentId: '20210102001', college: '电子信息工程学院', major: '电子信息工程', scholarshipType: '国家励志奖学金', gpa: '3.5', rank: '12/100', reason: '家庭经济困难，通过勤工助学自筹生活费。学习努力，积极参加社会实践和志愿服务活动，志愿服务时长累计超过200小时。', awards: '校级三等奖学金、优秀志愿者', materials: [{ name: '困难认定表.pdf' }, { name: '成绩单.pdf' }], createdAt: '2025-05-10 16:42', status: 'pending', reviewComment: '' },
  { id: 4, studentName: '赵六', studentId: '20210102002', college: '电子信息工程学院', major: '通信工程', scholarshipType: '校级奖学金', gpa: '3.9', rank: '3/85', reason: '专业成绩优异，创新能力突出，拥有一项实用新型专利，参与导师国家重点研发计划项目，担任实验室助教。', awards: '校级一等奖学金、创新创业先进个人', materials: [{ name: '专利证书.pdf' }], createdAt: '2025-05-09 11:20', status: 'pending', reviewComment: '' },
  { id: 5, studentName: '孙七', studentId: '20210201001', college: '机械工程学院', major: '机械设计制造及其自动化', scholarshipType: '国家奖学金', gpa: '4.1', rank: '2/110', reason: '专业排名前2%，获全国大学生机械创新设计大赛一等奖，主持省级大创项目一项，发表核心期刊论文一篇。', awards: '全国大学生机械创新设计大赛一等奖、省级大创项目负责人', materials: [{ name: '获奖证书.pdf' }, { name: '论文.pdf' }], createdAt: '2025-05-08 08:30', status: 'approved', reviewComment: '材料齐全，成绩优异，符合评选条件。' },
  { id: 6, studentName: '周八', studentId: '20210202001', college: '经济管理学院', major: '工商管理', scholarshipType: '学业奖学金', gpa: '3.6', rank: '8/95', reason: '学习认真刻苦，具备较强的团队协作能力，在ERP沙盘模拟竞赛中获得团队一等奖。', awards: 'ERP沙盘模拟一等奖', materials: [{ name: '成绩单.pdf' }], createdAt: '2025-05-07 15:00', status: 'approved', reviewComment: '审核通过，成绩符合要求。' },
  { id: 7, studentName: '吴九', studentId: '20210301001', college: '外国语学院', major: '英语', scholarshipType: '校级奖学金', gpa: '3.2', rank: '20/70', reason: '参加校外英语培训机构兼职教学，实际工作经验丰富，但学业成绩排名不够突出。', awards: '无', materials: [], createdAt: '2025-05-06 10:45', status: 'rejected', reviewComment: '学业成绩未达到评选标准，建议努力学习提高绩点后再申请。' },
  { id: 8, studentName: '郑十', studentId: '20210302001', college: '数学与统计学院', major: '应用数学', scholarshipType: '国家励志奖学金', gpa: '3.7', rank: '6/80', reason: '家庭困难，学习用功，获得数学竞赛省级二等奖，担任班级学习委员，帮助同学提高学习成绩。', awards: '数学竞赛省级二等奖', materials: [{ name: '困难认定表.pdf' }, { name: '获奖证书.pdf' }], createdAt: '2025-05-05 14:20', status: 'approved', reviewComment: '经核实困难情况属实，成绩符合要求，通过审核。' },
])

const showDetail = ref(false)
const current = ref(null)

const countByStatus = (status) => applications.value.filter((a) => a.status === status).length

const filteredList = computed(() => {
  return applications.value.filter((a) => a.status === activeTab.value)
})

function onTabChange() {
  page.value = 1
  setTimeout(() => animateRows(), 50)
}

function openDetail(row) {
  current.value = row
  showDetail.value = true
}

function handleApprove(row) {
  ElMessageBox.confirm(
    `确定通过 ${row.studentName} 的${row.scholarshipType}申请吗？`,
    '审核确认',
    { confirmButtonText: '确定通过', cancelButtonText: '取消', type: 'success' }
  ).then(() => {
    row.status = 'approved'
    row.reviewComment = '审核通过。'
    ElMessage.success(`已通过 ${row.studentName} 的申请`)
  }).catch(() => {})
}

function handleReject(row) {
  ElMessageBox.prompt(
    '请输入拒绝原因',
    '审核拒绝',
    { confirmButtonText: '拒绝', cancelButtonText: '取消', type: 'warning',
      inputValidator: (val) => val ? true : '请输入拒绝原因',
      inputErrorMessage: '拒绝原因不能为空'
    }
  ).then(({ value }) => {
    row.status = 'rejected'
    row.reviewComment = value
    ElMessage.success(`已拒绝 ${row.studentName} 的申请`)
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
