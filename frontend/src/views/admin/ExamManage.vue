<template>
  <div class="exam-manage-page" ref="pageRef">
    <FadeContent>
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">考试管理</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon style="margin-right: 4px"><Plus /></el-icon>创建考试
          </el-button>
        </div>
      </template>

      <!-- 考试列表 -->
      <el-table :data="examList" stripe border style="width: 100%">
        <el-table-column prop="title" label="考试名称" min-width="200" />
        <el-table-column prop="duration" label="时长(分钟)" width="100" align="center" />
        <el-table-column prop="passScore" label="及格分" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '进行中' ? 'success' : row.status === '未开始' ? 'info' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
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
      width="500px"
    >
      <el-form ref="examFormRef" :model="examDialog.form" :rules="examRules" label-width="90px">
        <el-form-item label="考试名称" prop="title">
          <el-input v-model="examDialog.form.title" placeholder="请输入考试名称" />
        </el-form-item>
        <el-form-item label="时长(分钟)" prop="duration">
          <el-input-number v-model="examDialog.form.duration" :min="1" :max="300" />
        </el-form-item>
        <el-form-item label="及格分" prop="passScore">
          <el-input-number v-model="examDialog.form.passScore" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="examDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitExam">确认</el-button>
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
      <el-table :data="questionDialog.questions" stripe border style="width: 100%">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="text" label="题目" min-width="200" show-overflow-tooltip />
        <el-table-column prop="correctAnswer" label="正确答案" width="90" align="center" />
        <el-table-column prop="score" label="分值" width="70" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row, $index }">
            <el-button type="primary" size="small" link @click="openQuestionForm(row, $index)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="deleteQuestion($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="questionDialog.visible = false">关闭</el-button>
        <el-button type="primary" @click="saveQuestions">保存题目</el-button>
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
        <el-button type="primary" @click="submitQuestion">确认</el-button>
      </template>
    </el-dialog>
    </FadeContent>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import gsap from 'gsap'
import { importExamQuestions } from '@/api/safety'

const pageRef = ref(null)
const examFormRef = ref(null)
const qFormRef = ref(null)

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

// --- Mock Exam Data ---
const examList = ref([
  {
    id: 1,
    title: '2025-2026第二学期 安全教育考试',
    duration: 60,
    passScore: 80,
    status: '进行中',
    questions: [
      { text: '火灾发生时，以下做法正确的是？', optionA: '乘坐电梯逃生', optionB: '用湿毛巾捂住口鼻低姿逃生', optionC: '躲在卫生间', optionD: '打开门窗通风', correctAnswer: 'B', score: 10 },
      { text: '以下哪项属于网络诈骗？', optionA: '商家打折促销', optionB: '冒充公检法要求转账', optionC: '朋友借钱', optionD: '网上购物', correctAnswer: 'B', score: 10 },
      { text: '实验室使用电器设备时，应注意什么？', optionA: '可以超负荷使用', optionB: '离开时必须断电', optionC: '可以使用破损电源线', optionD: '湿手操作电器', correctAnswer: 'B', score: 10 },
      { text: '宿舍内以下哪种行为是违规的？', optionA: '使用台灯', optionB: '使用热得快烧水', optionC: '给手机充电', optionD: '使用电脑', correctAnswer: 'B', score: 10 },
      { text: '遭遇校园欺凌时，最佳做法是？', optionA: '以暴制暴', optionB: '忍气吞声', optionC: '及时向老师和家长报告', optionD: '找人报复', correctAnswer: 'C', score: 10 },
    ],
  },
  {
    id: 2,
    title: '2025-2026第二学期 实验室安全准入考试',
    duration: 45,
    passScore: 90,
    status: '未开始',
    questions: [
      { text: '进入实验室前必须穿戴什么？', optionA: '休闲服装', optionB: '实验服和防护装备', optionC: '西装', optionD: '运动鞋即可', correctAnswer: 'B', score: 10 },
      { text: '化学品溅入眼睛时，首先应该？', optionA: '揉眼睛', optionB: '用大量清水冲洗并就医', optionC: '闭眼等待', optionD: '滴眼药水', correctAnswer: 'B', score: 10 },
      { text: '实验产生的废液应该如何处理？', optionA: '直接倒入下水道', optionB: '分类收集到指定容器', optionC: '倒入垃圾桶', optionD: '随意处置', correctAnswer: 'B', score: 10 },
      { text: '使用高压灭菌锅时，注意事项是？', optionA: '可以随时打开', optionB: '待压力降至零后再打开', optionC: '快速降压打开', optionD: '无需等待', correctAnswer: 'B', score: 10 },
      { text: '实验室禁止的行为是？', optionA: '按规程操作', optionB: '在实验室内饮食', optionC: '记录实验数据', optionD: '穿戴防护用品', correctAnswer: 'B', score: 10 },
    ],
  },
])

// --- Exam Dialog ---
const examDialog = reactive({
  visible: false,
  isEdit: false,
  form: { title: '', duration: 60, passScore: 60 },
})

function openCreateDialog() {
  examDialog.isEdit = false
  examDialog.form = { title: '', duration: 60, passScore: 60 }
  examDialog.visible = true
}

function submitExam() {
  if (!examDialog.form.title || !examDialog.form.duration || !examDialog.form.passScore) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (examDialog.isEdit) {
    ElMessage.success('考试信息已更新（Mock）')
  } else {
    const newId = Math.max(...examList.value.map((e) => e.id), 0) + 1
    examList.value.push({
      id: newId,
      title: examDialog.form.title,
      duration: examDialog.form.duration,
      passScore: examDialog.form.passScore,
      status: '未开始',
      questions: [],
    })
    ElMessage.success('考试创建成功（Mock）')
  }
  examDialog.visible = false
}

function handleDeleteExam(row) {
  ElMessageBox.confirm(`确认删除考试「${row.title}」？删除后不可恢复。`, '提示', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    examList.value = examList.value.filter((e) => e.id !== row.id)
    ElMessage.success('考试已删除（Mock）')
  })
}

