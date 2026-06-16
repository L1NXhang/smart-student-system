<template>
  <div class="profile-page">
    <Reveal>
      <div class="page-header">
        <h2>
          <GradientText from="#409EFF" to="#67C23A">个人信息</GradientText>
        </h2>
        <p>查看和编辑您的个人档案，关键字段修改需管理员审核</p>
      </div>
    </Reveal>

    <div class="profile-body" v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="130px"
        label-position="right"
        :disabled="!editing"
        class="profile-form"
      >
        <!-- 照片区域 -->
        <div class="photo-section">
          <div class="photo-wrapper">
            <el-avatar :size="120" :src="form.photo" shape="square" class="id-photo">
              <el-icon :size="40"><UserFilled /></el-icon>
            </el-avatar>
            <el-upload
              v-if="editing"
              :show-file-list="false"
              :before-upload="handlePhotoUpload"
              accept="image/jpeg,image/png"
              class="photo-upload"
            >
              <el-button type="primary" plain size="small">更换照片</el-button>
            </el-upload>
            <span class="photo-hint">证件照（一寸/二寸）</span>
          </div>
        </div>

        <el-divider />

        <!-- 基础信息 -->
        <h3 class="section-title">基础信息</h3>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="姓名">
              <el-input :value="form.name" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="学号">
              <el-input :value="form.username" disabled />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系方式" prop="phone">
              <el-input v-model="form.phone" :disabled="!editing" placeholder="手机号码" />
              <el-tag v-if="!editing && form.phone" size="small" type="warning" class="review-badge">修改需审核</el-tag>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" :disabled="!editing" placeholder="电子邮箱" />
              <el-tag v-if="!editing && form.email" size="small" type="warning" class="review-badge">修改需审核</el-tag>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" :disabled="!editing" placeholder="18位身份证号" />
              <el-tag v-if="!editing && form.idCard" size="small" type="warning" class="review-badge">修改需审核</el-tag>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider />

        <!-- 学籍信息 -->
        <h3 class="section-title">学籍信息</h3>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="学院">
              <el-input v-model="form.college" :disabled="!editing" />
              <el-tag v-if="!editing && form.college" size="small" type="warning" class="review-badge">修改需审核</el-tag>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="专业">
              <el-input v-model="form.major" :disabled="!editing" />
              <el-tag v-if="!editing && form.major" size="small" type="warning" class="review-badge">修改需审核</el-tag>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="年级">
              <el-input v-model="form.grade" :disabled="!editing" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="班级">
              <el-input v-model="form.className" :disabled="!editing" />
              <el-tag v-if="!editing && form.className" size="small" type="warning" class="review-badge">修改需审核</el-tag>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="校区">
              <el-input v-model="form.campus" :disabled="!editing" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="宿舍号">
              <el-input v-model="form.dormitory" :disabled="!editing" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="校外住宿地址">
              <el-input v-model="form.offCampusAddress" :disabled="!editing" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider />

        <!-- 个人特质 -->
        <h3 class="section-title">个人特质</h3>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="病史">
              <el-input v-model="form.medicalHistory" :disabled="!editing" type="textarea" :rows="2" placeholder="如有请填写" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="爱好">
              <el-input v-model="form.hobbies" :disabled="!editing" type="textarea" :rows="2" placeholder="个人爱好" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="性格特征">
              <el-input v-model="form.personality" :disabled="!editing" type="textarea" :rows="2" placeholder="性格描述" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="职业目标">
              <el-input v-model="form.careerGoal" :disabled="!editing" type="textarea" :rows="2" placeholder="职业规划目标" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider />

        <!-- 联系信息 -->
        <h3 class="section-title">联系信息</h3>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="班主任">
              <el-input v-model="form.classTeacher" :disabled="!editing" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="班主任联系方式">
              <el-input v-model="form.classTeacherPhone" :disabled="!editing" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider />

        <!-- 家庭情况 -->
        <h3 class="section-title">家庭情况</h3>
        <div class="family-section">
          <div v-for="(m, i) in form.familyMembers" :key="'fam'+i" class="family-row">
            <el-row :gutter="12">
              <el-col :xs="24" :sm="6">
                <el-form-item :label="'关系'">
                  <el-input v-model="m.relation" :disabled="!editing" placeholder="如：父亲" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item :label="'姓名'">
                  <el-input v-model="m.name" :disabled="!editing" placeholder="姓名" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item :label="'联系电话'">
                  <el-input v-model="m.phone" :disabled="!editing" placeholder="手机号码" />
                </el-form-item>
              </el-col>
              <el-col v-if="editing" :xs="2" :sm="2" style="display:flex;align-items:center;justify-content:center">
                <el-button type="danger" :icon="Delete" circle size="small" @click="removeFamilyMember(i)" />
              </el-col>
            </el-row>
          </div>
          <el-button v-if="editing" type="primary" plain size="small" @click="addFamilyMember" style="margin-top:8px">
            <el-icon><Plus /></el-icon> 添加家庭成员
          </el-button>
          <span v-if="!form.familyMembers.length && !editing" style="color:#c0c4cc;font-size:13px">暂无家庭信息</span>
        </div>

        <el-divider />

        <!-- 紧急联系人 -->
        <h3 class="section-title">紧急联系人（不少于2位）</h3>
        <div class="family-section">
          <div v-for="(c, i) in form.emergencyContacts" :key="'em'+i" class="family-row">
            <el-row :gutter="12">
              <el-col :xs="24" :sm="6">
                <el-form-item :label="'关系'">
                  <el-input v-model="c.relation" :disabled="!editing" placeholder="如：母亲" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item :label="'姓名'">
                  <el-input v-model="c.name" :disabled="!editing" placeholder="姓名" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item :label="'联系电话'">
                  <el-input v-model="c.phone" :disabled="!editing" placeholder="手机号码" />
                </el-form-item>
              </el-col>
              <el-col v-if="editing" :xs="2" :sm="2" style="display:flex;align-items:center;justify-content:center">
                <el-button type="danger" :icon="Delete" circle size="small" @click="removeEmergContact(i)" />
              </el-col>
            </el-row>
          </div>
          <el-button v-if="editing" type="primary" plain size="small" @click="addEmergContact" style="margin-top:8px">
            <el-icon><Plus /></el-icon> 添加紧急联系人
          </el-button>
          <span v-if="!form.emergencyContacts.length && !editing" style="color:#c0c4cc;font-size:13px">暂无紧急联系人，请及时补充</span>
        </div>

        <el-divider />

        <!-- 特殊信息 -->
        <h3 class="section-title">特殊信息</h3>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="困难认定等级">
              <el-tag v-if="form.difficultyLevel" :type="difficultyTag(form.difficultyLevel)">
                {{ form.difficultyLevel }}
              </el-tag>
              <span v-else>未申请</span>
              <el-button
                v-if="!form.difficultyLevel"
                type="warning"
                size="small"
                style="margin-left: 12px"
                @click="showDifficultyForm = true"
              >
                申请困难认定
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" v-if="form.difficultyMaterial">
            <el-form-item label="证明材料">
              <el-link type="primary" :href="form.difficultyMaterial" target="_blank">查看材料</el-link>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <div class="form-actions" v-if="!editing">
          <el-button type="primary" size="large" @click="startEdit">编辑信息</el-button>
          <el-button size="large" @click="handleExport">导出个人信息</el-button>
        </div>
        <div class="form-actions" v-else>
          <el-button size="large" @click="cancelEdit">取消</el-button>
          <el-button type="primary" size="large" @click="submitAll" :loading="submitting">
            提交修改
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 困难认定弹窗 -->
    <el-dialog v-model="showDifficultyForm" title="困难认定申请" width="500px">
      <el-form :model="diffForm" label-width="100px">
        <el-form-item label="认定等级">
          <el-select v-model="diffForm.level" style="width:100%">
            <el-option label="一般困难" value="一般困难" />
            <el-option label="比较困难" value="比较困难" />
            <el-option label="特别困难" value="特别困难" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请理由">
          <el-input v-model="diffForm.reason" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="证明材料">
          <el-upload
            :auto-upload="false"
            :limit="3"
            list-type="picture"
            v-model:file-list="diffForm.files"
          >
            <el-button type="primary" plain>选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDifficultyForm = false">取消</el-button>
        <el-button type="primary" @click="submitDifficulty" :loading="diffSubmitting">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, Plus, Delete } from '@element-plus/icons-vue'
