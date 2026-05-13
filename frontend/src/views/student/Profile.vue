<template>
  <div class="profile-page">
    <div class="page-header">
      <h2>个人信息</h2>
      <p>查看和管理您的个人档案信息</p>
    </div>

    <el-tabs v-model="activeTab" type="border-card" @tab-click="onTabClick">
      <el-tab-pane label="基础信息" name="basic">
        <div class="info-section" ref="sectionRef">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ info.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学号">{{ info.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="照片">
              <el-avatar :size="80" :src="info.photo" v-if="info.photo" />
              <span v-else>未上传</span>
            </el-descriptions-item>
            <el-descriptions-item label="联系方式">{{ info.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="身份证号" :span="2">{{ info.idCard || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" class="edit-btn" @click="openChangeDialog('basic')">申请修改</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="学籍信息" name="academic">
        <div class="info-section">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="学院">{{ info.college || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专业">{{ info.major || '-' }}</el-descriptions-item>
            <el-descriptions-item label="年级">{{ info.grade || '-' }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{ info.className || '-' }}</el-descriptions-item>
            <el-descriptions-item label="校区">{{ info.campus || '-' }}</el-descriptions-item>
            <el-descriptions-item label="宿舍号">{{ info.dormitory || '-' }}</el-descriptions-item>
            <el-descriptions-item label="校外住宿地址" :span="2">{{ info.offCampusAddress || '无' }}</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" class="edit-btn" @click="openChangeDialog('academic')">申请修改</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="个人特质" name="personal">
        <div class="info-section">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="病史">{{ info.medicalHistory || '无' }}</el-descriptions-item>
            <el-descriptions-item label="爱好">{{ info.hobbies || '-' }}</el-descriptions-item>
            <el-descriptions-item label="性格特征">{{ info.personality || '-' }}</el-descriptions-item>
            <el-descriptions-item label="职业目标">{{ info.careerGoal || '-' }}</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" class="edit-btn" @click="openChangeDialog('personal')">申请修改</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="联系信息" name="contact">
        <div class="info-section">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="班主任">{{ info.classTeacher || '-' }}</el-descriptions-item>
            <el-descriptions-item label="班主任电话">{{ info.classTeacherPhone || '-' }}</el-descriptions-item>
            <el-descriptions-item
              v-for="m in familyMembers"
              :key="m.id"
              :label="m.relation || m.memberType"
            >
              {{ m.name }} — {{ m.phone }}
            </el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" class="edit-btn" @click="openChangeDialog('contact')">申请修改</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="特殊信息" name="special">
        <div class="info-section">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="困难认定等级">
              {{ info.difficultyLevel || '未申请' }}
            </el-descriptions-item>
            <el-descriptions-item label="证明材料" v-if="info.difficultyMaterial">
              <el-link type="primary" :href="info.difficultyMaterial" target="_blank">查看材料</el-link>
            </el-descriptions-item>
          </el-descriptions>
          <el-button
            v-if="!info.difficultyLevel"
            type="warning"
            class="edit-btn"
            @click="showDifficultyForm = true"
          >
            申请困难认定
          </el-button>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 信息变更弹窗 -->
    <el-dialog v-model="showChangeDialog" title="申请信息变更" width="500px">
      <el-form :model="changeForm" label-width="100px">
        <el-form-item label="变更字段">
          <el-input :value="changeForm.fieldName" disabled />
        </el-form-item>
        <el-form-item label="原值">
          <el-input :value="changeForm.oldValue" disabled />
        </el-form-item>
        <el-form-item label="新值">
          <el-input v-model="changeForm.newValue" type="textarea" />
        </el-form-item>
        <el-form-item label="变更原因">
          <el-input v-model="changeForm.reason" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangeDialog = false">取消</el-button>
        <el-button type="primary" @click="submitChange">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- 困难认定弹窗 -->
    <el-dialog v-model="showDifficultyForm" title="困难认定申请" width="500px">
      <el-form :model="difficultyForm" label-width="100px">
        <el-form-item label="认定等级">
          <el-select v-model="difficultyForm.level" style="width:100%">
            <el-option label="一般困难" value="一般困难" />
            <el-option label="比较困难" value="比较困难" />
            <el-option label="特别困难" value="特别困难" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请理由">
          <el-input v-model="difficultyForm.reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="证明材料">
          <el-upload
            :auto-upload="false"
            :limit="3"
            list-type="picture"
            v-model:file-list="difficultyForm.files"
          >
            <el-button type="primary" plain>选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDifficultyForm = false">取消</el-button>
        <el-button type="primary" @click="submitDifficulty">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getStudentInfo, submitInfoChange, submitDifficultyApplication } from '@/api/student'
import gsap from 'gsap'

const activeTab = ref('basic')
const info = ref({})
const familyMembers = computed(() => info.value.familyInfo || [])
const sectionRef = ref(null)

const showChangeDialog = ref(false)
const changeForm = ref({ fieldName: '', oldValue: '', newValue: '', reason: '' })

const showDifficultyForm = ref(false)
const difficultyForm = ref({ level: '', reason: '', files: [] })

onMounted(async () => {
  try {
    const res = await getStudentInfo()
    info.value = res.data
  } catch { /* handled by interceptor */ }
  gsap.from('.info-section', { opacity: 0, y: 20, duration: 0.4 })
})

function onTabClick() {
  gsap.fromTo('.info-section', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 })
}

const fieldMap = {
  basic: [
    { key: 'phone', label: '联系方式' },
    { key: 'photo', label: '照片' },
    { key: 'idCard', label: '身份证号' },
  ],
  academic: [
    { key: 'college', label: '学院' },
    { key: 'major', label: '专业' },
    { key: 'className', label: '班级' },
    { key: 'campus', label: '校区' },
    { key: 'dormitory', label: '宿舍号' },
  ],
  personal: [
    { key: 'medicalHistory', label: '病史' },
    { key: 'hobbies', label: '爱好' },
    { key: 'personality', label: '性格特征' },
    { key: 'careerGoal', label: '职业目标' },
  ],
  contact: [
    { key: 'classTeacher', label: '班主任' },
    { key: 'classTeacherPhone', label: '班主任电话' },
  ],
}

function openChangeDialog(section) {
  // simplified: pick first field as demo
  const fields = fieldMap[section]
  if (!fields?.length) return
  changeForm.value = {
    fieldName: fields[0].label,
    oldValue: info.value[fields[0].key] || '',
    newValue: '',
    reason: '',
  }
  showChangeDialog.value = true
}

async function submitChange() {
  await submitInfoChange(changeForm.value)
  ElMessage.success('变更申请已提交，请等待审核')
  showChangeDialog.value = false
}

async function submitDifficulty() {
  const fd = new FormData()
  fd.append('level', difficultyForm.value.level)
  fd.append('reason', difficultyForm.value.reason)
  difficultyForm.value.files.forEach((f) => fd.append('material', f.raw))
  await submitDifficultyApplication(fd)
  ElMessage.success('困难认定申请已提交')
  showDifficultyForm.value = false
}
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
}
.info-section {
  position: relative;
  padding-bottom: 50px;
}
.edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
