<template>
  <div class="scholarship-apply-page">
    <div class="page-header">
      <div class="header-left">
        <el-button text @click="$router.push('/scholarship')">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <h2>奖学金申请</h2>
        <p>请如实填写以下申请信息，带 * 为必填项。提交后将由管理员审核。</p>
      </div>
    </div>

    <div class="form-wrapper" v-loading="loading">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px" size="default">
        <!-- ===== 奖学金类型 ===== -->
        <h3 class="section-title">申请类型</h3>
        <el-form-item label="奖学金类型" prop="scholarshipType">
          <el-select v-model="form.scholarshipType" placeholder="请选择" style="width: 320px">
            <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value">
              <span>{{ t.label }}</span>
              <span class="option-desc">{{ t.desc }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- ===== 基本信息（自动填充）===== -->
        <h3 class="section-title">基本信息</h3>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="姓名"><el-input :value="profile.name" disabled /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号"><el-input :value="profile.username" disabled /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学院"><el-input :value="profile.college" disabled /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业"><el-input :value="profile.major" disabled /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年级"><el-input :value="profile.grade" disabled /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级"><el-input :value="profile.className" disabled /></el-form-item>
          </el-col>
        </el-row>

        <!-- ===== 学业成绩 ===== -->
        <h3 class="section-title">学业成绩</h3>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="GPA" prop="gpa">
              <el-input-number v-model="form.gpa" :precision="2" :step="0.1" :min="0" :max="5" style="width:200px" placeholder="如 3.50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业排名" prop="ranking">
              <el-input v-model="form.ranking" placeholder="如 5/60" style="width:200px" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- ===== 获奖情况 ===== -->
        <h3 class="section-title">获奖情况</h3>
        <div class="awards-section">
          <div v-for="(award, i) in form.awardsList" :key="i" class="award-row">
            <el-input v-model="award.name" placeholder="获奖名称" style="width:220px" />
            <el-input v-model="award.level" placeholder="级别（国家级/省级/校级）" style="width:180px" />
            <el-date-picker v-model="award.date" type="date" placeholder="获奖日期" style="width:160px" />
            <el-button type="danger" circle :icon="Delete" size="small" @click="form.awardsList.splice(i,1)" />
          </div>
          <el-button type="primary" plain @click="form.awardsList.push({name:'',level:'',date:''})">
            <el-icon><Plus /></el-icon> 添加获奖记录
          </el-button>
        </div>

        <!-- ===== 操行分 ===== -->
        <h3 class="section-title">操行分 <span class="section-hint">（请根据官方文件如实填写各类加分项）</span></h3>
        <el-table :data="form.conductItems" stripe size="small" class="conduct-table">
          <el-table-column label="类别" width="130">
            <template #default="{ row }">
              <el-select v-model="row.category" placeholder="选择" size="small">
                <el-option v-for="c in conductCategories" :key="c" :label="c" :value="c" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="加分项目" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.item" placeholder="加分项描述" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="申请分值" width="110">
            <template #default="{ row }">
              <el-input-number v-model="row.score" :min="0" :max="50" :precision="1" size="small" style="width:90px" />
            </template>
          </el-table-column>
          <el-table-column label="依据" min-width="160">
            <template #default="{ row }">
              <el-input v-model="row.basis" placeholder="依据文件条款" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60">
            <template #default="{ $index }">
              <el-button type="danger" :icon="Delete" circle size="small" @click="form.conductItems.splice($index,1)" />
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" plain style="margin-top:8px" @click="form.conductItems.push({category:'',item:'',score:0,basis:''})">
          <el-icon><Plus /></el-icon> 添加操行分项目
        </el-button>
        <div class="conduct-total" v-if="totalConductScore">
          操行分合计：<strong>{{ totalConductScore }} 分</strong>
        </div>

        <!-- ===== 申请理由 ===== -->
        <h3 class="section-title">申请理由</h3>
        <el-form-item prop="reason" label-width="0">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="6"
            placeholder="请从思想品德、学业成绩、社会实践、创新能力等方面详细阐述申请理由（不少于50字）"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <!-- ===== 证明材料 ===== -->
        <h3 class="section-title">证明材料</h3>
        <el-form-item label-width="0">
          <el-upload
            v-model:file-list="form.materials"
            list-type="picture-card"
            multiple
            :auto-upload="false"
            :limit="9"
            accept="image/*,.pdf"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <template #extra>
            <span class="upload-tip">支持 jpg / png / pdf，最多9张。请上传成绩单、获奖证书、操行分证明材料等。</span>
          </template>
        </el-form-item>

        <!-- ===== 提交 ===== -->
        <div class="form-actions">
          <el-button size="large" @click="$router.push('/scholarship')">取消</el-button>
          <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
            提交申请
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Delete } from '@element-plus/icons-vue'
import { applyScholarship } from '@/api/scholarship'
import { getStudentInfo } from '@/api/student'
import { FadeContent, GradientText } from '@/components/react-bits'

