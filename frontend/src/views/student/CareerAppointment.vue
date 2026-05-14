<template>
  <div class="appointment-page">
    <div class="page-header">
      <h2>就业指导预约</h2>
      <p>预约专业就业指导老师，获取一对一的职业规划建议</p>
    </div>

    <el-card class="form-card">
      <template #header>
        <span class="card-header-title">提交预约</span>
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
            <el-form-item label="预约日期" prop="appointmentDate">
              <el-date-picker
                v-model="form.appointmentDate"
                type="date"
                placeholder="选择日期"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约时段" prop="appointmentTime">
              <el-select v-model="form.appointmentTime" placeholder="选择时段" style="width: 100%">
                <el-option label="09:00 - 10:00" value="09:00-10:00" />
                <el-option label="10:00 - 11:00" value="10:00-11:00" />
                <el-option label="14:00 - 15:00" value="14:00-15:00" />
                <el-option label="15:00 - 16:00" value="15:00-16:00" />
                <el-option label="16:00 - 17:00" value="16:00-17:00" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="咨询事由" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="4"
            placeholder="请描述你想咨询的内容（例如：职业规划、简历指导、面试技巧等，不少于10字）"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submit" :loading="submitting">
            提交预约
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <template #header>
        <span class="card-header-title">我的预约</span>
        <el-button text type="primary" @click="fetchAppointments" :loading="loading">
          刷新
        </el-button>
      </template>

      <el-table
        :data="appointments"
        stripe
        v-loading="loading"
        empty-text="暂无预约记录"
      >
        <el-table-column prop="appointment_date" label="预约日期" width="120" />
        <el-table-column prop="appointment_time" label="时段" width="140" />
        <el-table-column prop="reason" label="咨询事由" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="admin_comment" label="回复意见" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.admin_comment || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="提交时间" width="160" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-popconfirm
              v-if="row.status === 'pending'"
              title="确定取消该预约？"
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
import { createAppointment, getMyAppointments, cancelAppointment } from '@/api/career'

const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const appointments = ref([])

const form = reactive({
  appointmentDate: '',
  appointmentTime: '',
  reason: '',
})

const rules = {
  appointmentDate: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  appointmentTime: [{ required: true, message: '请选择预约时段', trigger: 'change' }],
  reason: [
    { required: true, message: '请填写咨询事由', trigger: 'blur' },
    { min: 10, message: '咨询事由不少于10字', trigger: 'blur' },
  ],
}

function disabledDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
}

function statusTag(status) {
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'info', rejected: 'danger' }
  return map[status] || 'info'
}

function statusText(status) {
  const map = { pending: '待确认', confirmed: '已确认', cancelled: '已取消', rejected: '已拒绝' }
  return map[status] || status
}

async function fetchAppointments() {
  loading.value = true
  try {
    const res = await getMyAppointments()
    appointments.value = res.data || []
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
    await createAppointment({
      appointmentDate: form.value.appointmentDate,
      appointmentTime: form.value.appointmentTime,
      reason: form.value.reason,
    })
    ElMessage.success('预约已提交，请等待确认')
    resetForm()
    await fetchAppointments()
  } catch {
    /* handled by interceptor */
  } finally {
    submitting.value = false
  }
}

async function handleCancel(id) {
  try {
    await cancelAppointment(id)
    ElMessage.success('预约已取消')
    await fetchAppointments()
  } catch {
    /* handled by interceptor */
  }
}

function resetForm() {
  formRef.value?.resetFields()
}

onMounted(() => {
  fetchAppointments()
})
</script>

<style scoped>
.appointment-page {
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
