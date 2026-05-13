<template>
  <div class="page">
    <div class="page-header"><h2>中期鉴定</h2></div>
    <el-card v-if="!submitted">
      <el-form :model="form" label-width="120px">
        <el-form-item label="学年学期" required>
          <el-input v-model="form.semester" placeholder="如 2025-2026-1" />
        </el-form-item>
        <el-form-item label="思想品德表现">
          <el-input v-model="form.moralPerformance" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="学业情况">
          <el-input v-model="form.academicPerformance" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="社会实践">
          <el-input v-model="form.socialPractice" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="身心健康">
          <el-input v-model="form.physicalMental" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="自我评价">
          <el-input v-model="form.selfEvaluation" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="submit">提交</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-empty v-else description="鉴定已提交，等待班主任审核" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { submitMidtermEvaluation } from '@/api/academic'

const submitted = ref(false)
const form = ref({ semester: '', moralPerformance: '', academicPerformance: '', socialPractice: '', physicalMental: '', selfEvaluation: '' })

async function submit() {
  await submitMidtermEvaluation(form.value)
  ElMessage.success('提交成功')
  submitted.value = true
}
</script>