import { Reveal, GradientText } from '@/components/react-bits'
import {
  getStudentInfo, uploadPhoto, batchSubmitInfoChange,
  updateStudentInfo, submitDifficultyApplication,
  saveFamilyInfo, saveEmergencyContacts, exportStudentInfo,
} from '@/api/student'

const formRef = ref(null)
const loading = ref(true)
const editing = ref(false)
const submitting = ref(false)

const originalForm = ref({})

const form = reactive({
  name: '',
  username: '',
  photo: '',
  phone: '',
  email: '',
  idCard: '',
  college: '',
  major: '',
  grade: '',
  className: '',
  campus: '',
  dormitory: '',
  offCampusAddress: '',
  medicalHistory: '',
  hobbies: '',
  personality: '',
  careerGoal: '',
  classTeacher: '',
  classTeacherPhone: '',
  difficultyLevel: '',
  difficultyMaterial: '',
  familyMembers: [],
  emergencyContacts: [],
})

const rules = {
  phone: [{ pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
  idCard: [
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' },
  ],
}

const showDifficultyForm = ref(false)
const diffSubmitting = ref(false)
const diffForm = reactive({ level: '', reason: '', files: [] })

const reviewFields = ['phone', 'email', 'idCard', 'college', 'major', 'className', 'classTeacher', 'classTeacherPhone']

function difficultyTag(level) {
  const map = { '一般困难': 'warning', '比较困难': 'warning', '特别困难': 'danger' }
  return map[level] || 'info'
}

async function fetchInfo() {
  loading.value = true
  try {
    const res = await getStudentInfo()
    const data = res.data
    Object.assign(form, {
      name: data.user?.name || data.name || '',
      username: data.user?.username || data.username || '',
      photo: data.photo || '',
      phone: data.phone || '',
      email: data.email || '',
      idCard: data.idCard || data.id_card || '',
      college: data.college || '',
      major: data.major || '',
      grade: data.grade || '',
      className: data.className || data.class_name || '',
      campus: data.campus || '',
      dormitory: data.dormitory || '',
      offCampusAddress: data.offCampusAddress || data.off_campus_address || '',
      medicalHistory: data.medicalHistory || data.medical_history || '',
      hobbies: data.hobbies || '',
      personality: data.personality || '',
      careerGoal: data.careerGoal || data.career_goal || '',
      classTeacher: data.classTeacher || data.class_teacher || '',
      classTeacherPhone: data.classTeacherPhone || data.class_teacher_phone || '',
      difficultyLevel: data.difficultyLevel || data.difficulty_level || '',
      difficultyMaterial: data.difficultyMaterial || data.difficulty_material || '',
      familyMembers: (data.familyInfo || []).map(m => ({ ...m })),
      emergencyContacts: (data.emergencyContacts || []).map(c => ({ ...c })),
    })
    originalForm.value = { ...form, familyMembers: form.familyMembers.map(m => ({ ...m })), emergencyContacts: form.emergencyContacts.map(c => ({ ...c })) }
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
  }
}

function startEdit() {
  originalForm.value = { ...form, familyMembers: form.familyMembers.map(m => ({ ...m })), emergencyContacts: form.emergencyContacts.map(c => ({ ...c })) }
  editing.value = true
}

function cancelEdit() {
  Object.assign(form, originalForm.value)
  form.familyMembers = originalForm.value.familyMembers.map(m => ({ ...m }))
  form.emergencyContacts = originalForm.value.emergencyContacts.map(c => ({ ...c }))
  editing.value = false
}

function addFamilyMember() {
  form.familyMembers.push({ memberType: 'parent', relation: '', name: '', phone: '' })
}

function removeFamilyMember(i) {
  form.familyMembers.splice(i, 1)
}

function addEmergContact() {
  form.emergencyContacts.push({ relation: '', name: '', phone: '' })
}

function removeEmergContact(i) {
  form.emergencyContacts.splice(i, 1)
}

async function handlePhotoUpload(file) {
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('照片大小不能超过 2MB')
    return false
  }
  const fd = new FormData()
  fd.append('photo', file)
  try {
    const res = await uploadPhoto(fd)
    form.photo = res.data?.photo || ''
    ElMessage.success('照片上传成功')
  } catch {
    /* handled by interceptor */
  }
  return false
}

async function submitAll() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const changes = []
    const directUpdates = {}

    for (const key of Object.keys(form)) {
      if (['name', 'username', 'photo', 'difficultyLevel', 'difficultyMaterial', 'familyMembers', 'emergencyContacts'].includes(key)) continue
      const oldVal = originalForm.value[key]
      const newVal = form[key]
      if (newVal !== oldVal && newVal) {
        if (reviewFields.includes(key)) {
          changes.push({ fieldLabel: getFieldLabel(key), fieldName: key, oldValue: oldVal || '', newValue: newVal, reason: '学生自行修改' })
        } else {
          directUpdates[key] = newVal
        }
      }
    }

    // Save family info if changed
    const famChanged = JSON.stringify(form.familyMembers) !== JSON.stringify(originalForm.value.familyMembers)
    if (famChanged) {
      await saveFamilyInfo({ members: form.familyMembers.filter(m => m.name && m.phone) })
    }

    // Save emergency contacts if changed
    const emChanged = JSON.stringify(form.emergencyContacts) !== JSON.stringify(originalForm.value.emergencyContacts)
    if (emChanged) {
      await saveEmergencyContacts({ contacts: form.emergencyContacts.filter(c => c.name && c.phone) })
    }

    if (Object.keys(directUpdates).length) await updateStudentInfo(directUpdates)
    if (changes.length) await batchSubmitInfoChange({ changes })

    const parts = []
    if (Object.keys(directUpdates).length) parts.push(`${Object.keys(directUpdates).length} 项直接更新`)
    if (changes.length) parts.push(`${changes.length} 项需审核`)
    if (famChanged) parts.push('家庭信息已保存')
    if (emChanged) parts.push('紧急联系人已保存')
    ElMessage.success(parts.length ? parts.join('，') : '无变更')
    editing.value = false
    await fetchInfo()
  } catch {
    /* handled by interceptor */
  } finally {
    submitting.value = false
  }
}

