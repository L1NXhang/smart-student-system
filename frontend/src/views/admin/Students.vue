<template>
  <div class="students-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h2>学生管理</h2>
        <p>查看和管理全校学生信息</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showImportDialog = true">
          <el-icon style="margin-right: 4px"><Upload /></el-icon>
          批量导入学生
        </el-button>
      </div>
    </div>

    <!-- Filter / Search Bar -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-row">
        <el-input
          v-model="keyword"
          placeholder="搜索姓名或学号"
          clearable
          style="width: 240px"
          @input="onSearchDebounced"
        />
        <el-select
          v-model="collegeFilter"
          placeholder="筛选学院"
          clearable
          style="width: 200px"
          @change="onSearch"
        >
          <el-option
            v-for="college in collegeOptions"
            :key="college"
            :label="college"
            :value="college"
          />
        </el-select>
        <el-select
          v-model="gradeFilter"
          placeholder="年级"
          clearable
          style="width: 140px"
          @change="onSearch"
        >
          <el-option
            v-for="g in gradeOptions"
            :key="g"
            :label="g"
            :value="g"
          />
        </el-select>
        <el-select
          v-model="classFilter"
          placeholder="班级"
          clearable
          style="width: 120px"
          @change="onSearch"
        >
          <el-option
            v-for="c in classOptions"
            :key="c"
            :label="c"
            :value="c"
          />
        </el-select>
      </div>
    </el-card>

    <!-- Student Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="students"
        border
        stripe
        style="width: 100%"
        row-class-name="table-row"
        v-loading="loading"
        @row-click="openDetail"
      >
        <el-table-column prop="name" label="姓名" width="90" />
        <el-table-column prop="studentId" label="学号" width="140" />
        <el-table-column prop="college" label="学院" min-width="160" />
        <el-table-column prop="major" label="专业" min-width="150" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column label="部门" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.department" :type="row.departmentRole === 'head' ? 'warning' : 'info'" size="small">
              {{ row.department }}{{ row.departmentRole === 'head' ? '(部长)' : '' }}
            </el-tag>
            <span v-else style="color:#c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.status]?.type" size="small">
              {{ statusTagMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="openDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          background
          @current-change="loadStudents"
        />
      </div>
    </el-card>

    <!-- Full Page Student Detail Overlay -->
    <Transition name="overlay-fade">
      <div v-if="showDetail" class="detail-overlay" @click.self="showDetail = false">
        <div class="detail-panel">
          <!-- Panel Header -->
          <div class="detail-panel-header">
            <h3>学生详细信息</h3>
            <el-button :icon="Close" circle @click="showDetail = false" />
          </div>

          <!-- Panel Body -->
          <div class="detail-panel-body" v-if="currentStudent" v-loading="detailLoading">
            <!-- Top: Photo + Key Info -->
            <div class="detail-top">
              <div class="detail-photo">
                <el-avatar :size="100" shape="circle">
                  {{ (currentStudent.name || '?').charAt(0) }}
                </el-avatar>
              </div>
              <div class="detail-keyinfo">
                <div class="keyinfo-name">{{ currentStudent.name }}</div>
                <div class="keyinfo-meta">
                  <span>{{ currentStudent.studentId }}</span>
                  <el-divider direction="vertical" />
                  <span>{{ currentStudent.college || '-' }}</span>
                  <el-divider direction="vertical" />
                  <span>{{ currentStudent.grade || '-' }} · {{ currentStudent.className || '-' }}</span>
                </div>
                <el-tag :type="statusTagMap[currentStudent.status]?.type" size="small">
                  {{ statusTagMap[currentStudent.status]?.label || '正常' }}
                </el-tag>
              </div>
            </div>

            <!-- Tabs: Organised Sections -->
            <el-tabs v-model="detailTab" class="detail-tabs">
              <!-- Tab 1: 基本信息 -->
              <el-tab-pane label="基本信息" name="basic">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="姓名">{{ currentStudent.name || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="学号">{{ currentStudent.studentId || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="性别">{{ currentStudent.gender || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="民族">{{ currentStudent.ethnicity || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="手机号">{{ currentStudent.phone || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="邮箱">{{ currentStudent.email || '-' }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 2: 学籍信息 -->
              <el-tab-pane label="学籍信息" name="enrollment">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="学院">{{ currentStudent.college || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="专业">{{ currentStudent.major || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="年级">{{ currentStudent.grade || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="班级">{{ currentStudent.className || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="校区">{{ currentStudent.campus || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="宿舍号">{{ currentStudent.dormitory || '-' }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 3: 家庭信息 -->
              <el-tab-pane label="家庭信息" name="family">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="父亲姓名">{{ currentStudent.fatherName || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="父亲电话">{{ currentStudent.fatherPhone || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="母亲姓名">{{ currentStudent.motherName || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="母亲电话">{{ currentStudent.motherPhone || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="紧急联系人">{{ currentStudent.emergencyContact || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="紧急电话">{{ currentStudent.emergencyPhone || '-' }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 4: 个人特质 -->
              <el-tab-pane label="个人特质" name="personal">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="既往病史">{{ currentStudent.medicalHistory || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="兴趣爱好">{{ currentStudent.hobbies || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="性格特点">{{ currentStudent.personality || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="职业目标">{{ currentStudent.careerGoal || '无' }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 5: 特殊信息 -->
              <el-tab-pane label="特殊信息" name="special">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="困难等级">
                    <el-tag v-if="currentStudent.difficultyLevel" :type="difficultyTagMap[currentStudent.difficultyLevel]" size="small">
                      {{ currentStudent.difficultyLevel }}
                    </el-tag>
                    <span v-else>无</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="备注">{{ currentStudent.remark || '无' }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 6: 部门角色 -->
              <el-tab-pane label="部门角色" name="department">
                <div class="dept-section">
                  <el-form label-width="80px" @submit.prevent>
                    <el-form-item label="所属部门">
                      <el-select v-model="deptForm.department" placeholder="选择部门" clearable style="width: 240px">
                        <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.value" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="部门角色">
                      <el-select v-model="deptForm.departmentRole" placeholder="选择角色" clearable style="width: 240px">
                        <el-option label="部长" value="head" />
                        <el-option label="成员" value="member" />
                      </el-select>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" size="small" @click="saveDepartment" :loading="deptSaving">
                        保存
                      </el-button>
                      <el-button v-if="deptForm.department" size="small" @click="clearDepartment" :loading="deptSaving">
                        清除部门角色
                      </el-button>
                    </el-form-item>
                  </el-form>
                  <div v-if="currentStudent.department" class="dept-current">
                    <el-tag type="success" size="default">
                      {{ currentStudent.department }}
                    </el-tag>
                    <el-tag :type="currentStudent.departmentRole === 'head' ? 'warning' : 'info'" size="default" style="margin-left:8px">
                      {{ currentStudent.departmentRole === 'head' ? '部长' : currentStudent.departmentRole === 'member' ? '成员' : '未知' }}
                    </el-tag>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Batch Import Dialog -->
    <el-dialog v-model="showImportDialog" title="批量导入学生" width="560px" destroy-on-close>
      <div class="import-hint">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>
            请上传 CSV 或 Excel 文件，模板格式如下：
          </template>
          <p class="import-format">
            列名：学号, 姓名, 学院, 专业, 年级, 班级<br />
            示例：20240101001, 张三, 计算机学院, 软件工程, 2024级, 2班
          </p>
        </el-alert>
      </div>
      <div class="import-upload">
        <el-upload
          ref="uploadRef"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".csv,.xlsx,.xls"
          :on-change="onFileChange"
          :on-remove="onFileRemove"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">仅支持 .csv / .xlsx / .xls 文件</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="doBatchImport">
          开始导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { Upload, UploadFilled, Close } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import { importStudentsFile, getStudentList, getStudentDetail, getDepartments, setStudentDepartment } from '@/api/admin'
import gsap from 'gsap'

const statusTagMap = {
  1: { type: 'success', label: '正常' },
  normal: { type: 'success', label: '正常' },
  0: { type: 'warning', label: '待审核' },
  pending: { type: 'warning', label: '待审核' },
  '-1': { type: 'danger', label: '禁用' },
  disabled: { type: 'danger', label: '禁用' },
}

const difficultyTagMap = {
  '一般困难': 'warning',
  '特别困难': 'danger',
}

// ==================== Filters & Pagination ====================
const keyword = ref('')
const collegeFilter = ref('')
const gradeFilter = ref('')
const classFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const gradeOptions = ['2022级', '2023级', '2024级', '2025级']
const classOptions = ['1班', '2班', '3班']
const collegeOptions = ['计算机学院', '电子信息工程学院', '外国语学院', '数学与信息学院', '物理与天文学院', '文学院', '商学院', '政治与行政学院']

let searchTimer
function onSearchDebounced() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => onSearch(), 350)
}

function onSearch() {
  page.value = 1
  loadStudents()
}

// ==================== Student List ====================
const students = ref([])

function mapStudent(s) {
  return {
    id: s.id,
    name: s.name || '',
    studentId: s.username || s.studentId || '',
    college: s.college || '',
    major: s.major || '',
    grade: s.grade || '',
    className: s.class_name || s.className || '',
    phone: s.phone || '',
    email: s.email || '',
    department: s.department || null,
    departmentRole: s.department_role || s.departmentRole || '',
    status: s.status,
  }
}

async function loadStudents() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (keyword.value) params.keyword = keyword.value
    if (collegeFilter.value) params.college = collegeFilter.value
    if (classFilter.value) params.className = classFilter.value
    const res = await getStudentList(params)
    students.value = (res.data?.list || []).map(mapStudent)
    total.value = res.data?.total || 0
  } catch { ElMessage.error('加载学生列表失败') } finally {
    loading.value = false
    nextTick(() => gsap.from('.table-row', { opacity: 0, y: 20, duration: 0.4, stagger: 0.06, ease: 'power2.out' }))
  }
}

// ==================== Detail Panel ====================
const showDetail = ref(false)
const currentStudent = ref(null)
const detailTab = ref('basic')
const detailLoading = ref(false)

// Department management
const departments = ref([])
const deptForm = reactive({ department: '', departmentRole: '' })
const deptSaving = ref(false)

async function loadDepartments() {
  try {
    const res = await getDepartments()
    departments.value = res.data || res || []
  } catch { /* use defaults */ }
}

async function openDetail(row) {
  showDetail.value = true
  detailTab.value = 'basic'
  detailLoading.value = true

  // Start with basic data from list
  currentStudent.value = { ...row }

  try {
    const res = await getStudentDetail(row.id)
    const d = res.data || res
    const user = d.user || {}
    const info = d.studentInfo || d.student_info || {}
    const family = (d.familyInfo || d.family_info || [])[0] || {}

    currentStudent.value = {
      ...currentStudent.value,
      id: user.id || row.id,
      name: user.name || row.name,
      studentId: user.username || row.studentId,
      status: user.status ?? row.status,
      department: user.department || row.department || '',
      departmentRole: user.department_role || user.departmentRole || row.departmentRole || '',
      college: info.college || row.college || '',
      major: info.major || row.major || '',
      grade: info.grade || row.grade || '',
      className: info.class_name || info.className || row.className || '',
      campus: info.campus || '',
      dormitory: info.dormitory || '',
      phone: info.phone || row.phone || '',
      email: info.email || row.email || '',
      gender: info.gender || '',
      ethnicity: info.ethnicity || '',
      idCard: info.id_card || info.idCard || '',
      classTeacher: info.class_teacher || info.classTeacher || '',
      classTeacherPhone: info.class_teacher_phone || info.classTeacherPhone || '',
      fatherName: family.father_name || family.fatherName || '',
      fatherPhone: family.father_phone || family.fatherPhone || '',
      motherName: family.mother_name || family.motherName || '',
      motherPhone: family.mother_phone || family.motherPhone || '',
      emergencyContact: family.emergency_contact || family.emergencyContact || '',
      emergencyPhone: family.emergency_phone || family.emergencyPhone || '',
      medicalHistory: info.medical_history || info.medicalHistory || '',
      hobbies: info.hobbies || '',
      personality: info.personality || '',
      careerGoal: info.career_goal || info.careerGoal || '',
      difficultyLevel: info.difficulty_level || info.difficultyLevel || '',
      remark: info.remark || '',
    }

    deptForm.department = currentStudent.value.department || ''
    deptForm.departmentRole = currentStudent.value.departmentRole || ''
  } catch {
    ElMessage.error('加载学生详情失败')
  } finally {
    detailLoading.value = false
    nextTick(() => animateDetail())
  }
}

function animateDetail() {
  gsap.from('.detail-panel', { x: 100, opacity: 0, duration: 0.4, ease: 'power3.out' })
  gsap.from('.detail-top', { y: -20, opacity: 0, duration: 0.35, delay: 0.1, ease: 'power2.out' })
}

async function saveDepartment() {
  if (!currentStudent.value || !deptForm.department || !deptForm.departmentRole) {
    ElMessage.warning('请选择部门和角色')
    return
  }
  deptSaving.value = true
  try {
    await setStudentDepartment(currentStudent.value.id, {
      department: deptForm.department,
      departmentRole: deptForm.departmentRole,
    })
    currentStudent.value.department = deptForm.department
    currentStudent.value.departmentRole = deptForm.departmentRole
    ElMessage.success('部门角色设置成功')
  } catch {
    ElMessage.error('设置失败')
  } finally { deptSaving.value = false }
}

async function clearDepartment() {
  deptSaving.value = true
  try {
    await setStudentDepartment(currentStudent.value.id, { department: null, departmentRole: null })
    currentStudent.value.department = null
    currentStudent.value.departmentRole = null
    deptForm.department = ''
    deptForm.departmentRole = ''
    ElMessage.success('部门角色已清除')
  } catch {
    ElMessage.error('清除失败')
  } finally { deptSaving.value = false }
}

// ==================== Batch Import ====================
const showImportDialog = ref(false)
const importLoading = ref(false)
const importFile = ref(null)

function onFileChange(file) { importFile.value = file }
function onFileRemove() { importFile.value = null }

async function doBatchImport() {
  if (!importFile.value) { ElMessage.warning('请先选择要导入的文件'); return }
  importLoading.value = true
  try {
    const fd = new FormData()
    fd.append('file', importFile.value.raw)
    const res = await importStudentsFile(fd)
    const { imported, total: t, errors } = res.data || res || {}
    ElNotification({
      title: '导入完成',
      message: `成功导入 ${imported || '?'}/${t || '?'} 名学生${errors ? '，部分行失败' : ''}`,
      type: errors ? 'warning' : 'success',
      duration: 5000,
    })
    showImportDialog.value = false
    importFile.value = null
    loadStudents()
  } catch {
    ElNotification({ title: '导入失败', message: '文件解析失败', type: 'error' })
  } finally { importLoading.value = false }
}

// ==================== Lifecycle ====================
let ctx
onMounted(() => {
  loadStudents()
  loadDepartments()
  ctx = gsap.context(() => {
    gsap.from('.page-header', { y: -30, opacity: 0, duration: 0.5, ease: 'power3.out' })
    gsap.from('.filter-card', { y: -20, opacity: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' })
  })
})
onUnmounted(() => ctx?.revert())
</script>

<style scoped>
.students-page { max-width: 1200px; }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.header-left h2 { margin: 0 0 6px; font-size: 20px; }
.header-left p { margin: 0; color: #909399; font-size: 14px; }

/* Filters */
.filter-card { margin-bottom: 16px; }
.filter-row { display: flex; gap: 12px; flex-wrap: wrap; }

/* Table */
.table-card { margin-bottom: 16px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }

/* ======== Full Page Detail Overlay ======== */
.detail-overlay {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,0.45);
  display: flex; justify-content: flex-end; align-items: stretch;
}
.detail-panel {
  width: 80vw; max-width: 960px; height: 100vh; background: #fff;
  display: flex; flex-direction: column;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12); overflow: hidden;
}
.detail-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 28px; border-bottom: 1px solid #ebeef5; flex-shrink: 0;
}
.detail-panel-header h3 { margin: 0; font-size: 18px; color: #303133; }
.detail-panel-body { flex: 1; overflow-y: auto; padding: 24px 28px; }

/* Top section */
.detail-top { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #ebeef5; }
.detail-photo :deep(.el-avatar) { background: linear-gradient(135deg, #409eff, #67c23a); font-size: 36px; font-weight: 600; color: #fff; }
.keyinfo-name { font-size: 20px; font-weight: 600; color: #303133; margin-bottom: 6px; }
.keyinfo-meta { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #909399; margin-bottom: 8px; }

/* Overlay Transition */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity .3s ease; }
.overlay-fade-enter-active .detail-panel, .overlay-fade-leave-active .detail-panel { transition: transform .35s ease, opacity .35s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }
.overlay-fade-enter-from .detail-panel, .overlay-fade-leave-to .detail-panel { transform: translateX(100%); opacity: 0; }

/* Import Dialog */
.import-hint { margin-bottom: 16px; }
.import-format { margin: 8px 0 0; font-size: 12px; color: #606266; line-height: 1.8; font-family: monospace; }
.import-upload { margin-top: 8px; }
:deep(.table-row) { cursor: pointer; }

/* Department */
.dept-section { padding: 8px 0; }
.dept-current { margin-top: 16px; padding: 12px; background: var(--color-bg); border-radius: var(--radius-sm); }
</style>
