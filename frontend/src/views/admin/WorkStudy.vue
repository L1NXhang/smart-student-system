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
        v-loading="loading"
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
            <el-tag :type="row.displayStatus === 'open' ? 'success' : 'info'" size="small">
              {{ row.displayStatus === 'open' ? '开放' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button
              :type="row.displayStatus === 'open' ? 'warning' : 'success'"
              link
              @click="toggleStatus(row)"
            >
              {{ row.displayStatus === 'open' ? '关闭' : '开启' }}
            </el-button>
            <el-button type="info" link @click="openApplicants(row)">查看报名</el-button>
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
          @current-change="loadPositions"
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
            <el-tag :type="row.status === 'approved' ? 'success' : 'warning'" size="small">
              {{ row.status === 'approved' ? '已录用' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-dropdown v-if="row.status === 'pending'" @command="(cmd) => handleApplicantAction(row, cmd)">
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
import {
  getWorkStudyPositions, createWorkStudyPosition, updateWorkStudyPosition,
  getWorkStudyApplications, auditWorkStudyApplication
} from '@/api/admin'

const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const positions = ref([])

const statusMap = { 1: 'open', 0: 'closed' }

function mapPosition(p) {
  return {
    ...p,
    appliedCount: p.apply_count ?? p.appliedCount ?? 0,
    hiredCount: p.hired_count ?? p.hiredCount ?? 0,
    displayStatus: p.status === 1 || p.status === 'open' ? 'open' : 'closed',
    deadline: p.deadline || '',
    workTime: p.work_time || p.workTime || '',
  }
}

async function loadPositions() {
  loading.value = true
  try {
    const res = await getWorkStudyPositions({ page: page.value, pageSize: pageSize.value })
    const data = res.data || res
    positions.value = (data.list || []).map(mapPosition)
    total.value = data.total || 0
  } catch { ElMessage.error('加载岗位列表失败') } finally {
    loading.value = false
    setTimeout(() => animateRows(), 50)
  }
}

const showForm = ref(false)
const isEditing = ref(false)
const formRef = ref(null)
const form = ref({
  id: null, title: '', description: '', requirements: '', workTime: '', salary: '', quota: 1, deadline: '',
})

function openCreateDialog() {
  isEditing.value = false
  showForm.value = true
}

function openEditDialog(row) {
  isEditing.value = true
  form.value = {
    id: row.id, title: row.title, description: row.description,
    requirements: row.requirements || '', workTime: row.workTime || row.work_time || '',
    salary: row.salary, quota: row.quota, deadline: row.deadline,
  }
  showForm.value = true
}

function resetForm() {
  form.value = { id: null, title: '', description: '', requirements: '', workTime: '', salary: '', quota: 1, deadline: '' }
}

async function submitForm() {
  if (!form.value.title || !form.value.description || !form.value.workTime || !form.value.salary || !form.value.deadline) {
    ElMessage.warning('请填写所有必填字段')
    return
  }
  try {
    if (isEditing.value) {
      await updateWorkStudyPosition(form.value.id, { ...form.value, status: undefined })
      ElMessage.success('岗位信息已更新')
    } else {
      await createWorkStudyPosition(form.value)
      ElMessage.success('岗位已发布')
    }
    showForm.value = false
    loadPositions()
  } catch { ElMessage.error(isEditing.value ? '更新失败' : '发布失败') }
}

async function toggleStatus(row) {
  const newStatus = row.displayStatus === 'open' ? 0 : 1
  const actionText = newStatus === 0 ? '关闭' : '开启'
  try {
    await updateWorkStudyPosition(row.id, { ...row, status: newStatus, workTime: row.workTime || row.work_time })
    ElMessage.success(`岗位已${actionText}`)
    loadPositions()
  } catch { ElMessage.error('操作失败') }
}

// Applicants
const showApplicants = ref(false)
const currentPosition = ref(null)
const currentApplicants = ref([])

async function openApplicants(row) {
  currentPosition.value = row
  try {
    const res = await getWorkStudyApplications({ positionId: row.id, pageSize: 100 })
    const data = res.data || res
    currentApplicants.value = (data.list || []).map((a) => ({
      id: a.id,
      studentName: a.student_name || a.studentName || '',
      studentId: a.student_username || a.studentId || '',
      college: a.college || '',
      phone: a.phone || '',
      appliedAt: a.created_at || a.appliedAt || '',
      status: a.status || 'pending',
    }))
  } catch { ElMessage.error('加载报名列表失败') }
  showApplicants.value = true
}

async function handleApplicantAction(applicant, command) {
  const actionText = command === 'hire' ? '录用' : '拒绝'
  try {
    await auditWorkStudyApplication(applicant.id, { status: command === 'hire' ? 'approved' : 'rejected', comment: '' })
    ElMessage.success(`已${actionText}该报名`)
    openApplicants(currentPosition.value)
    loadPositions()
  } catch { ElMessage.error('操作失败') }
}

function animateRows() {
  gsap.from('.table-row', { opacity: 0, y: 20, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
}

onMounted(() => { loadPositions() })
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
