<template>
  <div class="safety-page">
    <div class="page-header">
      <h2>晚归登记</h2>
      <p>因突发事件需要晚归时，请在此提交登记申请</p>
    </div>

    <el-card class="form-card">
      <template #header>
        <span class="card-header-title">提交晚归申请</span>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="submit"
      >
        <el-form-item label="晚归日期" prop="returnDate">
          <el-date-picker
            v-model="form.returnDate"
            type="date"
            placeholder="选择晚归日期"
            :disabled-date="disabledDate"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item label="预计返回时间" prop="expectedTime">
          <el-time-picker
            v-model="form.expectedTime"
            placeholder="选择预计返回时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item label="晚归原因" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明晚归原因（不少于10字）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit" :loading="submitting">
            提交登记
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <template #header>
        <span class="card-header-title">登记记录</span>
        <el-button text type="primary" @click="fetchRecords" :loading="loading">
          刷新
        </el-button>
      </template>

      <el-table :data="records" stripe v-loading="loading" empty-text="暂无晚归登记记录">
        <el-table-column prop="return_date" label="晚归日期" width="120" />
        <el-table-column prop="expected_time" label="预计返回时间" width="120" />
        <el-table-column prop="reason" label="晚归原因" min-width="180" show-overflow-tooltip />
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
        <el-table-column prop="created_at" label="提交时间" width="160" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-popconfirm
              v-if="row.status === 'pending'"
              title="确定取消该登记？"
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
import { submitLateReturn, getLateReturnRecords, cancelLateReturn } from '@/api/safety'

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const records = ref([])

const form = reactive({
  returnDate: '',
  expectedTime: '',
  reason: '',
})

const rules = {
  returnDate: [{ required: true, message: '请选择晚归日期', trigger: 'change' }],
  expectedTime: [{ required: true, message: '请选择预计返回时间', trigger: 'change' }],
  reason: [
    { required: true, message: '请填写晚归原因', trigger: 'blur' },
    { min: 10, message: '晚归原因不少于10字', trigger: 'blur' },
  ],
}

function disabledDate(date) {
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

async function fetchRecords() {
  loading.value = true
  try {
    const res = await getLateReturnRecords()
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
    await submitLateReturn({
      returnDate: form.value.returnDate,
      expectedTime: form.value.expectedTime,
      reason: form.value.reason,
    })
    ElMessage.success('晚归登记已提交')
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
    await cancelLateReturn(id)
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
