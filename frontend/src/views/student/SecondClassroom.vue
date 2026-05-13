<template>
  <div class="page">
    <div class="page-header"><h2>第二课堂成绩单</h2></div>
    <el-card v-loading="loading">
      <div class="summary-row">
        <div class="summary-card" v-for="s in summary" :key="s.label">
          <div class="num">{{ s.value }}</div>
          <div class="lbl">{{ s.label }}</div>
        </div>
      </div>
      <el-table :data="activities" stripe style="margin-top:20px">
        <el-table-column prop="activityName" label="活动名称" />
        <el-table-column prop="activityType" label="类型" />
        <el-table-column prop="hours" label="时长(h)" />
        <el-table-column prop="points" label="学分" />
        <el-table-column prop="semester" label="学期" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSecondClassroom } from '@/api/academic'
import gsap from 'gsap'

const loading = ref(true)
const activities = ref([])
const summary = ref([])

onMounted(async () => {
  try {
    const res = await getSecondClassroom()
    activities.value = res.data.activities || []
    const s = res.data.summary
    if (s) {
      summary.value = [
        { label: '总时长(h)', value: s.totalHours },
        { label: '总学分', value: s.totalPoints },
        { label: '学术活动', value: s.academic },
        { label: '体育活动', value: s.sports },
        { label: '志愿活动', value: s.volunteer },
      ]
    }
  } catch {}
  loading.value = false
  gsap.from('.summary-card', { opacity: 0, y: 20, stagger: 0.08, duration: 0.5 })
})
</script>

<style scoped>
.summary-row { display: flex; gap: 16px; flex-wrap: wrap; }
.summary-card {
  flex: 1; min-width: 120px; text-align: center; padding: 20px;
  background: var(--color-primary-light); border-radius: 8px;
}
.summary-card .num { font-size: 28px; font-weight: 700; color: var(--color-primary); }
.summary-card .lbl { font-size: 13px; color: var(--color-info); margin-top: 4px; }
</style>