// --- Question Dialog ---
const questionDialog = reactive({
  visible: false,
  examTitle: '',
  examId: null,
  questions: [],
})

function manageQuestions(row) {
  questionDialog.examTitle = row.title
  questionDialog.examId = row.id
  questionDialog.questions = JSON.parse(JSON.stringify(row.questions))
  questionDialog.visible = true
}

function saveQuestions() {
  const exam = examList.value.find((e) => e.id === questionDialog.examId)
  if (exam) {
    exam.questions = JSON.parse(JSON.stringify(questionDialog.questions))
  }
  questionDialog.visible = false
  ElMessage.success('题目已保存（Mock）')
}

// --- Question Form Dialog ---
const qFormDialog = reactive({
  visible: false,
  isEdit: false,
  editIndex: null,
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
    qFormDialog.editIndex = index
    qFormDialog.form = { ...row }
  } else {
    qFormDialog.isEdit = false
    qFormDialog.editIndex = null
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

function submitQuestion() {
  if (!qFormDialog.form.text || !qFormDialog.form.correctAnswer) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (qFormDialog.isEdit) {
    questionDialog.questions[qFormDialog.editIndex] = { ...qFormDialog.form }
    ElMessage.success('题目已更新')
  } else {
    questionDialog.questions.push({ ...qFormDialog.form })
    ElMessage.success('题目已添加')
  }
  qFormDialog.visible = false
}

function deleteQuestion(index) {
  ElMessageBox.confirm('确认删除该题目？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    questionDialog.questions.splice(index, 1)
    ElMessage.success('题目已删除')
  })
}

// --- Batch Question Import ---
const importingQuestions = ref(false)
const questionImportFile = ref(null)

function handleQuestionFileChange(file) {
  questionImportFile.value = file
  doImportQuestions()
}

async function doImportQuestions() {
  if (!questionImportFile.value) return
  importingQuestions.value = true
  try {
    const fd = new FormData()
    fd.append('file', questionImportFile.value.raw)
    const res = await importExamQuestions(questionDialog.examId, fd)
    const { imported, total, errors } = res.data || {}
    ElNotification({
      title: '导入完成',
      message: `成功导入 ${imported}/${total} 道题目${errors ? '，部分行失败' : ''}`,
      type: errors ? 'warning' : 'success',
      duration: 5000,
    })
    // Reload questions — for now just refresh from the exam list
    const exam = examList.value.find((e) => e.id === questionDialog.examId)
    if (exam && imported) {
      // Add placeholder questions since we don't re-fetch from backend
      // In production this would re-fetch from the API
    }
    questionImportFile.value = null
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
