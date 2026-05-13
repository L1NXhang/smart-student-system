<template>
  <div class="work-study-admin-page">
    <div class="page-header">
      <div class="header-left">
        <h2>勤工助学管理</h2>
        <p>发布和管理校内勤工助学岗位</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openCreateDialog">发布岗位</el-button>
      </div>
    </div>

    <!-- Positions Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="positions"
        border
        stripe
        style="width: 100%"
        row-class-name="table-row"
      >
        <el-table-column prop="title" label="岗位名称" min-width="160" />
        <el-table-column prop="quota" label="招聘人数" width="100" align="center" />
        <el-table-column label="已报名" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.appliedCount >= row.quota ? 'danger' : 'success'" size="small">
              {{ row.appliedCount }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'open' ? 'success' : 'info'" size="small">
              {{ row.status === 'open' ? '开放' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button
              :type="row.status === 'open' ? 'warning' : 'success'"
              link
              @click="toggleStatus(row)"
            >
              {{ row.status === 'open' ? '关闭' : '开启' }}
            </el-button>
            <el-button type="info" link @click="openApplicants(row)">查看报名</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="positions.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="showForm"
      :title="isEditing ? '编辑岗位' : '发布岗位'"
      width="560px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" label-width="100px">
        <el-form-item label="岗位名称" required>
          <el-input v-model="form.title" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位描述" required>
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入岗位描述"
          />
        </el-form-item>
        <el-form-item label="岗位要求">
          <el-input
            v-model="form.requirements"
            type="textarea"
            :rows="3"
            placeholder="请输入岗位要求"
          />
        </el-form-item>
        <el-form-item label="工作时间" required>
          <el-input v-model="form.workTime" placeholder="如：周一至周五 18:00-21:00" />
        </el-form-item>
        <el-form-item label="薪酬" required>
          <el-input v-model="form.salary" placeholder="如：15元/小时" />
        </el-form-item>
        <el-form-item label="招聘人数" required>
          <el-input-number v-model="form.quota" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="截止时间" required>
          <el-date-picker
            v-model="form.deadline"
            type="date"
            placeholder="选择截止日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForm = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEditing ? '保存修改' : '发布' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Applicants Dialog -->
    <el-dialog v-model="showApplicants" :title="`报名列表 — ${currentPosition?.title || ''}`" width="700px">
      <el-table
        v-if="currentApplicants.length"
        :data="currentApplicants"
        border
        stripe
        style="width: 100%"
        max-height="400"
      >
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="studentId" label="学号" width="140" />
        <el-table-column prop="college" label="学院" min-width="150" />
        <el-table-column prop="phone" label="联系方式" width="140" />
        <el-table-column prop="appliedAt" label="报名时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'hired' ? 'success' : 'warning'" size="small">
              {{ row.status === 'hired' ? '已录用' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-dropdown v-if="row.status !== 'hired'" @command="(cmd) => handleApplicantAction(row, cmd)">
              <el-button type="primary" link>操作</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="hire">录用</el-dropdown-item>
                  <el-dropdown-item command="reject">拒绝</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无报名记录" :image-size="80" />
      <template #footer>
        <el-button @click="showApplicants = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import gsap from 'gsap'

const page = ref(1)
const pageSize = ref(10)

// --- Mock Data ---
const positions = ref([
  {
    id: 1,
    title: '图书馆管理员',
    description: '协助图书馆老师整理图书、维护阅览室秩序、解答读者咨询。',
    requirements: '认真负责，每周至少工作10小时，能长期坚持者优先。',
    workTime: '周一至周五 18:00-21:00，周六 9:00-17:00',
    salary: '15元/小时',
    quota: 4,
    deadline: '2025-06-15',
    status: 'open',
    appliedCount: 3,
    applicants: [
      { id: 101, studentName: '张三', studentId: '20210101001', college: '计算机科学与技术学院', phone: '13800001111', appliedAt: '2025-05-10 14:30', status: 'pending' },
      { id: 102, studentName: '李四', studentId: '20210101002', college: '计算机科学与技术学院', phone: '13800002222', appliedAt: '2025-05-11 09:15', status: 'pending' },
      { id: 103, studentName: '陈一', studentId: '20210401001', college: '法学院', phone: '13800009999', appliedAt: '2025-05-12 16:00', status: 'hired' },
    ],
  },
  {
    id: 2,
    title: '实验室助管',
    description: '负责计算机实验室的设备维护、软件安装和环境管理，协助实验课准备工作。',
    requirements: '计算机相关专业，熟悉Windows和Linux系统，具备基本的网络知识。',
    workTime: '周一至周五 8:00-12:00 或 14:00-18:00（任选）',
    salary: '20元/小时',
    quota: 2,
    deadline: '2025-06-10',
    status: 'open',
    appliedCount: 5,
    applicants: [
      { id: 201, studentName: '王五', studentId: '20210102001', college: '电子信息工程学院', phone: '13800003333', appliedAt: '2025-05-09 08:30', status: 'hired' },
      { id: 202, studentName: '赵六', studentId: '20210102002', college: '电子信息工程学院', phone: '13800004444', appliedAt: '2025-05-10 11:00', status: 'hired' },
      { id: 203, studentName: '张三', studentId: '20210101001', college: '计算机科学与技术学院', phone: '13800001111', appliedAt: '2025-05-11 15:20', status: 'pending' },
      { id: 204, studentName: '孙七', studentId: '20210201001', college: '机械工程学院', phone: '13800005555', appliedAt: '2025-05-12 09:00', status: 'pending' },
      { id: 205, studentName: '吴九', studentId: '20210301001', college: '外国语学院', phone: '13800007777', appliedAt: '2025-05-12 10:30', status: 'pending' },
    ],
  },
  {
    id: 3,
    title: '学生事务中心助理',
    description: '协助学生事务中心处理日常事务，包括文件整理、信息录入、来访接待等。',
    requirements: '待人热情，沟通能力强，熟练使用Office办公软件。',
    workTime: '周一至周五 8:00-12:00',
    salary: '15元/小时',
    quota: 3,
    deadline: '2025-06-20',
    status: 'open',
    appliedCount: 2,
    applicants: [
      { id: 301, studentName: '周八', studentId: '20210202001', college: '经济管理学院', phone: '13800006666', appliedAt: '2025-05-11 08:30', status: 'pending' },
      { id: 302, studentName: '吴九', studentId: '20210301001', college: '外国语学院', phone: '13800007777', appliedAt: '2025-05-12 14:00', status: 'pending' },
    ],
  },
  {
    id: 4,
    title: '校园网络维护员',
    description: '协助网络中心进行校园网络故障排查、设备巡检和用户技术支持。',
    requirements: '网络工程或计算机专业，了解网络基础知识，有责任心和团队精神。',
    workTime: '周一至周五 14:00-18:00',
    salary: '18元/小时',
    quota: 2,
    deadline: '2025-05-30',
    status: 'closed',
    appliedCount: 4,
    applicants: [
      { id: 401, studentName: '郑一', studentId: '20210101003', college: '计算机科学与技术学院', phone: '13800001112', appliedAt: '2025-05-08 10:00', status: 'hired' },
      { id: 402, studentName: '郑十', studentId: '20210302001', college: '数学与统计学院', phone: '13800008888', appliedAt: '2025-05-09 16:00', status: 'hired' },
      { id: 403, studentName: '钱二', studentId: '20210201002', college: '机械工程学院', phone: '13800005556', appliedAt: '2025-05-10 12:00', status: 'pending' },
      { id: 404, studentName: '周八', studentId: '20210202001', college: '经济管理学院', phone: '13800006666', appliedAt: '2025-05-11 09:00', status: 'pending' },
    ],
  },
  {
    id: 5,
    title: '教务处资料整理员',
    description: '协助教务处整理教学档案、考试材料和相关文档的归档工作。',
    requirements: '细心耐心，保密意识强，能长期稳定工作。',
    workTime: '周一、周三、周五 14:00-17:00',
    salary: '15元/小时',
    quota: 2,
    deadline: '2025-06-25',
    status: 'open',
    appliedCount: 0,
    applicants: [],
  },
])

// --- Form ---
const showForm = ref(false)
const isEditing = ref(false)
const formRef = ref(null)
const form = ref({
  id: null,
  title: '',
  description: '',
  requirements: '',
  workTime: '',
  salary: '',
  quota: 1,
  deadline: '',
})

function openCreateDialog() {
  isEditing.value = false
  showForm.value = true
}

function openEditDialog(row) {
  isEditing.value = true
  form.value = { ...row }
  showForm.value = true
}

function resetForm() {
  form.value = {
    id: null,
    title: '',
    description: '',
    requirements: '',
    workTime: '',
    salary: '',
    quota: 1,
    deadline: '',
  }
}

function submitForm() {
  if (!form.value.title || !form.value.description || !form.value.workTime || !form.value.salary || !form.value.deadline) {
    ElMessage.warning('请填写所有必填字段')
    return
  }
  if (isEditing.value) {
    const idx = positions.value.findIndex((p) => p.id === form.value.id)
    if (idx !== -1) {
      positions.value[idx] = { ...positions.value[idx], ...form.value }
    }
    ElMessage.success('岗位信息已更新')
  } else {
    const newId = Math.max(...positions.value.map((p) => p.id), 0) + 1
    positions.value.push({
      ...form.value,
      id: newId,
      appliedCount: 0,
      applicants: [],
      status: 'open',
    })
    ElMessage.success('岗位已发布')
  }
  showForm.value = false
}

function toggleStatus(row) {
  const newStatus = row.status === 'open' ? 'closed' : 'open'
  const action = newStatus === 'closed' ? '关闭' : '开启'
  ElMessageBox.confirm(
    `确定${action}岗位"${row.title}"吗？${newStatus === 'closed' ? '关闭后学生将无法报名。' : ''}`,
    '操作确认',
    { confirmButtonText: `确定${action}`, cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    row.status = newStatus
    ElMessage.success(`岗位已${action}`)
  }).catch(() => {})
}

// --- Applicants ---
const showApplicants = ref(false)
const currentPosition = ref(null)

const currentApplicants = computed(() => currentPosition.value?.applicants || [])

function openApplicants(row) {
  currentPosition.value = row
  showApplicants.value = true
}

function handleApplicantAction(applicant, command) {
  if (command === 'hire') {
    ElMessageBox.confirm(
      `确定录用 ${applicant.studentName} 吗？`,
      '录用确认',
      { confirmButtonText: '确定录用', cancelButtonText: '取消', type: 'success' }
    ).then(() => {
      applicant.status = 'hired'
      ElMessage.success(`已录用 ${applicant.studentName}`)
    }).catch(() => {})
  } else if (command === 'reject') {
    ElMessageBox.confirm(
      `确定拒绝 ${applicant.studentName} 的报名吗？`,
      '拒绝确认',
      { confirmButtonText: '确定拒绝', cancelButtonText: '取消', type: 'warning' }
    ).then(() => {
      const pos = currentPosition.value
      if (pos) {
        pos.appliedCount = Math.max(0, pos.appliedCount - 1)
        pos.applicants = pos.applicants.filter((a) => a.id !== applicant.id)
      }
      ElMessage.success(`已拒绝 ${applicant.studentName} 的报名`)
    }).catch(() => {})
  }
}

// --- GSAP ---
onMounted(() => {
  gsap.from('.table-row', {
    opacity: 0,
    y: 20,
    duration: 0.4,
    stagger: 0.06,
    ease: 'power2.out',
  })
})
</script>

<style scoped>
.work-study-admin-page {
  max-width: 1200px;
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

.table-card {
  margin-bottom: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
