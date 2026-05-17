<template>
  <div class="grades-import-page" ref="pageRef">
    <!-- 导入成绩 -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">导入成绩</span>
        </div>
      </template>
      <el-form :inline="true" class="import-form">
        <el-form-item label="选择学期">
          <el-select v-model="importForm.semester" placeholder="请选择学期" style="width: 200px">
            <el-option label="2025-2026 第一学期" value="2025-2026-1" />
            <el-option label="2025-2026 第二学期" value="2025-2026-2" />
            <el-option label="2024-2025 第一学期" value="2024-2025-1" />
            <el-option label="2024-2025 第二学期" value="2024-2025-2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="downloadTemplate">
            <el-icon style="margin-right: 4px"><Download /></el-icon>下载模板
          </el-button>
        </el-form-item>
      </el-form>
      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-exceed="handleExceed"
        :on-change="handleFileChange"
      >
        <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
        <div class="upload-text">
          <p class="upload-title">将 Excel 文件拖到此处，或<em>点击上传</em></p>
          <p class="upload-hint">仅支持 .xlsx / .xls 格式文件，单次只能上传一个文件</p>
        </div>
      </el-upload>
      <div class="import-actions">
        <el-button type="success" :disabled="!selectedFile" @click="handleImport">
          开始导入
        </el-button>
      </div>
    </el-card>

    <!-- 成绩列表 -->
    <el-card shadow="never" class="section-card table-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">成绩列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学生姓名或学号"
              clearable
              style="width: 240px"
              :prefix-icon="Search"
            />
          </div>
        </div>
      </template>
      <el-table :data="filteredGrades" stripe border style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" min-width="100" />
        <el-table-column prop="studentId" label="学号" min-width="130" />
        <el-table-column prop="semester" label="学期" min-width="150" />
        <el-table-column prop="courseName" label="课程" min-width="160" />
        <el-table-column prop="score" label="成绩" width="80" align="center" />
        <el-table-column prop="credit" label="学分" width="70" align="center" />
        <el-table-column prop="gpa" label="绩点" width="70" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import gsap from 'gsap'

const pageRef = ref(null)
const uploadRef = ref(null)
const selectedFile = ref(null)
const searchKeyword = ref('')

const importForm = reactive({
  semester: '2025-2026-2',
})

// --- Mock Data ---
const grades = ref([
  { studentName: '张三', studentId: '20221101001', semester: '2025-2026第二学期', courseName: '高等数学(下)', score: 92, credit: 5, gpa: 4.0 },
  { studentName: '李四', studentId: '20221101002', semester: '2025-2026第二学期', courseName: '大学物理(二)', score: 85, credit: 4, gpa: 3.5 },
  { studentName: '王五', studentId: '20221101003', semester: '2025-2026第二学期', courseName: '数据结构', score: 78, credit: 4, gpa: 3.0 },
  { studentName: '赵六', studentId: '20221101004', semester: '2025-2026第二学期', courseName: '线性代数', score: 88, credit: 3, gpa: 3.7 },
  { studentName: '孙七', studentId: '20221101005', semester: '2025-2026第二学期', courseName: '操作系统', score: 76, credit: 4, gpa: 2.8 },
  { studentName: '周八', studentId: '20221101006', semester: '2025-2026第二学期', courseName: '计算机网络', score: 95, credit: 3, gpa: 4.0 },
  { studentName: '吴九', studentId: '20221101007', semester: '2025-2026第二学期', courseName: '编译原理', score: 82, credit: 3, gpa: 3.3 },
  { studentName: '郑十', studentId: '20221101008', semester: '2025-2026第二学期', courseName: '数据库原理', score: 90, credit: 4, gpa: 3.8 },
  { studentName: '冯十一', studentId: '20221101009', semester: '2025-2026第二学期', courseName: '高等数学(下)', score: 71, credit: 5, gpa: 2.5 },
  { studentName: '陈十二', studentId: '20221101010', semester: '2025-2026第二学期', courseName: '大学英语(四)', score: 87, credit: 2, gpa: 3.6 },
])

const filteredGrades = computed(() => {
  if (!searchKeyword.value) return grades.value
  const kw = searchKeyword.value.toLowerCase()
  return grades.value.filter(
    (g) => g.studentName.includes(kw) || g.studentId.includes(kw)
  )
})

function downloadTemplate() {
  ElMessage.success('模板下载已开始（功能待接入后端）')
}

function handleExceed() {
  ElMessage.warning('每次只能上传一个文件，请先移除已有文件')
}

function handleFileChange(file) {
  selectedFile.value = file.raw
}

function handleImport() {
  if (!importForm.semester) {
    ElMessage.warning('请先选择学期')
    return
  }
  ElMessageBox.confirm(
    `确认将文件导入到 ${importForm.semester} 学期？`,
    '确认导入',
    { confirmButtonText: '确认', cancelButtonText: '取消', type: 'info' }
  ).then(() => {
    ElMessage.success('成绩导入成功（Mock）')
    selectedFile.value = null
    uploadRef.value?.clearFiles()
  })
}

// --- GSAP ---
let ctx
onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.section-card', {
      y: 40,
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
    })
  }, pageRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
.grades-import-page {
  max-width: 1200px;
}

.section-card {
  margin-bottom: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.import-form {
  margin-bottom: 16px;
}

.upload-area {
  margin-bottom: 16px;
}

.upload-icon {
  color: #c0c4cc;
  margin-bottom: 8px;
}

.upload-text {
  color: #909399;
}

.upload-title {
  font-size: 14px;
  margin: 0 0 4px;
}

.upload-title em {
  color: #409EFF;
  font-style: normal;
}

.upload-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin: 0;
}

.import-actions {
  text-align: right;
}

.table-card {
  min-height: 400px;
}
</style>
