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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import gsap from 'gsap'
import { FadeContent, GradientText } from '@/components/react-bits'
import { getEvents, createEvent, updateEvent, deleteEvent, getEventRegistrations } from '@/api/message'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const pageRef = ref(null)
const formRef = ref(null)
const loading = ref(false)

const rules = {
  title: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  eventTime: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }],
  quota: [{ required: true, message: '请设置报名名额', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择报名截止时间', trigger: 'change' }],
}

const eventList = ref([])
const canPublish = computed(() => userStore.isAdmin || userStore.isDepartmentHead)

async function fetchEvents() {
  loading.value = true
  try {
    const res = await getEvents({ page: 1, pageSize: 50 })
    eventList.value = (res.data?.list || res.list || []).map(e => ({
      id: e.id,
      title: e.title,
      type: e.event_type === 'academic' ? '学术讲座' : e.event_type === 'sports' ? '文体活动' : e.event_type === 'volunteer' ? '志愿服务' : e.event_type === 'culture' ? '社团活动' : '其他',
      hoursType: e.hours_type || '',
      eventTime: e.event_date || '',
      location: e.location || '',
      description: e.description || '',
      quota: e.quota || 0,
      registered: e.registrationCount || 0,
      deadline: e.deadline || '',
      status: e.status === 0 ? '已取消' : '报名中',
    }))
  } catch (e) {
    ElMessage.error('加载活动列表失败')
  } finally { loading.value = false }
}

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

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate()
  const f = dialog.form
  const data = {
    title: f.title,
    eventType: f.type === '学术讲座' ? 'academic' : f.type === '文体活动' ? 'sports' : f.type === '志愿服务' ? 'volunteer' : f.type === '学科竞赛' ? 'academic' : f.type === '社团活动' ? 'culture' : f.type,
    hoursType: f.hoursType || null,
    eventDate: f.eventTime,
    location: f.location,
    description: f.description,
    quota: f.quota,
    deadline: f.deadline,
  }
  try {
    if (dialog.isEdit) {
      await updateEvent(dialog.editId, data)
      ElMessage.success('活动已更新')
    } else {
      await createEvent(data)
      ElMessage.success('活动发布成功')
    }
    dialog.visible = false
    await fetchEvents()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '操作失败')
  }
}

async function handleCancel(row) {
  try {
    await ElMessageBox.confirm(
      `确认取消活动「${row.title}」？`,
      '取消活动',
      { confirmButtonText: '确认取消', cancelButtonText: '返回', type: 'warning' }
    )
    await deleteEvent(row.id)
    ElMessage.success('活动已取消')
    await fetchEvents()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e.response?.data?.message || '取消失败')
  }
}

async function viewRegistrants(row) {
  registrantsDialog.event = row
  try {
    const res = await getEventRegistrations(row.id)
    registrantsDialog.list = (res.list || []).map(r => ({
      name: r.user?.name || r.student_name || '未知',
      studentId: r.user?.username || r.student_username || '',
      className: r.student?.className || r.student?.class_name || '',
      registerTime: r.created_at || '',
    }))
  } catch (e) {
    registrantsDialog.list = []
  }
  registrantsDialog.visible = true
}

// --- GSAP ---
let ctx
onMounted(() => {
  fetchEvents()
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
