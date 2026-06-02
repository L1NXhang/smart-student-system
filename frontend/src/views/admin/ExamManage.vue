<template>
  <div class="exam-manage-page" ref="pageRef">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">考试管理</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon style="margin-right: 4px"><Plus /></el-icon>创建考试
          </el-button>
        </div>
      </template>

      <el-table :data="examList" stripe border style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="考试名称" min-width="160" />
        <el-table-column prop="examDate" label="考试日期" width="110" align="center" />
        <el-table-column prop="location" label="地点" width="120" align="center" />
        <el-table-column prop="duration" label="时长(分钟)" width="90" align="center" />
        <el-table-column prop="passScore" label="及格分" width="70" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '进行中' : '已结束' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="primary" size="small" link @click="manageQuestions(row)">
              管理题目
            </el-button>
            <el-button type="danger" size="small" link @click="handleDeleteExam(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑考试 Dialog -->
    <el-dialog
      v-model="examDialog.visible"
      :title="examDialog.isEdit ? '编辑考试' : '创建考试'"
      width="560px"
      destroy-on-close
      @closed="resetExamForm"
    >
      <el-form ref="examFormRef" :model="examDialog.form" :rules="examRules" label-width="100px">
        <el-form-item label="考试名称" prop="title">
          <el-input v-model="examDialog.form.title" placeholder="请输入考试名称" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="时长(分钟)" prop="duration">
              <el-input-number v-model="examDialog.form.duration" :min="1" :max="300" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="及格分" prop="passScore">
              <el-input-number v-model="examDialog.form.passScore" :min="1" :max="100" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="考试日期" prop="examDate">
          <el-date-picker
            v-model="examDialog.form.examDate"
            type="date"
            placeholder="请选择考试日期"
            style="width:100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="考试地点">
          <el-input v-model="examDialog.form.location" placeholder="如：教学楼A101" />
        </el-form-item>
        <el-form-item label="监考老师">
          <el-input v-model="examDialog.form.invigilator" placeholder="监考老师姓名" />
        </el-form-item>
        <el-form-item label="考试说明">
          <el-input v-model="examDialog.form.description" type="textarea" :rows="2" placeholder="考试注意事项等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="examDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="examDialog.loading" @click="submitExam">
          {{ examDialog.isEdit ? '保存修改' : '确认创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 管理题目 Dialog -->
    <el-dialog
      v-model="questionDialog.visible"
      :title="`管理题目：${questionDialog.examTitle}`"
      width="800px"
      top="40px"
    >
      <div class="question-header">
        <el-button type="primary" size="small" @click="openQuestionForm(null)">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>添加题目
        </el-button>
        <el-upload
          :auto-upload="false"
          :limit="1"
          accept=".csv,.xlsx,.xls"
          :show-file-list="false"
          :on-change="handleQuestionFileChange"
          class="question-import-upload"
        >
          <el-button type="success" size="small" :loading="importingQuestions">
            <el-icon style="margin-right: 4px"><Upload /></el-icon>批量导入
          </el-button>
        </el-upload>
      </div>
      <el-alert type="info" :closable="false" class="question-import-hint" show-icon>
        <template #title>
          批量导入格式：Excel 第一行为表头，列名：题目内容 / 选项A / 选项B / 选项C / 选项D / 正确答案 / 分值
        </template>
      </el-alert>
      <el-table :data="questionDialog.questions" stripe border style="width: 100%" v-loading="questionDialog.loading">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="text" label="题目" min-width="200" show-overflow-tooltip />
        <el-table-column prop="correctAnswer" label="正确答案" width="90" align="center" />
        <el-table-column prop="score" label="分值" width="70" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row, $index }">
            <el-button type="primary" size="small" link @click="openQuestionForm(row, $index)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="deleteQuestion($index, row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="questionDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 题目表单 Dialog -->
    <el-dialog
      v-model="qFormDialog.visible"
      :title="qFormDialog.isEdit ? '编辑题目' : '添加题目'"
      width="600px"
    >
      <el-form ref="qFormRef" :model="qFormDialog.form" :rules="qFormRules" label-width="100px">
        <el-form-item label="题目内容" prop="text">
          <el-input v-model="qFormDialog.form.text" type="textarea" :rows="2" placeholder="请输入题目内容" />
        </el-form-item>
        <el-form-item label="选项A" prop="optionA">
          <el-input v-model="qFormDialog.form.optionA" placeholder="A选项内容" />
        </el-form-item>
        <el-form-item label="选项B" prop="optionB">
          <el-input v-model="qFormDialog.form.optionB" placeholder="B选项内容" />
        </el-form-item>
        <el-form-item label="选项C" prop="optionC">
          <el-input v-model="qFormDialog.form.optionC" placeholder="C选项内容" />
        </el-form-item>
        <el-form-item label="选项D" prop="optionD">
          <el-input v-model="qFormDialog.form.optionD" placeholder="D选项内容" />
        </el-form-item>
        <el-form-item label="正确答案" prop="correctAnswer">
          <el-select v-model="qFormDialog.form.correctAnswer" placeholder="请选择正确答案">
            <el-option label="A" value="A" />
            <el-option label="B" value="B" />
            <el-option label="C" value="C" />
            <el-option label="D" value="D" />
          </el-select>
        </el-form-item>
        <el-form-item label="分值" prop="score">
          <el-input-number v-model="qFormDialog.form.score" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="qFormDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="qFormDialog.loading" @click="submitQuestion">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import gsap from 'gsap'
import {
  getExams, getExamQuestions, createExam, updateExam, deleteExam,
  createQuestion, updateQuestion, deleteQuestion as deleteQuestionApi,
  importExamQuestions,
} from '@/api/safety'

const pageRef = ref(null)
const examFormRef = ref(null)
const qFormRef = ref(null)
const loading = ref(false)

const examRules = {
  title: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  duration: [{ required: true, message: '请设置考试时长', trigger: 'blur' }],
  passScore: [{ required: true, message: '请设置及格分', trigger: 'blur' }],
}

const qFormRules = {
  text: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  optionA: [{ required: true, message: '请输入选项A', trigger: 'blur' }],
  optionB: [{ required: true, message: '请输入选项B', trigger: 'blur' }],
  optionC: [{ required: true, message: '请输入选项C', trigger: 'blur' }],
  optionD: [{ required: true, message: '请输入选项D', trigger: 'blur' }],
  correctAnswer: [{ required: true, message: '请选择正确答案', trigger: 'change' }],
  score: [{ required: true, message: '请设置分值', trigger: 'blur' }],
}

const examList = ref([])

function mapExam(e) {
  return {
    id: e.id,
    title: e.title,
    description: e.description || '',
    duration: e.duration,
    passScore: e.pass_score ?? e.passScore,
    totalScore: e.total_score ?? e.totalScore,
    status: e.status,
    examDate: e.exam_date || e.examDate || '',
    location: e.location || '',
    invigilator: e.invigilator || '',
    createdAt: e.created_at || e.createdAt,
  }
}

function parseOpts(opts) {
  try { return typeof opts === 'string' ? JSON.parse(opts) : (opts || []) } catch { return [] }
}

function mapQuestion(q) {
  const opts = parseOpts(q.options)
  return {
    id: q.id,
    text: q.question || q.text || '',
    optionA: opts[0] || '',
    optionB: opts[1] || '',
    optionC: opts[2] || '',
    optionD: opts[3] || '',
    correctAnswer: q.answer || q.correctAnswer || '',
    score: q.score,
  }
}

async function loadExams() {
  loading.value = true
  try {
    const res = await getExams()
    examList.value = (res.data || []).map(mapExam)
  } catch {
    ElMessage.error('加载考试列表失败')
  } finally {
    loading.value = false
  }
}

// --- Exam Dialog ---
const defaultExamForm = {
  title: '', duration: 60, passScore: 60,
  examDate: '', location: '', invigilator: '', description: '',
}

const examDialog = reactive({
  visible: false,
  isEdit: false,
  editId: null,
  loading: false,
  form: { ...defaultExamForm },
})

function openCreateDialog() {
  examDialog.isEdit = false
  examDialog.editId = null
  examDialog.form = { ...defaultExamForm }
  examDialog.visible = true
}

function openEditDialog(row) {
  examDialog.isEdit = true
  examDialog.editId = row.id
  examDialog.form = {
    title: row.title || '',
    duration: row.duration || 60,
    passScore: row.passScore || 60,
    examDate: row.examDate || row.exam_date || '',
    location: row.location || '',
    invigilator: row.invigilator || '',
    description: row.description || '',
  }
  examDialog.visible = true
}

function resetExamForm() {
  examDialog.form = { ...defaultExamForm }
  examFormRef.value?.resetFields()
}

async function submitExam() {
  if (!examDialog.form.title || !examDialog.form.duration || !examDialog.form.passScore) {
    ElMessage.warning('请填写完整信息')
    return
  }
  examDialog.loading = true
  try {
    const payload = {
      title: examDialog.form.title,
      duration: examDialog.form.duration,
      pass_score: examDialog.form.passScore,
      exam_date: examDialog.form.examDate,
      location: examDialog.form.location,
      invigilator: examDialog.form.invigilator,
      description: examDialog.form.description,
    }
    if (examDialog.isEdit) {
      await updateExam(examDialog.editId, payload)
      ElMessage.success('考试已更新')
    } else {
      await createExam(payload)
      ElMessage.success('考试创建成功')
    }
    examDialog.visible = false
    loadExams()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || (examDialog.isEdit ? '更新失败' : '创建失败'))
  } finally {
    examDialog.loading = false
  }
}

async function handleDeleteExam(row) {
  try {
    await ElMessageBox.confirm(`确认删除考试「${row.title}」？删除后不可恢复。`, '提示', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    await deleteExam(row.id)
    ElMessage.success('考试已删除')
    loadExams()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '删除失败')
  }
}

// --- Question Dialog ---
const questionDialog = reactive({
  visible: false,
  examTitle: '',
  examId: null,
  questions: [],
  loading: false,
})

async function manageQuestions(row) {
  questionDialog.examTitle = row.title
  questionDialog.examId = row.id
  questionDialog.questions = []
  questionDialog.visible = true
  questionDialog.loading = true
  try {
    const res = await getExamQuestions(row.id)
    questionDialog.questions = (res.data || []).map(mapQuestion)
  } catch {
    ElMessage.error('加载题目失败')
  } finally {
    questionDialog.loading = false
  }
}

// --- Question Form Dialog ---
const qFormDialog = reactive({
  visible: false,
  isEdit: false,
  editId: null,
  loading: false,
  form: {
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    score: 10,
  },
})

function openQuestionForm(row, index) {
  if (row) {
    qFormDialog.isEdit = true
    qFormDialog.editId = row.id
    qFormDialog.form = { ...row }
  } else {
    qFormDialog.isEdit = false
    qFormDialog.editId = null
    qFormDialog.form = {
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      score: 10,
    }
  }
  qFormDialog.visible = true
}

async function submitQuestion() {
  if (!qFormDialog.form.text || !qFormDialog.form.correctAnswer) {
    ElMessage.warning('请填写完整信息')
    return
  }
  qFormDialog.loading = true
  try {
    const body = {
      exam_id: questionDialog.examId,
      question: qFormDialog.form.text,
      question_type: 'single',
      options: JSON.stringify([
        qFormDialog.form.optionA,
        qFormDialog.form.optionB,
        qFormDialog.form.optionC,
        qFormDialog.form.optionD,
      ]),
      answer: qFormDialog.form.correctAnswer,
      score: qFormDialog.form.score,
    }
    if (qFormDialog.isEdit) {
      await updateQuestion(qFormDialog.editId, body)
      ElMessage.success('题目已更新')
    } else {
      await createQuestion(questionDialog.examId, body)
      ElMessage.success('题目已添加')
    }
    qFormDialog.visible = false
    // Refresh questions
    questionDialog.loading = true
    try {
      const res = await getExamQuestions(questionDialog.examId)
      questionDialog.questions = (res.data || []).map(mapQuestion)
    } catch { /* ignore */ } finally {
      questionDialog.loading = false
    }
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '操作失败')
  } finally {
    qFormDialog.loading = false
  }
}

