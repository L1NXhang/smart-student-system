<template>
  <div class="awards-page">
    <div class="page-header">
      <h2>获奖记录</h2>
      <p>查看已获得的奖项荣誉，并提交获奖记录申报</p>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon> 申报获奖
      </el-button>
    </div>

    <!-- 获奖记录表格 -->
    <el-table
      v-if="awards.length"
      :data="awards"
      stripe
      v-loading="loading"
      style="margin-top: 16px"
    >
      <el-table-column prop="award_name" label="获奖名称" min-width="200" />
      <el-table-column label="获奖级别" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ levelMap[row.award_level] || row.award_level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="获奖类型" width="130">
        <template #default="{ row }">
          {{ typeMap[row.award_type] || row.award_type }}
        </template>
      </el-table-column>
      <el-table-column label="获奖日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.award_date) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">
            {{ statusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && !awards.length" description="暂无获奖记录" />

    <!-- 申报获奖弹窗 -->
    <el-dialog v-model="dialogVisible" title="申报获奖" width="540px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="获奖名称" prop="awardName">
          <el-input v-model="form.awardName" placeholder="请输入获奖名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="获奖级别" prop="awardLevel">
          <el-select v-model="form.awardLevel" placeholder="请选择获奖级别" style="width: 100%">
            <el-option
              v-for="lv in awardLevels"
              :key="lv"
              :label="lv"
              :value="lv"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="获奖类型" prop="awardType">
          <el-select v-model="form.awardType" placeholder="请选择获奖类型" style="width: 100%">
            <el-option
              v-for="tp in awardTypes"
              :key="tp"
              :label="tp"
              :value="tp"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="获奖日期" prop="awardDate">
          <el-date-picker
            v-model="form.awardDate"
            type="date"
            placeholder="选择获奖日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="证书上传">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept="image/*,.pdf"
            :on-exceed="handleExceed"
          >
            <el-button type="primary" plain>选择文件</el-button>
            <template #tip>
              <div class="upload-tip">支持 jpg / png / pdf，大小不超过 5MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAwards, submitAward } from '@/api/academic'
import gsap from 'gsap'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const uploadRef = ref(null)
const awards = ref([])

const awardLevels = ['国家级', '省级', '市级', '校级', '院级']
const awardTypes = ['学科竞赛', '创新实践', '文艺竞赛', '学术科技', '其他']

const levelMap = {
  'national': '国家级', 'provincial': '省级', 'city': '市级',
  'school': '校级', 'college': '院级',
}

const typeMap = {
  'contest': '学科竞赛', 'innovation': '创新实践', 'art': '文艺竞赛',
  'academic': '学术科技', 'other': '其他',
}

const form = reactive({
  awardName: '',
  awardLevel: '',
  awardType: '',
  awardDate: '',
})

const rules = {
  awardName: [{ required: true, message: '请输入获奖名称', trigger: 'blur' }],
  awardLevel: [{ required: true, message: '请选择获奖级别', trigger: 'change' }],
  awardType: [{ required: true, message: '请选择获奖类型', trigger: 'change' }],
  awardDate: [{ required: true, message: '请选择获奖日期', trigger: 'change' }],
}

function statusTag(status) {
  const map = { approved: 'success', pending: 'warning', rejected: 'danger' }
  return map[status] || 'info'
}

function statusText(status) {
  const map = { approved: '已通过', pending: '待审核', rejected: '已拒绝' }
  return map[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function openDialog() {
  formRef.value?.resetFields()
  form.awardName = ''
  form.awardLevel = ''
  form.awardType = ''
  form.awardDate = ''
  dialogVisible.value = true
}

function handleExceed() {
  ElMessage.warning('最多只能上传一个证书文件')
}

async function fetchAwards() {
  loading.value = true
  try {
    const res = await getAwards()
    awards.value = res.list || res.data?.list || res.data || []
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
    setTimeout(animateTable, 200)
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('awardName', form.awardName)
    fd.append('awardLevel', form.awardLevel)
    fd.append('awardType', form.awardType)
    fd.append('awardDate', form.awardDate)

    const uploadFiles = uploadRef.value?.uploadFiles || []
    if (uploadFiles.length > 0) {
      fd.append('certificate', uploadFiles[0].raw)
    }

    await submitAward(fd)
    ElMessage.success('获奖记录已提交，等待审核')
    dialogVisible.value = false
    await fetchAwards()
  } catch {
    /* handled by interceptor */
  } finally {
    submitting.value = false
  }
}

function animateTable() {
  gsap.fromTo('.el-table__body-wrapper tbody tr',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' })
}

onMounted(() => fetchAwards())
</script>

<style scoped>
.awards-page {
  max-width: 1000px;
}

.toolbar {
  margin-bottom: 0;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
