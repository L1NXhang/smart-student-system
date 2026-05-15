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
      <el-table :data="noticeList" stripe border style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type)">{{ row.type }}</el-tag>
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
            <el-option label="班级通知" value="班级通知" />
            <el-option label="年级通知" value="年级通知" />
            <el-option label="学校公告" value="学校公告" />
            <el-option label="紧急通知" value="紧急通知" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布对象" prop="target">
          <el-input v-model="dialog.form.target" placeholder="如：2022级计算机科学与技术1班" />
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
import { FadeContent, GradientText } from '@/components/react-bits'

const pageRef = ref(null)
const formRef = ref(null)
let nextId = 7

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
  target: [{ required: true, message: '请输入发布对象', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
}

// --- Mock Data ---
const noticeList = ref([
  { id: 1, title: '关于2026年五一劳动节放假安排的通知', type: '学校公告', target: '全体学生', content: '根据学校安排，劳动节放假时间为5月1日至5月5日，共5天。4月27日（周日）补5月5日（周一）的课。', publishTime: '2026-04-25 10:30' },
  { id: 2, title: '关于计算机科学与技术专业期中教学检查的通知', type: '班级通知', target: '2022级计算机科学与技术1-3班', content: '接教务处通知，学院将于5月15日-20日开展期中教学检查，请各班班长组织同学认真准备。', publishTime: '2026-05-10 14:20' },
  { id: 3, title: '关于2026届毕业生图像采集的通知', type: '年级通知', target: '2022级全体学生', content: '根据省教育厅要求，2026届毕业生图像采集工作将于6月1日在图书馆一楼报告厅进行。', publishTime: '2026-05-08 09:00' },
  { id: 4, title: '【紧急】关于校园网络维护暂停服务的通知', type: '紧急通知', target: '全体学生', content: '因校园网核心设备故障，信息中心将于5月13日22:00至次日6:00进行紧急维护，届时校园网将暂停服务。', publishTime: '2026-05-12 20:00' },
  { id: 5, title: '关于开展"学风建设月"系列活动的通知', type: '年级通知', target: '2022级全体学生', content: '为进一步加强学风建设，营造浓厚的学习氛围，学院决定于5月开展"学风建设月"系列活动。', publishTime: '2026-05-05 16:45' },
  { id: 6, title: '关于2026年春季学期期末考试安排的通知', type: '学校公告', target: '全体学生', content: '2026年春季学期期末考试将于6月23日至7月4日进行，具体考试安排请登录教务系统查询。', publishTime: '2026-05-03 11:15' },
])

const dialog = reactive({
  visible: false,
  isEdit: false,
  editId: null,
  form: {
    title: '',
    type: '',
    target: '',
    content: '',
  },
})

function typeTagType(type) {
  const map = { '学校公告': '', '班级通知': 'success', '年级通知': 'info', '紧急通知': 'danger' }
  return map[type] || 'info'
}

function openCreateDialog() {
  dialog.isEdit = false
  dialog.editId = null
  dialog.form = { title: '', type: '', target: '', content: '' }
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
      const target = noticeList.value.find((n) => n.id === dialog.editId)
      if (target) {
        Object.assign(target, dialog.form)
        target.publishTime = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-')
      }
      ElMessage.success('公告已更新（Mock）')
    } else {
      noticeList.value.unshift({
        id: nextId++,
        ...dialog.form,
        publishTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
      })
      ElMessage.success('公告发布成功（Mock）')
    }
    dialog.visible = false
  })
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除公告「${row.title}」？删除后不可恢复。`, '提示', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    noticeList.value = noticeList.value.filter((n) => n.id !== row.id)
    ElMessage.success('公告已删除（Mock）')
  })
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
    gsap.from('.el-table__row', {
      y: 20,
      autoAlpha: 0,
      duration: 0.4,
      stagger: 0.08,
      ease: 'power2.out',
      delay: 0.3,
    })
  }, pageRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<style scoped>
.notice-manage-page {
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
</style>
