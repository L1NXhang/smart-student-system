<template>
  <div class="safety-page">
    <div class="page-header">
      <h2>外出报备</h2>
      <p>离开校园外出时，请提前在此提交外出报备申请</p>
    </div>

    <el-card class="form-card">
      <template #header>
        <span class="card-header-title">提交外出报备</span>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="submit"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="外出日期" prop="leaveDate">
              <el-date-picker
                v-model="form.leaveDate"
                type="date"
                placeholder="选择外出日期"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目的地" prop="destination">
              <el-input v-model="form.destination" placeholder="请输入目的地" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="预计返回时间" prop="expectedReturn">
          <el-date-picker
            v-model="form.expectedReturn"
            type="datetime"
            placeholder="选择预计返回时间"
            :disabled-date="disabledReturnDate"
            style="width: 380px"
          />
        </el-form-item>

        <el-form-item label="外出事由" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明外出事由（不少于10字）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submit" :loading="submitting">
            提交报备
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <template #header>
        <span class="card-header-title">报备记录</span>
        <el-button text type="primary" @click="fetchRecords" :loading="loading">
          刷新
        </el-button>
      </template>

      <el-table :data="records" stripe v-loading="loading" empty-text="暂无外出报备记录">
        <el-table-column prop="leave_date" label="外出日期" width="120" />
        <el-table-column prop="destination" label="目的地" width="140" />
        <el-table-column prop="reason" label="外出事由" min-width="160" show-overflow-tooltip />
        <el-table-column prop="expected_return" label="预计返回" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="statusTag(row.status)"
              size="small"
            >
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="review_comment" label="审核意见" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.review_comment || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="160">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-popconfirm
              v-if="row.status === 'pending'"
              title="确定取消该报备？"
              @confirm="handleCancel(row.id)"
            >
              <template #reference>
                <el-button type="danger" link size="small">取消</el-button>
              </template>
            </el-popconfirm>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { submitLeave, getLeaveRecords, cancelLeave } from '@/api/safety'
import { FadeContent, GradientText } from '@/components/react-bits'

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const records = ref([])

const form = reactive({
  leaveDate: '',
  destination: '',
  reason: '',
  expectedReturn: '',
})

const rules = {
  leaveDate: [{ required: true, message: '请选择外出日期', trigger: 'change' }],
  destination: [{ required: true, message: '请输入目的地', trigger: 'blur' }],
  reason: [
    { required: true, message: '请填写外出事由', trigger: 'blur' },
    { min: 10, message: '外出事由不少于10字', trigger: 'blur' },
  ],
  expectedReturn: [{ required: true, message: '请选择预计返回时间', trigger: 'change' }],
}

function disabledDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
}

function disabledReturnDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
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
    const res = await getLeaveRecords()
    records.value = res.data || []
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
    await submitLeave({
      leaveDate: form.leaveDate,
      destination: form.destination,
      reason: form.reason,
      expectedReturn: form.expectedReturn,
    })
    ElMessage.success('外出报备已提交')
    resetForm()
    await fetchRecords()
  } catch {
    /* handled by interceptor */
  } finally {
    submitting.value = false
  }
}

async function handleCancel(id) {
  try {
    await cancelLeave(id)
    ElMessage.success('已取消')
    await fetchRecords()
  } catch {
    /* handled by interceptor */
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
.safety-page {
  max-width: 960px;
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
