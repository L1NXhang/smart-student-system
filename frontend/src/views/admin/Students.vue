<template>
  <div class="students-page">
    <div class="page-header">
      <h2>学生管理</h2>
      <p>查看和管理全校学生信息</p>
    </div>

    <!-- Filter / Search Bar -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-row">
        <el-input
          v-model="keyword"
          placeholder="搜索姓名或学号"
          clearable
          style="width: 240px"
          @input="onSearch"
        />
        <el-select
          v-model="collegeFilter"
          placeholder="筛选学院"
          clearable
          style="width: 180px"
          @change="onSearch"
        >
          <el-option
            v-for="college in colleges"
            :key="college"
            :label="college"
            :value="college"
          />
        </el-select>
      </div>
    </el-card>

    <!-- Student Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="filteredStudents"
        border
        stripe
        style="width: 100%"
        row-class-name="table-row"
        @row-click="openDetail"
      >
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="studentId" label="学号" width="140" />
        <el-table-column prop="college" label="学院" min-width="150" />
        <el-table-column prop="major" label="专业" min-width="160" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagMap[row.status]?.type" size="small">
              {{ statusTagMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="openDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="filteredStudents.length"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="showDetail" title="学生详细信息" width="640px">
      <template v-if="currentStudent">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentStudent.name }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentStudent.studentId }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentStudent.gender }}</el-descriptions-item>
          <el-descriptions-item label="民族">{{ currentStudent.ethnicity }}</el-descriptions-item>
          <el-descriptions-item label="学院">{{ currentStudent.college }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ currentStudent.major }}</el-descriptions-item>
          <el-descriptions-item label="年级">{{ currentStudent.grade }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentStudent.className }}</el-descriptions-item>
          <el-descriptions-item label="校区">{{ currentStudent.campus }}</el-descriptions-item>
          <el-descriptions-item label="宿舍号">{{ currentStudent.dormitory }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentStudent.phone }}</el-descriptions-item>
          <el-descriptions-item label="身份证号" :span="2">{{ currentStudent.idCard }}</el-descriptions-item>
          <el-descriptions-item label="班主任">{{ currentStudent.classTeacher }}</el-descriptions-item>
          <el-descriptions-item label="班主任电话">{{ currentStudent.classTeacherPhone }}</el-descriptions-item>
          <el-descriptions-item label="状态" :span="2">
            <el-tag :type="statusTagMap[currentStudent.status]?.type" size="small">
              {{ statusTagMap[currentStudent.status]?.label }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import gsap from 'gsap'

// --- Filters ---
const keyword = ref('')
const collegeFilter = ref('')
const page = ref(1)
const pageSize = ref(10)

const statusTagMap = {
  normal: { type: 'success', label: '正常' },
  pending: { type: 'warning', label: '待审核' },
  disabled: { type: 'danger', label: '禁用' },
}

// --- Mock Data ---
const students = ref([
  { id: 1, name: '张三', studentId: '20210101001', gender: '男', ethnicity: '汉族', college: '计算机科学与技术学院', major: '计算机科学与技术', grade: '2021级', className: '计科2101', campus: '南校区', dormitory: '南1-301', phone: '13800001111', idCard: '320102200201010011', classTeacher: '王老师', classTeacherPhone: '13900001111', status: 'normal' },
  { id: 2, name: '李四', studentId: '20210101002', gender: '女', ethnicity: '汉族', college: '计算机科学与技术学院', major: '软件工程', grade: '2021级', className: '软工2101', campus: '南校区', dormitory: '南2-205', phone: '13800002222', idCard: '320102200202020022', classTeacher: '赵老师', classTeacherPhone: '13900002222', status: 'normal' },
  { id: 3, name: '王五', studentId: '20210102001', gender: '男', ethnicity: '回族', college: '电子信息工程学院', major: '电子信息工程', grade: '2021级', className: '电信2101', campus: '北校区', dormitory: '北1-118', phone: '13800003333', idCard: '320102200203030033', classTeacher: '钱老师', classTeacherPhone: '13900003333', status: 'pending' },
  { id: 4, name: '赵六', studentId: '20210102002', gender: '女', ethnicity: '壮族', college: '电子信息工程学院', major: '通信工程', grade: '2021级', className: '通信2102', campus: '北校区', dormitory: '北2-302', phone: '13800004444', idCard: '320102200204040044', classTeacher: '孙老师', classTeacherPhone: '13900004444', status: 'normal' },
  { id: 5, name: '孙七', studentId: '20210201001', gender: '男', ethnicity: '汉族', college: '机械工程学院', major: '机械设计制造及其自动化', grade: '2022级', className: '机械2201', campus: '南校区', dormitory: '南3-410', phone: '13800005555', idCard: '320102200305050055', classTeacher: '周老师', classTeacherPhone: '13900005555', status: 'disabled' },
  { id: 6, name: '周八', studentId: '20210202001', gender: '女', ethnicity: '苗族', college: '经济管理学院', major: '工商管理', grade: '2022级', className: '工商2201', campus: '北校区', dormitory: '北3-215', phone: '13800006666', idCard: '320102200306060066', classTeacher: '吴老师', classTeacherPhone: '13900006666', status: 'normal' },
  { id: 7, name: '吴九', studentId: '20210301001', gender: '男', ethnicity: '汉族', college: '外国语学院', major: '英语', grade: '2022级', className: '英语2201', campus: '南校区', dormitory: '南4-108', phone: '13800007777', idCard: '320102200307070077', classTeacher: '郑老师', classTeacherPhone: '13900007777', status: 'pending' },
  { id: 8, name: '郑十', studentId: '20210302001', gender: '女', ethnicity: '汉族', college: '数学与统计学院', major: '应用数学', grade: '2023级', className: '数学2301', campus: '北校区', dormitory: '北4-501', phone: '13800008888', idCard: '320102200408080088', classTeacher: '冯老师', classTeacherPhone: '13900008888', status: 'normal' },
  { id: 9, name: '陈一', studentId: '20210401001', gender: '男', ethnicity: '土家族', college: '法学院', major: '法学', grade: '2023级', className: '法学2302', campus: '南校区', dormitory: '南5-220', phone: '13800009999', idCard: '320102200409090099', classTeacher: '褚老师', classTeacherPhone: '13900009999', status: 'normal' },
  { id: 10, name: '林二', studentId: '20210402001', gender: '女', ethnicity: '汉族', college: '计算机科学与技术学院', major: '人工智能', grade: '2023级', className: '人工智能2301', campus: '南校区', dormitory: '南1-315', phone: '13800010000', idCard: '320102200410100100', classTeacher: '卫老师', classTeacherPhone: '13900010000', status: 'disabled' },
])

// --- Computed ---
const colleges = computed(() => {
  return [...new Set(students.value.map((s) => s.college))]
})

const filteredStudents = computed(() => {
  let result = students.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(
      (s) => s.name.includes(kw) || s.studentId.includes(kw)
    )
  }
  if (collegeFilter.value) {
    result = result.filter((s) => s.college === collegeFilter.value)
  }
  return result
})

// --- Detail Dialog ---
const showDetail = ref(false)
const currentStudent = ref(null)

function openDetail(row) {
  currentStudent.value = row
  showDetail.value = true
}

function onSearch() {
  page.value = 1
}

// --- GSAP ---
onMounted(() => {
  gsap.from('.table-row', {
    opacity: 0,
    y: 20,
    duration: 0.4,
    stagger: 0.08,
    ease: 'power2.out',
  })
})
</script>

<style scoped>
.students-page {
  max-width: 1200px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.table-card {
  margin-bottom: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