function getFieldLabel(key) {
  const map = {
    phone: '联系方式', email: '邮箱', idCard: '身份证号', college: '学院', major: '专业',
    className: '班级', campus: '校区', dormitory: '宿舍号',
    classTeacher: '班主任', classTeacherPhone: '班主任联系方式',
  }
  return map[key] || key
}

async function submitDifficulty() {
  if (!diffForm.level || !diffForm.reason) {
    ElMessage.warning('请填写完整信息')
    return
  }
  diffSubmitting.value = true
  try {
    const fd = new FormData()
    fd.append('level', diffForm.level)
    fd.append('reason', diffForm.reason)
    diffForm.files.forEach((f) => fd.append('material', f.raw))
    await submitDifficultyApplication(fd)
    ElMessage.success('困难认定申请已提交')
    showDifficultyForm.value = false
    await fetchInfo()
  } catch {
    /* handled by interceptor */
  } finally {
    diffSubmitting.value = false
  }
}

async function handleExport() {
  try {
    const res = await exportStudentInfo()
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `学生信息_${form.name}_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchInfo()
})
</script>

<style scoped>
.profile-page { max-width: 100%; }
.profile-body {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.profile-form { max-width: 900px; }
.photo-section { display: flex; justify-content: center; margin-bottom: 8px; }
.photo-wrapper { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.id-photo { border: 2px solid var(--el-border-color); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
.photo-hint { font-size: 12px; color: var(--el-text-color-secondary); }
.photo-upload { margin-top: 4px; }
.section-title {
  font-size: 16px; font-weight: 600; color: var(--el-color-primary);
  margin: 0 0 12px 0; padding-left: 10px; border-left: 3px solid var(--el-color-primary);
}
.review-badge { margin-left: 8px; vertical-align: middle; }
.family-section { padding-left: 10px; }
.family-row { padding: 8px 0; border-bottom: 1px dashed #f0f0f0; }
.family-row:last-child { border-bottom: none; }
.form-actions {
  display: flex; justify-content: center; gap: 16px;
  margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--el-border-color-lighter);
}
@media (max-width: 768px) { .profile-body { padding: 16px; } }
</style>
