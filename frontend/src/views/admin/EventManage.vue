<template>
  <div class="event-manage-page" ref="pageRef">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">活动管理</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon style="margin-right: 4px"><Plus /></el-icon>发布活动
          </el-button>
        </div>
      </template>

      <!-- 活动列表 -->
      <el-table :data="eventList" stripe border style="width: 100%">
        <el-table-column prop="title" label="活动名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="eventTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="eventTime" label="时间" min-width="160" />
        <el-table-column prop="location" label="地点" min-width="130" show-overflow-tooltip />
        <el-table-column label="报名人数/名额" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'quota-full': row.registered >= row.quota }">
              {{ row.registered }} / {{ row.quota }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewRegistrants(row)">
              查看报名
            </el-button>
            <el-button type="warning" size="small" link @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleCancel(row)">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 发布/编辑活动 Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑活动' : '发布活动'"
      width="600px"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="90px">
        <el-form-item label="活动名称" prop="title">
          <el-input v-model="dialog.form.title" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="dialog.form.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="学术讲座" value="学术讲座" />
            <el-option label="文体活动" value="文体活动" />
            <el-option label="志愿服务" value="志愿服务" />
            <el-option label="学科竞赛" value="学科竞赛" />
            <el-option label="社团活动" value="社团活动" />
          </el-select>
        </el-form-item>
        <el-form-item label="学时类型" prop="hoursType">
          <el-select v-model="dialog.form.hoursType" placeholder="请选择学时类型（可选）" clearable style="width: 100%">
            <el-option label="文体学时" value="文体学时" />
            <el-option label="思想素质学时" value="思想素质学时" />
            <el-option label="技能特长学时" value="技能特长学时" />
            <el-option label="志愿服务学时" value="志愿服务学时" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间" prop="eventTime">
          <el-date-picker
            v-model="dialog.form.eventTime"
            type="datetime"
            placeholder="请选择活动时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动地点" prop="location">
          <el-input v-model="dialog.form.location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="dialog.form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>
        <el-form-item label="报名名额" prop="quota">
          <el-input-number v-model="dialog.form.quota" :min="1" :max="5000" />
        </el-form-item>
        <el-form-item label="报名截止" prop="deadline">
          <el-date-picker
            v-model="dialog.form.deadline"
            type="datetime"
            placeholder="请选择截止时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">{{ dialog.isEdit ? '保存' : '发布' }}</el-button>
      </template>
    </el-dialog>

    <!-- 查看报名 Dialog -->
    <el-dialog v-model="registrantsDialog.visible" title="报名列表" width="700px">
      <template v-if="registrantsDialog.event">
        <p class="registrants-subtitle">
          活动：{{ registrantsDialog.event.title }} | 已报名 {{ registrantsDialog.event.registered }} 人
        </p>
        <el-table :data="registrantsDialog.list" stripe border style="width: 100%">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column prop="name" label="姓名" min-width="100" />
          <el-table-column prop="studentId" label="学号" min-width="130" />
          <el-table-column prop="className" label="班级" min-width="180" />
          <el-table-column prop="registerTime" label="报名时间" min-width="160" />
        </el-table>
      </template>
      <template #footer>
        <el-button @click="registrantsDialog.visible = false">关闭</el-button>
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
const formRef = ref(null)
let nextId = 6

const rules = {
  title: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  eventTime: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }],
  quota: [{ required: true, message: '请设置报名名额', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择报名截止时间', trigger: 'change' }],
}

// --- Mock Data ---
const eventList = ref([
  {
    id: 1,
    title: '人工智能前沿技术讲座',
    type: '学术讲座',
    eventTime: '2026-05-20 14:30',
    location: '朝阳楼301学术报告厅',
    description: '特邀四川大学计算机学院教授讲解大语言模型与多模态AI的最新进展。',
    quota: 150,
    registered: 128,
    deadline: '2026-05-19 18:00',
    status: '报名中',
  },
  {
    id: 2,
    title: '2026年校园篮球联赛',
    type: '文体活动',
    eventTime: '2026-05-25 09:00',
    location: '一期篮球场',
    description: '各学院组队参赛，决赛将于6月1日在一期体育馆进行。',
    quota: 200,
    registered: 200,
    deadline: '2026-05-20 12:00',
    status: '报名中',
  },
  {
    id: 3,
    title: '社区义务支教志愿者招募',
    type: '志愿服务',
    eventTime: '2026-06-01 08:00',
    location: '南充市顺庆区文华社区',
    description: '为社区留守儿童提供课业辅导和兴趣培养，服务时长计入志愿四川学时。',
    quota: 30,
    registered: 30,
    deadline: '2026-05-28 23:59',
    status: '已结束',
  },
  {
    id: 4,
    title: '第15届大学生程序设计竞赛',
    type: '学科竞赛',
    eventTime: '2026-06-10 13:00',
    location: '理科实验楼A区4楼机房',
    description: 'ACM赛制，3人组队，限计算机相关专业报名。优胜队伍将代表学校参加省赛。',
    quota: 60,
    registered: 45,
    deadline: '2026-06-05 17:00',
    status: '报名中',
  },
  {
    id: 5,
    title: '吉他社"夏夜之声"音乐晚会',
    type: '社团活动',
    eventTime: '2026-05-30 19:00',
    location: '一期操场草坪',
    description: '吉他社年度音乐晚会，欢迎所有热爱音乐的同学前来参与。现场有互动抽奖环节。',
    quota: 300,
    registered: 256,
    deadline: '2026-05-29 12:00',
    status: '报名中',
  },
])

const dialog = reactive({
  visible: false,
  isEdit: false,
  editId: null,
  form: {
    title: '',
    type: '',
    hoursType: '',
    eventTime: '',
    location: '',
    description: '',
    quota: 100,
    deadline: '',
  },
})

const registrantsDialog = reactive({
  visible: false,
  event: null,
  list: [],
})

function eventTypeTag(type) {
  const map = { '学术讲座': 'success', '文体活动': 'warning', '志愿服务': '', '学科竞赛': 'danger', '社团活动': 'info' }
  return map[type] || 'info'
}

function statusTagType(status) {
  const map = { '报名中': 'success', '已结束': 'info', '已取消': 'danger' }
  return map[status] || 'info'
}

function openCreateDialog() {
  dialog.isEdit = false
  dialog.editId = null
  dialog.form = {
    title: '',
    type: '',
    hoursType: '',
    eventTime: '',
    location: '',
    description: '',
    quota: 100,
    deadline: '',
  }
  dialog.visible = true
}

function openEditDialog(row) {
  dialog.isEdit = true
  dialog.editId = row.id
  dialog.form = { ...row }
  dialog.visible = true
}

function submitForm() {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (!valid) return
    if (dialog.isEdit) {
      const target = eventList.value.find((e) => e.id === dialog.editId)
      if (target) {
        Object.assign(target, dialog.form)
      }
      ElMessage.success('活动已更新（Mock）')
    } else {
      eventList.value.unshift({
        id: nextId++,
        ...dialog.form,
        registered: 0,
        status: '报名中',
      })
      ElMessage.success('活动发布成功（Mock）')
    }
    dialog.visible = false
  })
}

