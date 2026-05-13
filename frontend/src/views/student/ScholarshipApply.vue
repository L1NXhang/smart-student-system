<template>
  <div class="scholarship-apply-page">
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="router.push('/scholarship')">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>奖学金申请</h2>
        <p>请如实填写申请信息，带 * 为必填项</p>
      </div>
    </div>

    <div ref="formWrapperRef" class="form-wrapper">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        size="default"
      >
        <el-form-item label="奖学金类型" prop="scholarshipType">
          <el-select v-model="form.scholarshipType" placeholder="请选择奖学金类型" style="width: 100%">
            <el-option
              v-for="item in scholarshipTypeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="申请理由" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="5"
            placeholder="请详细说明申请理由（不少于20字）"
            show-word-limit
            maxlength="500"
          />
        </el-form-item>

        <el-form-item label="证明材料" prop="materials">
          <el-upload
            v-model:file-list="form.materials"
            list-type="picture-card"
            multiple
            :auto-upload="false"
            :limit="5"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <template #extra>
            <span class="upload-tip">支持 jpg/png/pdf，最多5张</span>
          </template>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            提交申请
          </el-button>
          <el-button @click="router.push('/scholarship')">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { applyScholarship } from '@/api/scholarship'
import gsap from 'gsap'

const router = useRouter()
const formRef = ref(null)
const formWrapperRef = ref(null)
const submitting = ref(false)

const scholarshipTypeOptions = [
  '国家奖学金',
  '国家励志奖学金',
  '校级一等奖学金',
  '校级二等奖学金',
  '校级三等奖学金',
]

const form = reactive({
  scholarshipType: '',
  reason: '',
  materials: [],
})

const rules = {
  scholarshipType: [
    { required: true, message: '请选择奖学金类型', trigger: 'change' },
  ],
  reason: [
    { required: true, message: '请填写申请理由', trigger: 'blur' },
    { min: 20, message: '申请理由不少于20字', trigger: 'blur' },
  ],
}

onMounted(() => {
  gsap.from(formWrapperRef.value, {
    x: 60,
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
  })
})

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('scholarshipType', form.scholarshipType)
    fd.append('reason', form.reason)
    form.materials.forEach((f) => fd.append('materials', f.raw))
    await applyScholarship(fd)
    ElMessage.success('奖学金申请已提交，请等待审核')
    router.push('/scholarship')
  } catch { /* handled by interceptor */ }
  finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.scholarship-apply-page {
  max-width: 800px;
}

.page-header {
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 8px 0 6px;
  font-size: 20px;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.form-wrapper {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}
</style>
