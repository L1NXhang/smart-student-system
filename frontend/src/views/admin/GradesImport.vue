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
        <el-button type="success" :disabled="!selectedFile" :loading="importing" @click="handleImport">
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
              @input="onSearchDebounced"
            />
          </div>
        </div>
      </template>
      <el-table :data="grades" stripe border style="width: 100%" v-loading="loading">
        <el-table-column prop="studentName" label="学生姓名" min-width="100" />
        <el-table-column prop="studentId" label="学号" min-width="130" />
        <el-table-column prop="semester" label="学期" min-width="150" />
        <el-table-column prop="courseName" label="课程" min-width="160" />
        <el-table-column prop="score" label="成绩" width="80" align="center" />
        <el-table-column prop="credit" label="学分" width="70" align="center" />
        <el-table-column prop="gpa" label="绩点" width="70" align="center" />
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          background
          @current-change="loadGradesList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import gsap from 'gsap'
import { getGradesList, importGrades } from '@/api/admin'

const pageRef = ref(null)
const uploadRef = ref(null)
const selectedFile = ref(null)
const searchKeyword = ref('')
const loading = ref(false)
const importing = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const importForm = reactive({
  semester: '2025-2026-2',
})

const grades = ref([])

let searchTimer = null
function onSearchDebounced() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    loadGradesList()
  }, 350)
}

function mapGrade(g) {
  return {
    studentName: g.student_name || g.studentName || '',
    studentId: g.student_username || g.studentId || '',
    semester: g.semester || '',
    courseName: g.course_name || g.courseName || '',
    score: g.score ?? '',
    credit: g.credit ?? '',
    gpa: g.gpa ?? '',
  }
}

async function loadGradesList() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize: pageSize.value }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (importForm.semester) params.semester = importForm.semester
    const res = await getGradesList(params)
    grades.value = (res.data?.list || []).map(mapGrade)
    total.value = res.data?.total || 0
  } catch {
    ElMessage.error('加载成绩列表失败')
  } finally {
    loading.value = false
  }
}

function downloadTemplate() {
  const header = ['学号', '学期', '课程名称', '课程类型', '学分', '成绩', '绩点']
  const example = ['20221101001', '2025-2026-2', '高等数学(下)', 'required', '5', '92', '4.0']
  const csvContent = '﻿' + header.join(',') + '\n' + example.join(',')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '成绩导入模板.csv'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('模板下载成功')
}

function handleExceed() {
  ElMessage.warning('每次只能上传一个文件，请先移除已有文件')
}

function handleFileChange(file) {
  selectedFile.value = file.raw
}

async function handleImport() {
  if (!importForm.semester) {
    ElMessage.warning('请先选择学期')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认将文件导入到 ${importForm.semester} 学期？`,
      '确认导入',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'info' }
    )
  } catch {
    return
  }
  importing.value = true
  try {
    const fd = new FormData()
    fd.append('file', selectedFile.value)
    fd.append('semester', importForm.semester)
    const res = await importGrades(fd)
    const result = res.data || res
    ElMessage.success(`导入完成：成功 ${result.successCount || 0} 条，失败 ${result.failCount || 0} 条`)
    selectedFile.value = null
    uploadRef.value?.clearFiles()
    loadGradesList()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '导入失败')
  } finally {
    importing.value = false
  }
}

let ctx
onMounted(() => {
  loadGradesList()
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
