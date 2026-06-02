<template>
  <div class="notice-manage-page" ref="pageRef">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <span class="page-title">公告管理</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon style="margin-right: 4px"><Plus /></el-icon>发布公告
          </el-button>
        </div>
      </template>

      <!-- 公告列表 -->
      <el-table :data="noticeList" stripe border style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type)">{{ row.displayType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="发布对象" min-width="180" show-overflow-tooltip />
        <el-table-column prop="publishTime" label="发布时间" width="170" align="center" />
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 发布/编辑公告 Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑公告' : '发布公告'"
      width="640px"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="dialog.form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="dialog.form.type" placeholder="请选择类型" style="width: 100%">
            <el-option
              v-for="opt in typeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发布对象" prop="target">
          <el-input v-model="dialog.form.target" placeholder="如：全体学生 / 2022级计算机科学与技术1班" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="dialog.form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import gsap from 'gsap'
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/api/message'

const pageRef = ref(null)
const formRef = ref(null)
const loading = ref(false)

const typeOptions = [
  { label: '班级通知', value: 'class' },
  { label: '年级通知', value: 'grade' },
  { label: '全校公告', value: 'all' },
]

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
}

const noticeList = ref([])

async function loadNotices() {
  loading.value = true
  try {
    const res = await getAnnouncements({ pageSize: 100 })
    noticeList.value = (res.data?.list || res.data || []).map(formatNotice)
  } catch {
    ElMessage.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

function formatNotice(n) {
  const typeLabels = { class: '班级通知', grade: '年级通知', all: '全校公告' }
  return {
    ...n,
    displayType: typeLabels[n.type] || n.type,
    publishTime: n.created_at || n.createdAt,
    publisherName: n.publisher?.name || n.publisherName || '管理员',
  }
}

const dialog = reactive({
  visible: false,
  isEdit: false,
  editId: null,
  form: { title: '', type: 'all', target: '', content: '' },
})

function typeTagType(type) {
  const map = { class: '', grade: 'info', all: 'warning' }
  return map[type] || 'info'
}

function openCreateDialog() {
  dialog.isEdit = false
  dialog.editId = null
  dialog.form = { title: '', type: 'all', target: '', content: '' }
  dialog.visible = true
}

function openEditDialog(row) {
  dialog.isEdit = true
  dialog.editId = row.id
  dialog.form = { title: row.title, type: row.type, target: row.target || '', content: row.content }
  dialog.visible = true
}

async function submitForm() {
  if (!formRef.value) return
  formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (dialog.isEdit) {
        await updateAnnouncement(dialog.editId, dialog.form)
        ElMessage.success('公告已更新')
      } else {
        await createAnnouncement(dialog.form)
        ElMessage.success('公告发布成功')
      }
      dialog.visible = false
      loadNotices()
    } catch {
      ElMessage.error(dialog.isEdit ? '更新失败' : '发布失败')
    }
  })
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除公告「${row.title}」？删除后不可恢复。`, '提示', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteAnnouncement(row.id)
      ElMessage.success('公告已删除')
      loadNotices()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

let ctx
onMounted(() => {
  loadNotices()
  ctx = gsap.context(() => {
    gsap.from('.page-card', { y: 40, autoAlpha: 0, duration: 0.6, ease: 'power3.out' })
  }, pageRef.value)
})

onUnmounted(() => { ctx?.revert() })
</script>

<style scoped>
.notice-manage-page {
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
</style>