function handleCancel(row) {
  ElMessageBox.confirm(
    `确认取消活动「${row.title}」？已报名的同学将收到取消通知。`,
    '取消活动',
    { confirmButtonText: '确认取消', cancelButtonText: '返回', type: 'warning' }
  ).then(() => {
    row.status = '已取消'
    ElMessage.success('活动已取消（Mock）')
  })
}

function viewRegistrants(row) {
  registrantsDialog.event = row
  // Generate mock registrants based on actual count
  const mockNames = ['张明', '李华', '王芳', '赵强', '孙丽', '周杰', '吴敏', '郑伟', '冯雪', '陈龙', '刘洋', '黄玲', '马飞', '林丹', '何超']
  const mockClasses = [
    '计算机科学与技术2022级1班',
    '计算机科学与技术2022级2班',
    '软件工程2022级1班',
    '网络工程2022级1班',
    '数学与应用数学2022级1班',
    '物理学2022级1班',
    '电子信息工程2022级1班',
  ]
  const list = []
  const count = Math.min(row.registered, 15)
  for (let i = 0; i < count; i++) {
    list.push({
      name: mockNames[i] || `学生${i + 1}`,
      studentId: `2022110${String(1001 + i).slice(0, 4)}`,
      className: mockClasses[i % mockClasses.length],
      registerTime: `2026-05-${String((i % 18) + 1).padStart(2, '0')} ${String(8 + (i % 14)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    })
  }
  registrantsDialog.list = list
  registrantsDialog.visible = true
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
.event-manage-page {
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

.quota-full {
  color: #F56C6C;
  font-weight: 600;
}

.registrants-subtitle {
  font-size: 14px;
  color: #606266;
  margin: 0 0 12px;
}
</style>
