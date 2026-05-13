<template>
  <div class="page">
    <div class="page-header"><h2>晚归登记</h2></div>
    <el-card>
      <el-form :model="form" label-width="120px">
        <el-form-item label="晚归日期">
          <el-date-picker v-model="form.returnDate" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="预计返回时间">
          <el-time-picker v-model="form.expectedTime" placeholder="选择时间" format="HH:mm" />
        </el-form-item>
        <el-form-item label="晚归原因">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="submit">提交登记</el-button></el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top:16px" header="登记记录">
      <el-table :data="records" stripe>
        <el-table-column prop="returnDate" label="日期" />
        <el-table-column prop="expectedTime" label="预计返回" />
        <el-table-column prop="reason" label="原因" />
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
import { submitLateReturn, getLateReturnRecords } from '@/api/safety'

const form = ref({ returnDate: '', expectedTime: '', reason: '' })
const records = ref([])

onMounted(async () => {
  try { const res = await getLateReturnRecords(); records.value = res.data || [] } catch {}
})

async function submit() {
  await submitLateReturn({
    returnDate: form.value.returnDate,
    expectedTime: form.value.expectedTime,
    reason: form.value.reason,
  })
  ElMessage.success('晚归登记已提交')
}
</script>
