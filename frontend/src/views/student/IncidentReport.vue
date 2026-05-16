<template>
  <div class="incident-page">
    <div class="page-header">
      <h2>异常情况上报</h2>
      <p>发现校园安全隐患或遇到个人突发状况时，请及时在此上报，我们会尽快处理。</p>
    </div>

    <el-card class="form-card">
      <template #header>
        <span class="card-header-title">上报异常情况</span>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="submit"
      >
        <el-form-item label="上报类型" prop="reportType">
          <el-select v-model="form.reportType" placeholder="请选择上报类型" style="width: 320px">
            <el-option
              v-for="item in reportTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题（如：宿舍楼消防通道堵塞）" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="详细描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述异常情况（不少于10字）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="发生位置" prop="location">
          <el-input v-model="form.location" placeholder="如：行署楼3楼东侧楼梯间" maxlength="100" />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入您的联系电话，以便工作人员联系" maxlength="20" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submit" :loading="submitting">
            提交上报
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <template #header>
        <span class="card-header-title">上报记录</span>
        <el-button text type="primary" @click="fetchRecords" :loading="loading">
          刷新
        </el-button>
      </template>

      <el-table :data="records" stripe v-loading="loading" empty-text="暂无上报记录">
        <el-table-column prop="report_type" label="上报类型" width="140" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上报时间" width="170">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { reportIncident, getIncidents } from '@/api/safety'
import { FadeContent, GradientText } from '@/components/react-bits'

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const records = ref([])

const reportTypeOptions = [
  { value: '校园安全隐患', label: '校园安全隐患' },
  { value: '个人突发状况', label: '个人突发状况' },
  { value: '其他', label: '其他' },
]

const form = reactive({
  reportType: '',
  title: '',
  description: '',
  location: '',
  contactPhone: '',
})

const rules = {
  reportType: [{ required: true, message: '请选择上报类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  description: [
    { required: true, message: '请填写详细描述', trigger: 'blur' },
    { min: 10, message: '描述不少于10字', trigger: 'blur' },
  ],
  location: [{ required: true, message: '请输入发生位置', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
  ],
}

function statusTag(status) {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'info', processing: '' }
  return map[status] || 'info'
}

function statusText(status) {
  const map = { pending: '待处理', approved: '已处理', rejected: '已驳回', cancelled: '已取消', processing: '处理中' }
  return map[status] || status
}

function formatTime(d) {
  if (!d) return ''
  const t = new Date(d)
  const pad = n => String(n).padStart(2, '0')
  return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()) + ' ' + pad(t.getHours()) + ':' + pad(t.getMinutes())
}

async function fetchRecords() {
  loading.value = true
  try {
    const res = await getIncidents()
    records.value = Array.isArray(res) ? res : (res.data?.list || res.list || [])
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
  }
}

async function submit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await reportIncident({
      reportType: form.reportType,
      title: form.title,
      description: form.description,
      location: form.location,
      contactPhone: form.contactPhone,
      images: [],
    })
    ElMessage.success('异常情况已上报')
    resetForm()
    await fetchRecords()
  } catch {
    /* handled by interceptor */
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.incident-page {
  max-width: 900px;
}

.form-card {
  margin-bottom: 20px;
}

.list-card {
  margin-top: 20px;
}

.card-header-title {
  font-weight: 600;
}
</style>