async function deleteQuestion(index, row) {
  try {
    await ElMessageBox.confirm('确认删除该题目？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  try {
    if (row.id) {
      await deleteQuestionApi(row.id)
    }
    questionDialog.questions.splice(index, 1)
    ElMessage.success('题目已删除')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '删除失败')
  }
}

// --- Batch Question Import ---
const importingQuestions = ref(false)

async function handleQuestionFileChange(file) {
  importingQuestions.value = true
  try {
    const fd = new FormData()
    fd.append('file', file.raw)
    const res = await importExamQuestions(questionDialog.examId, fd)
    const result = res.data || res
    ElNotification({
      title: '导入完成',
      message: `成功导入 ${result.successCount || result.imported || 0} 道题目`,
      type: 'success',
      duration: 5000,
    })
    // Refresh question list
    questionDialog.loading = true
    try {
      const qRes = await getExamQuestions(questionDialog.examId)
      questionDialog.questions = (qRes.data || []).map(mapQuestion)
    } catch { /* ignore */ } finally {
      questionDialog.loading = false
    }
  } catch (e) {
    ElNotification({
      title: '导入失败',
      message: e.response?.data?.message || '文件解析失败，请检查格式',
      type: 'error',
    })
  } finally {
    importingQuestions.value = false
  }
}

// --- GSAP ---
let ctx
onMounted(() => {
  loadExams()
  ctx = gsap.context(() => {
    gsap.from('.page-card', {
      y: 40,
      autoAlpha: 0,
      duration: 0.6,
      ease: 'power3.out',
    })
  }, pageRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
.exam-manage-page {
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

.question-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.question-import-upload {
  display: inline-block;
}

.question-import-hint {
  margin-bottom: 12px;
}
</style>
