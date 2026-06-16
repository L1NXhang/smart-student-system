<template>
  <div class="grant-page">
    <div class="page-header">
      <h2>助学金申请</h2>
      <p>请如实填写申请信息，提交后将由管理员审核。助学金用于资助家庭经济困难学生完成学业。</p>
    </div>

    <el-card class="form-card">
      <template #header>
        <span class="card-header-title">提交申请</span>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="submit"
      >
        <el-form-item label="助学金类型" prop="grantType">
          <el-select v-model="form.grantType" placeholder="请选择助学金类型" style="width: 320px">
            <el-option
              v-for="item in grantTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="申请理由" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="5"
            placeholder="请详细说明家庭经济状况及申请理由（不少于20字）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submit" :loading="submitting">
            提交申请
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <template #header>
        <span class="card-header-title">申请记录</span>
        <el-button text type="primary" @click="fetchRecords" :loading="loading">
          刷新
        </el-button>
      </template>

      <el-table :data="records" stripe v-loading="loading" empty-text="暂无申请记录">
        <el-table-column prop="grant_type" label="助学金类型" width="150" />
        <el-table-column prop="reason" label="申请理由" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="170">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getScholarshipGrants, applyScholarshipGrant } from '@/api/scholarship'
import { FadeContent, GradientText } from '@/components/react-bits'

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const records = ref([])

const grantTypeOptions = [
  { value: '国家助学金', label: '国家助学金' },
  { value: '校级助学金', label: '校级助学金' },
  { value: '社会助学金', label: '社会助学金' },
]

const form = reactive({
  grantType: '',
  reason: '',
})

const rules = {
  grantType: [{ required: true, message: '请选择助学金类型', trigger: 'change' }],
  reason: [
    { required: true, message: '请填写申请理由', trigger: 'blur' },
    { min: 20, message: '申请理由不少于20字', trigger: 'blur' },
  ],
}

function statusTag(status) {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'info' }
  return map[status] || 'info'
}

function statusText(status) {
  const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝', cancelled: '已取消' }
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
    const res = await getScholarshipGrants()
    records.value = res.list || res.data?.list || []
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
    await applyScholarshipGrant({
      grantType: form.grantType,
      reason: form.reason,
    })
    ElMessage.success('助学金申请已提交')
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
.grant-page {
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
