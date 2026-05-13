<template>
  <div class="page">
    <div class="page-header"><h2>外出报备</h2></div>
    <el-card>
      <el-form :model="form" label-width="120px">
        <el-form-item label="外出日期">
          <el-date-picker v-model="form.leaveDate" type="date" />
        </el-form-item>
        <el-form-item label="目的地">
          <el-input v-model="form.destination" />
        </el-form-item>
        <el-form-item label="外出事由">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="预计返回">
          <el-date-picker v-model="form.expectedReturn" type="datetime" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="submit">提交报备</el-button></el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:16px" header="报备记录">
      <el-table :data="records" stripe>
        <el-table-column prop="leaveDate" label="日期" />
        <el-table-column prop="destination" label="目的地" />
        <el-table-column prop="reason" label="事由" />
        <el-table-column prop="expectedReturn" label="预计返回" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'">
              {{ row.status === 'approved' ? '已通过' : row.status === 'pending' ? '待审核' : '已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { submitLeave, getLeaveRecords } from '@/api/safety'

const form = ref({ leaveDate: '', destination: '', reason: '', expectedReturn: '' })
const records = ref([])

onMounted(async () => {
  try { const res = await getLeaveRecords(); records.value = res.data || [] } catch {}
})

async function submit() {
  await submitLeave({
    leaveDate: form.value.leaveDate,
    destination: form.value.destination,
    reason: form.value.reason,
    expectedReturn: form.value.expectedReturn,
  })
  ElMessage.success('外出报备已提交')
}
</script>
