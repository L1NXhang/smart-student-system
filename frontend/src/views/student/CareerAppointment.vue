<template>
  <div class="page">
    <div class="page-header"><h2>就业指导预约</h2></div>
    <el-card>
      <el-form :model="form" label-width="100px">
        <el-form-item label="预约日期">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="预约时段">
          <el-select v-model="form.time" placeholder="选择时段">
            <el-option label="09:00-10:00" value="09:00-10:00" />
            <el-option label="10:00-11:00" value="10:00-11:00" />
            <el-option label="14:00-15:00" value="14:00-15:00" />
            <el-option label="15:00-16:00" value="15:00-16:00" />
          </el-select>
        </el-form-item>
        <el-form-item label="预约事由">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="submit">提交预约</el-button></el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:16px" header="我的预约">
      <el-table :data="appointments" stripe>
        <el-table-column prop="appointmentDate" label="日期" />
        <el-table-column prop="appointmentTime" label="时段" />
        <el-table-column prop="reason" label="事由" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'confirmed' ? 'success' : 'warning'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createAppointment, getMyAppointments } from '@/api/career'

const form = ref({ date: '', time: '', reason: '' })
const appointments = ref([])

onMounted(async () => {
  try { const res = await getMyAppointments(); appointments.value = res.data || [] } catch {}
})

async function submit() {
  await createAppointment({
    appointmentDate: form.value.date,
    appointmentTime: form.value.time,
    reason: form.value.reason,
  })
  ElMessage.success('预约已提交')
}
</script>