const formRef = ref(null)
const submitting = ref(false)
const loading = ref(true)

const profile = reactive({
  name: '', username: '', college: '', major: '', grade: '', className: '',
})

const typeOptions = [
  { value: '国家奖学金', label: '国家奖学金', desc: '8000元/年' },
  { value: '国家励志奖学金', label: '国家励志奖学金', desc: '5000元/年' },
  { value: '校级一等奖学金', label: '校级一等奖学金', desc: '2000元/年' },
  { value: '校级二等奖学金', label: '校级二等奖学金', desc: '1500元/年' },
  { value: '校级三等奖学金', label: '校级三等奖学金', desc: '1000元/年' },
]

const conductCategories = ['文体活动', '思想素质', '技能特长', '志愿服务', '学术竞赛', '社会实践', '其他']

const form = reactive({
  scholarshipType: '',
  gpa: null,
  ranking: '',
  awardsList: [],
  conductItems: [],
  reason: '',
  materials: [],
})

const rules = {
  scholarshipType: [{ required: true, message: '请选择奖学金类型', trigger: 'change' }],
  gpa: [{ required: true, message: '请填写GPA', trigger: 'blur' }],
  ranking: [{ required: true, message: '请填写专业排名', trigger: 'blur' }],
  reason: [
    { required: true, message: '请填写申请理由', trigger: 'blur' },
    { min: 50, message: '申请理由不少于50字', trigger: 'blur' },
  ],
}

const totalConductScore = computed(() => {
  return form.conductItems.reduce((sum, item) => sum + (parseFloat(item.score) || 0), 0).toFixed(1)
})

onMounted(async () => {
  try {
    const res = await getStudentInfo()
    const data = res.data
    Object.assign(profile, {
      name: data.user?.name || data.name || '',
      username: data.user?.username || data.username || '',
      college: data.college || '',
      major: data.major || '',
      grade: data.grade || '',
      className: data.className || data.class_name || '',
    })
  } catch { /* handled */ }
  finally { loading.value = false }
})

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await applyScholarship({
      scholarshipType: form.scholarshipType,
      reason: form.reason,
      materials: form.materials.map(f => f.url || f.name),
      gpa: form.gpa,
      ranking: form.ranking,
      awardsSummary: JSON.stringify(form.awardsList.filter(a => a.name)),
      conductScore: parseFloat(totalConductScore.value) || 0,
      conductScoreDetail: form.conductItems.filter(c => c.item && c.score),
      templateData: {
        awardsList: form.awardsList.filter(a => a.name),
        conductItems: form.conductItems.filter(c => c.item && c.score),
      },
    })
    ElMessage.success('奖学金申请已提交，请等待审核')
    setTimeout(() => window.history.back(), 800)
  } catch { /* handled by interceptor */ }
  finally { submitting.value = false }
}
</script>

<style scoped>
.scholarship-apply-page {
  max-width: 900px;
}

.header-left h2 { margin: 8px 0 6px; font-size: 20px; }
.header-left p { margin: 0; color: #909399; font-size: 14px; }

.form-wrapper {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 28px 0 16px;
  padding-left: 12px;
  border-left: 3px solid var(--el-color-primary);
}
.section-title:first-child { margin-top: 0; }

.section-hint {
  font-weight: 400;
  font-size: 13px;
  color: #909399;
}

.option-desc {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.awards-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}
.award-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.conduct-table {
  margin-bottom: 4px;
}

.conduct-total {
  margin-top: 12px;
  font-size: 16px;
  text-align: right;
  padding: 8px 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 6px;
}
.conduct-total strong {
  color: var(--el-color-primary);
  font-size: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}
</style>
