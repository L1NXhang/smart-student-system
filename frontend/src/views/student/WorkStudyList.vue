<template>
  <div class="work-study-page">
    <div class="page-header">
      <h2>勤工助学</h2>
      <p>浏览校内勤工助学岗位并投递申请</p>
    </div>

    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索岗位名称"
        clearable
        :prefix-icon="Search"
        @input="onSearch"
      />
    </div>

    <el-table
      v-if="filteredList.length"
      :data="filteredList"
      stripe
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="title" label="岗位名称" min-width="160" />
      <el-table-column prop="workTime" label="工作时间" min-width="140" />
      <el-table-column prop="salary" label="薪酬" width="120" />
      <el-table-column prop="quota" label="招聘人数" width="100" />
      <el-table-column prop="deadline" label="截止时间" width="130" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDetail(row)">查看详情</el-button>
        </template>
      </el-table-column>
      <template #append>
        <tr ref="rowRefs" v-for="(_, idx) in filteredList.length" :key="'gsap-' + idx" style="display: none" />
      </template>
    </el-table>

    <el-empty v-else description="暂无岗位" />

    <!-- 岗位详情弹窗 -->
    <el-dialog v-model="showDetail" :title="current?.title || '岗位详情'" width="560px">
      <template v-if="current">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="岗位名称">{{ current.title }}</el-descriptions-item>
          <el-descriptions-item label="工作地点">{{ current.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工作时间">{{ current.workTime }}</el-descriptions-item>
          <el-descriptions-item label="薪酬">{{ current.salary }}</el-descriptions-item>
          <el-descriptions-item label="招聘人数">{{ current.quota }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ current.deadline }}</el-descriptions-item>
          <el-descriptions-item label="岗位描述" :span="2">{{ current.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="岗位要求" :span="2">{{ current.requirements || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="apply-section">
          <el-button type="primary" @click="showApplyForm = !showApplyForm">
            {{ showApplyForm ? '取消申请' : '投递申请' }}
          </el-button>
          <div v-if="showApplyForm" class="apply-form" ref="applyFormRef">
            <el-input
              v-model="applyReason"
              type="textarea"
              :rows="4"
              placeholder="请填写申请理由（不少于50字）"
              maxlength="500"
              show-word-limit
            />
            <el-button type="success" class="submit-btn" @click="submitApply" :loading="applying">
              提交申请
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getWorkStudyPositions, getWorkStudyPosition, applyWorkStudy } from '@/api/scholarship'
import gsap from 'gsap'
import { FadeContent, GradientText } from '@/components/react-bits'

const keyword = ref('')
const loading = ref(false)
const positions = ref([])
const rowRefs = ref([])

const filteredList = computed(() => {
  if (!keyword.value) return positions.value
  const kw = keyword.value.toLowerCase()
  return positions.value.filter((p) => p.title?.toLowerCase().includes(kw))
})

const showDetail = ref(false)
const current = ref(null)
const showApplyForm = ref(false)
const applyReason = ref('')
const applying = ref(false)
const applyFormRef = ref(null)

onMounted(async () => {
  try {
    loading.value = true
    const res = await getWorkStudyPositions()
    positions.value = res.data?.list || res.data || []
  } catch {
    /* handled by interceptor */
  } finally {
    loading.value = false
  }
  animateTable()
})

function onSearch() {
  // filteredList is computed, but we re-trigger GSAP after filtering
  setTimeout(() => animateTable(), 0)
}

function animateTable() {
  gsap.fromTo(
    '.el-table__body-wrapper tbody tr',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
  )
}

async function openDetail(row) {
  try {
    loading.value = true
    // Fetch full detail if available; fall back to row data
    const res = await getWorkStudyPosition(row.id)
    current.value = res.data || row
  } catch {
    current.value = row
  } finally {
    loading.value = false
  }
  showDetail.value = true
  showApplyForm.value = false
  applyReason.value = ''
}

async function submitApply() {
  if (!applyReason.value || applyReason.value.length < 10) {
    ElMessage.warning('请填写至少10字的申请理由')
    return
  }
  try {
    applying.value = true
    await applyWorkStudy({ positionId: current.value.id, reason: applyReason.value })
    ElMessage.success('申请已提交')
    showApplyForm.value = false
    applyReason.value = ''
  } catch {
    /* handled by interceptor */
  } finally {
    applying.value = false
  }
}
</script>

<style scoped>
.work-study-page {
  max-width: 1100px;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 360px;
}

.apply-section {
  margin-top: 20px;
}

.apply-form {
  margin-top: 12px;
}

.submit-btn {
  margin-top: 12px;
}
</style>
