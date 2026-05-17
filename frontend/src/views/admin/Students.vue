<template>
  <div class="students-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h2>学生管理</h2>
        <p>查看和管理全校学生信息</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showImportDialog = true">
          <el-icon style="margin-right: 4px"><Upload /></el-icon>
          批量导入学生
        </el-button>
      </div>
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
          style="width: 200px"
          @change="onCollegeChange"
        >
          <el-option
            v-for="college in colleges"
            :key="college"
            :label="college"
            :value="college"
          />
        </el-select>
        <el-select
          v-model="gradeFilter"
          placeholder="年级"
          clearable
          style="width: 140px"
          @change="onSearch"
        >
          <el-option
            v-for="g in gradeOptions"
            :key="g"
            :label="g"
            :value="g"
          />
        </el-select>
        <el-select
          v-model="classFilter"
          placeholder="班级"
          clearable
          style="width: 120px"
          @change="onSearch"
        >
          <el-option
            v-for="c in classOptions"
            :key="c"
            :label="c"
            :value="c"
          />
        </el-select>
      </div>
    </el-card>

    <!-- Student Table -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="pagedStudents"
        border
        stripe
        style="width: 100%"
        row-class-name="table-row"
        @row-click="openDetail"
      >
        <el-table-column prop="name" label="姓名" width="90" />
        <el-table-column prop="studentId" label="学号" width="140" />
        <el-table-column prop="college" label="学院" min-width="160" />
        <el-table-column prop="major" label="专业" min-width="150" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="className" label="班级" width="100" />
        <el-table-column label="部门" width="140">
          <template #default="{ row }">
            <el-tag v-if="row.department" :type="row.departmentRole === 'head' ? 'warning' : 'info'" size="small">
              {{ row.department }}{{ row.departmentRole === 'head' ? '(部长)' : '' }}
            </el-tag>
            <span v-else style="color:#c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
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

    <!-- Full Page Student Detail Overlay -->
    <Transition name="overlay-fade">
      <div v-if="showDetail" class="detail-overlay" @click.self="showDetail = false">
        <div class="detail-panel">
          <!-- Panel Header -->
          <div class="detail-panel-header">
            <h3>学生详细信息</h3>
            <el-button :icon="Close" circle @click="showDetail = false" />
          </div>

          <!-- Panel Body -->
          <div class="detail-panel-body" v-if="currentStudent">
            <!-- Top: Photo + Key Info -->
            <div class="detail-top">
              <div class="detail-photo">
                <el-avatar :size="100" shape="circle">
                  {{ currentStudent.name?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="detail-keyinfo">
                <div class="keyinfo-name">{{ currentStudent.name }}</div>
                <div class="keyinfo-meta">
                  <span>{{ currentStudent.studentId }}</span>
                  <el-divider direction="vertical" />
                  <span>{{ currentStudent.college }}</span>
                  <el-divider direction="vertical" />
                  <span>{{ currentStudent.grade }} · {{ currentStudent.className }}</span>
                </div>
                <el-tag :type="statusTagMap[currentStudent.status]?.type" size="small">
                  {{ statusTagMap[currentStudent.status]?.label }}
                </el-tag>
              </div>
            </div>

            <!-- Tabs: Organised Sections -->
            <el-tabs v-model="detailTab" class="detail-tabs">
              <!-- Tab 1: 基本信息 -->
              <el-tab-pane label="基本信息" name="basic">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="姓名">{{ currentStudent.name }}</el-descriptions-item>
                  <el-descriptions-item label="学号">{{ currentStudent.studentId }}</el-descriptions-item>
                  <el-descriptions-item label="性别">{{ currentStudent.gender }}</el-descriptions-item>
                  <el-descriptions-item label="民族">{{ currentStudent.ethnicity }}</el-descriptions-item>
                  <el-descriptions-item label="手机号">{{ currentStudent.phone }}</el-descriptions-item>
                  <el-descriptions-item label="邮箱">{{ currentStudent.email }}</el-descriptions-item>
                  <el-descriptions-item label="身份证号" :span="2">{{ currentStudent.idCard }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 2: 学籍信息 -->
              <el-tab-pane label="学籍信息" name="enrollment">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="学院">{{ currentStudent.college }}</el-descriptions-item>
                  <el-descriptions-item label="专业">{{ currentStudent.major }}</el-descriptions-item>
                  <el-descriptions-item label="年级">{{ currentStudent.grade }}</el-descriptions-item>
                  <el-descriptions-item label="班级">{{ currentStudent.className }}</el-descriptions-item>
                  <el-descriptions-item label="校区">{{ currentStudent.campus }}</el-descriptions-item>
                  <el-descriptions-item label="宿舍号">{{ currentStudent.dormitory }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 3: 家庭信息 -->
              <el-tab-pane label="家庭信息" name="family">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="班主任">{{ currentStudent.classTeacher }}</el-descriptions-item>
                  <el-descriptions-item label="班主任电话">{{ currentStudent.classTeacherPhone }}</el-descriptions-item>
                  <el-descriptions-item label="父亲姓名">{{ currentStudent.fatherName }}</el-descriptions-item>
                  <el-descriptions-item label="父亲电话">{{ currentStudent.fatherPhone }}</el-descriptions-item>
                  <el-descriptions-item label="母亲姓名">{{ currentStudent.motherName }}</el-descriptions-item>
                  <el-descriptions-item label="母亲电话">{{ currentStudent.motherPhone }}</el-descriptions-item>
                  <el-descriptions-item label="紧急联系人">{{ currentStudent.emergencyContact }}</el-descriptions-item>
                  <el-descriptions-item label="紧急电话">{{ currentStudent.emergencyPhone }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 4: 个人特质 -->
              <el-tab-pane label="个人特质" name="personal">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="既往病史">{{ currentStudent.medicalHistory || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="兴趣爱好">{{ currentStudent.hobbies || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="性格特点">{{ currentStudent.personality || '无' }}</el-descriptions-item>
                  <el-descriptions-item label="职业目标">{{ currentStudent.careerGoal || '无' }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 5: 特殊信息 -->
              <el-tab-pane label="特殊信息" name="special">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="困难等级">
                    <el-tag v-if="currentStudent.difficultyLevel" :type="difficultyTagMap[currentStudent.difficultyLevel]" size="small">
                      {{ currentStudent.difficultyLevel }}
                    </el-tag>
                    <span v-else>无</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="备注">{{ currentStudent.remark || '无' }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>

              <!-- Tab 6: 部门角色 -->
              <el-tab-pane label="部门角色" name="department">
                <div class="dept-section">
                  <el-form label-width="80px" @submit.prevent>
                    <el-form-item label="所属部门">
                      <el-select v-model="deptForm.department" placeholder="选择部门" clearable style="width: 240px">
                        <el-option v-for="d in departments" :key="d.value" :label="d.label" :value="d.value" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="部门角色">
                      <el-select v-model="deptForm.departmentRole" placeholder="选择角色" clearable style="width: 240px">
                        <el-option label="部长" value="head" />
                        <el-option label="成员" value="member" />
                      </el-select>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" size="small" @click="saveDepartment" :loading="deptSaving">
                        保存
                      </el-button>
                      <el-button v-if="deptForm.department" size="small" @click="clearDepartment" :loading="deptSaving">
                        清除部门角色
                      </el-button>
                    </el-form-item>
                  </el-form>
                  <div v-if="currentStudent.department" class="dept-current">
                    <el-tag type="success" size="default">
                      {{ currentStudent.department }}
                    </el-tag>
                    <el-tag :type="currentStudent.departmentRole === 'head' ? 'warning' : 'info'" size="default" style="margin-left:8px">
                      {{ currentStudent.departmentRole === 'head' ? '部长' : currentStudent.departmentRole === 'member' ? '成员' : '未知' }}
                    </el-tag>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Batch Import Dialog -->
    <el-dialog v-model="showImportDialog" title="批量导入学生" width="560px" destroy-on-close>
      <div class="import-hint">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>
            请上传 CSV 或 Excel 文件，模板格式如下：
          </template>
          <p class="import-format">
            列名：学号, 姓名, 学院, 专业, 年级, 班级<br />
            示例：20240101001, 张三, 计算机学院, 软件工程, 2024级, 2班
          </p>
        </el-alert>
      </div>
      <div class="import-upload">
        <el-upload
          ref="uploadRef"
          drag
          :auto-upload="false"
          :limit="1"
          accept=".csv,.xlsx,.xls"
          :on-change="onFileChange"
          :on-remove="onFileRemove"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">仅支持 .csv / .xlsx / .xls 文件</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="doBatchImport">
          开始导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { Upload, UploadFilled, Close } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import { importStudentsFile } from '@/api/admin'
import api from '@/api'
import gsap from 'gsap'

// ==================== Filters ====================
const keyword = ref('')
const collegeFilter = ref('')
const gradeFilter = ref('')
const classFilter = ref('')
const page = ref(1)
const pageSize = ref(10)

const gradeOptions = ['2022级', '2023级', '2024级', '2025级']
const classOptions = ['1班', '2班', '3班']

const statusTagMap = {
  normal: { type: 'success', label: '正常' },
  pending: { type: 'warning', label: '待审核' },
  disabled: { type: 'danger', label: '禁用' },
}

const difficultyTagMap = {
  '一般困难': 'warning',
  '特别困难': 'danger',
}

// ==================== Mock Data (15+ students) ====================
const students = ref([
  { id: 1, name: '张三', studentId: '20240101001', gender: '男', ethnicity: '汉族', college: '计算机学院', major: '计算机科学与技术', grade: '2024级', className: '1班', campus: '华凤校区', dormitory: '1栋301', phone: '13800001111', email: 'zhangsan@cwnu.edu.cn', idCard: '320102200601010011', classTeacher: '王老师', classTeacherPhone: '13900001111', fatherName: '张父', fatherPhone: '13600001111', motherName: '李母', motherPhone: '13600002222', emergencyContact: '张父', emergencyPhone: '13600001111', medicalHistory: '无', hobbies: '篮球、编程', personality: '开朗乐观', careerGoal: '软件工程师', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 2, name: '李四', studentId: '20240102002', gender: '女', ethnicity: '汉族', college: '计算机学院', major: '软件工程', grade: '2024级', className: '2班', campus: '华凤校区', dormitory: '2栋205', phone: '13800002222', email: 'lisi@cwnu.edu.cn', idCard: '320102200602020022', classTeacher: '赵老师', classTeacherPhone: '13900002222', fatherName: '李父', fatherPhone: '13600003333', motherName: '王母', motherPhone: '13600004444', emergencyContact: '李父', emergencyPhone: '13600003333', medicalHistory: '花粉过敏', hobbies: '阅读、摄影', personality: '文静细心', careerGoal: '产品经理', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 3, name: '王五', studentId: '20230102001', gender: '男', ethnicity: '回族', college: '电子信息工程学院', major: '电子信息工程', grade: '2023级', className: '1班', campus: '行署校区', dormitory: '3栋118', phone: '13800003333', email: 'wangwu@cwnu.edu.cn', idCard: '320102200503030033', classTeacher: '钱老师', classTeacherPhone: '13900003333', fatherName: '王父', fatherPhone: '13600005555', motherName: '马母', motherPhone: '13600006666', emergencyContact: '马母', emergencyPhone: '13600006666', medicalHistory: '无', hobbies: '电子设计、足球', personality: '沉稳踏实', careerGoal: '硬件工程师', difficultyLevel: '一般困难', remark: '家庭经济较困难', status: 'pending' },
  { id: 4, name: '赵六', studentId: '20230103002', gender: '女', ethnicity: '壮族', college: '外国语学院', major: '英语', grade: '2023级', className: '2班', campus: '华凤校区', dormitory: '4栋302', phone: '13800004444', email: 'zhaoliu@cwnu.edu.cn', idCard: '320102200504040044', classTeacher: '孙老师', classTeacherPhone: '13900004444', fatherName: '赵父', fatherPhone: '13600007777', motherName: '刘母', motherPhone: '13600008888', emergencyContact: '刘母', emergencyPhone: '13600008888', medicalHistory: '无', hobbies: '英语演讲、旅行', personality: '活泼外向', careerGoal: '翻译官', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 5, name: '孙七', studentId: '20220201001', gender: '男', ethnicity: '汉族', college: '数学与信息学院', major: '数学与应用数学', grade: '2022级', className: '3班', campus: '行署校区', dormitory: '5栋410', phone: '13800005555', email: 'sunqi@cwnu.edu.cn', idCard: '320102200405050055', classTeacher: '周老师', classTeacherPhone: '13900005555', fatherName: '孙父', fatherPhone: '13600009999', motherName: '吴母', motherPhone: '13600010000', emergencyContact: '孙父', emergencyPhone: '13600009999', medicalHistory: '轻度近视', hobbies: '数学建模、围棋', personality: '逻辑缜密', careerGoal: '数据分析师', difficultyLevel: '', remark: '', status: 'disabled' },
  { id: 6, name: '周八', studentId: '20220202001', gender: '女', ethnicity: '苗族', college: '商学院', major: '工商管理', grade: '2022级', className: '1班', campus: '华凤校区', dormitory: '6栋215', phone: '13800006666', email: 'zhouba@cwnu.edu.cn', idCard: '320102200406060066', classTeacher: '吴老师', classTeacherPhone: '13900006666', fatherName: '周父', fatherPhone: '13600011000', motherName: '杨母', motherPhone: '13600012000', emergencyContact: '杨母', emergencyPhone: '13600012000', medicalHistory: '无', hobbies: '市场营销、辩论', personality: '自信果断', careerGoal: '企业管理者', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 7, name: '吴九', studentId: '20230203001', gender: '男', ethnicity: '汉族', college: '物理与天文学院', major: '物理学', grade: '2023级', className: '1班', campus: '行署校区', dormitory: '7栋108', phone: '13800007777', email: 'wujiu@cwnu.edu.cn', idCard: '320102200507070077', classTeacher: '郑老师', classTeacherPhone: '13900007777', fatherName: '吴父', fatherPhone: '13600013000', motherName: '陈母', motherPhone: '13600014000', emergencyContact: '吴父', emergencyPhone: '13600013000', medicalHistory: '无', hobbies: '天文观测、物理实验', personality: '好奇探索', careerGoal: '科研人员', difficultyLevel: '特别困难', remark: '单亲家庭', status: 'pending' },
  { id: 8, name: '郑十', studentId: '20240301001', gender: '女', ethnicity: '汉族', college: '文学院', major: '汉语言文学', grade: '2024级', className: '3班', campus: '华凤校区', dormitory: '8栋501', phone: '13800008888', email: 'zhengshi@cwnu.edu.cn', idCard: '320102200608080088', classTeacher: '冯老师', classTeacherPhone: '13900008888', fatherName: '郑父', fatherPhone: '13600015000', motherName: '林母', motherPhone: '13600016000', emergencyContact: '林母', emergencyPhone: '13600016000', medicalHistory: '无', hobbies: '写作、书法', personality: '文静优雅', careerGoal: '编辑', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 9, name: '陈一', studentId: '20240401001', gender: '男', ethnicity: '土家族', college: '政治与行政学院', major: '行政管理', grade: '2024级', className: '2班', campus: '行署校区', dormitory: '9栋220', phone: '13800009999', email: 'chenyi@cwnu.edu.cn', idCard: '320102200609090099', classTeacher: '褚老师', classTeacherPhone: '13900009999', fatherName: '陈父', fatherPhone: '13600017000', motherName: '黄母', motherPhone: '13600018000', emergencyContact: '陈父', emergencyPhone: '13600017000', medicalHistory: '无', hobbies: '公共演讲、篮球', personality: '领导力强', careerGoal: '公务员', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 10, name: '林二', studentId: '20250501001', gender: '女', ethnicity: '汉族', college: '计算机学院', major: '人工智能', grade: '2025级', className: '1班', campus: '华凤校区', dormitory: '1栋515', phone: '13800010000', email: 'liner@cwnu.edu.cn', idCard: '320102200710100100', classTeacher: '卫老师', classTeacherPhone: '13900010000', fatherName: '林父', fatherPhone: '13600019000', motherName: '何母', motherPhone: '13600020000', emergencyContact: '何母', emergencyPhone: '13600020000', medicalHistory: '无', hobbies: 'AI 研究、绘画', personality: '创新进取', careerGoal: 'AI 算法工程师', difficultyLevel: '', remark: '', status: 'disabled' },
  { id: 11, name: '何十二', studentId: '20250502001', gender: '男', ethnicity: '汉族', college: '电子信息工程学院', major: '通信工程', grade: '2025级', className: '2班', campus: '行署校区', dormitory: '3栋215', phone: '13800011000', email: 'heshier@cwnu.edu.cn', idCard: '320102200701110011', classTeacher: '蒋老师', classTeacherPhone: '13900011000', fatherName: '何父', fatherPhone: '13600021000', motherName: '邓母', motherPhone: '13600022000', emergencyContact: '邓母', emergencyPhone: '13600022000', medicalHistory: '鼻炎', hobbies: '无线电、骑行', personality: '严谨细致', careerGoal: '通信工程师', difficultyLevel: '一般困难', remark: '', status: 'normal' },
  { id: 12, name: '刘十三', studentId: '20230502001', gender: '女', ethnicity: '汉族', college: '外国语学院', major: '日语', grade: '2023级', className: '3班', campus: '华凤校区', dormitory: '4栋408', phone: '13800012000', email: 'liushisan@cwnu.edu.cn', idCard: '320102200512120012', classTeacher: '沈老师', classTeacherPhone: '13900012000', fatherName: '刘父', fatherPhone: '13600023000', motherName: '韩母', motherPhone: '13600024000', emergencyContact: '韩母', emergencyPhone: '13600024000', medicalHistory: '无', hobbies: '日语动漫、茶道', personality: '温柔耐心', careerGoal: '日语翻译', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 13, name: '黄十四', studentId: '20220601001', gender: '男', ethnicity: '汉族', college: '物理与天文学院', major: '天文学', grade: '2022级', className: '2班', campus: '行署校区', dormitory: '7栋302', phone: '13800013000', email: 'huangshisi@cwnu.edu.cn', idCard: '320102200413130013', classTeacher: '杨老师', classTeacherPhone: '13900013000', fatherName: '黄父', fatherPhone: '13600025000', motherName: '朱母', motherPhone: '13600026000', emergencyContact: '朱母', emergencyPhone: '13600026000', medicalHistory: '无', hobbies: '天文摄影、模型制作', personality: '专注执着', careerGoal: '天文研究员', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 14, name: '曹十五', studentId: '20250503001', gender: '女', ethnicity: '藏族', college: '数学与信息学院', major: '信息与计算科学', grade: '2025级', className: '1班', campus: '华凤校区', dormitory: '5栋512', phone: '13800014000', email: 'caoshiwu@cwnu.edu.cn', idCard: '320102200714140014', classTeacher: '彭老师', classTeacherPhone: '13900014000', fatherName: '曹父', fatherPhone: '13600027000', motherName: '吕母', motherPhone: '13600028000', emergencyContact: '曹父', emergencyPhone: '13600027000', medicalHistory: '无', hobbies: '算法竞赛、跑步', personality: '勤奋刻苦', careerGoal: '算法工程师', difficultyLevel: '特别困难', remark: '偏远地区贫困家庭', status: 'pending' },
  { id: 15, name: '魏十六', studentId: '20250701001', gender: '男', ethnicity: '汉族', college: '商学院', major: '会计学', grade: '2025级', className: '3班', campus: '行署校区', dormitory: '6栋318', phone: '13800015000', email: 'weishiliu@cwnu.edu.cn', idCard: '320102200715150015', classTeacher: '秦老师', classTeacherPhone: '13900015000', fatherName: '魏父', fatherPhone: '13600029000', motherName: '苏母', motherPhone: '13600030000', emergencyContact: '苏母', emergencyPhone: '13600030000', medicalHistory: '无', hobbies: '财务管理、乒乓球', personality: '细心负责', careerGoal: '注册会计师', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 16, name: '徐十七', studentId: '20240601001', gender: '女', ethnicity: '汉族', college: '文学院', major: '新闻学', grade: '2024级', className: '2班', campus: '华凤校区', dormitory: '8栋602', phone: '13800016000', email: 'xushiqi@cwnu.edu.cn', idCard: '320102200616160016', classTeacher: '许老师', classTeacherPhone: '13900016000', fatherName: '徐父', fatherPhone: '13600031000', motherName: '唐母', motherPhone: '13600032000', emergencyContact: '唐母', emergencyPhone: '13600032000', medicalHistory: '无', hobbies: '新闻采编、短视频制作', personality: '敏锐好奇', careerGoal: '记者', difficultyLevel: '', remark: '', status: 'normal' },
  { id: 17, name: '胡十八', studentId: '20240801001', gender: '男', ethnicity: '汉族', college: '政治与行政学院', major: '政治学', grade: '2024级', className: '1班', campus: '行署校区', dormitory: '9栋415', phone: '13800017000', email: 'hushiba@cwnu.edu.cn', idCard: '320102200617170017', classTeacher: '石老师', classTeacherPhone: '13900017000', fatherName: '胡父', fatherPhone: '13600033000', motherName: '高母', motherPhone: '13600034000', emergencyContact: '高母', emergencyPhone: '13600034000', medicalHistory: '无', hobbies: '时事分析、象棋', personality: '沉稳理性', careerGoal: '政策研究员', difficultyLevel: '', remark: '', status: 'normal' },
])

// ==================== Computed ====================
const colleges = computed(() => {
  const collegeOrder = [
    '计算机学院', '电子信息工程学院', '外国语学院',
    '数学与信息学院', '物理与天文学院', '文学院',
    '商学院', '政治与行政学院',
  ]
  const set = new Set(students.value.map((s) => s.college))
  return collegeOrder.filter(c => set.has(c))
})

const filteredStudents = computed(() => {
  let result = students.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(
      (s) => s.name.toLowerCase().includes(kw) || s.studentId.includes(kw)
    )
  }
  if (collegeFilter.value) {
    result = result.filter((s) => s.college === collegeFilter.value)
  }
  if (gradeFilter.value) {
    result = result.filter((s) => s.grade === gradeFilter.value)
  }
  if (classFilter.value) {
    result = result.filter((s) => s.className === classFilter.value)
  }
  return result
})

const pagedStudents = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredStudents.value.slice(start, start + pageSize.value)
})

// ==================== Detail Panel ====================
const showDetail = ref(false)
const currentStudent = ref(null)
const detailTab = ref('basic')

// Department management
const departments = ref([
  { value: '纪检部', label: '纪检部' },
  { value: '学习发展部', label: '学习发展部' },
  { value: '宣传部', label: '宣传部' },
  { value: '素质发展部', label: '素质发展部' },
  { value: '青年志愿者协会', label: '青年志愿者协会（青志协）' },
  { value: '办公室', label: '办公室' },
  { value: '组织部', label: '组织部' },
])
const deptForm = reactive({ department: '', departmentRole: '' })
const deptSaving = ref(false)

async function saveDepartment() {
  if (!currentStudent.value || !deptForm.department || !deptForm.departmentRole) {
    ElMessage.warning('请选择部门和角色')
    return
  }
  deptSaving.value = true
  try {
    await api.put(`/admin/students/${currentStudent.value.id}/department`, {
      department: deptForm.department,
      departmentRole: deptForm.departmentRole,
    })
    currentStudent.value.department = deptForm.department
    currentStudent.value.departmentRole = deptForm.departmentRole
    ElMessage.success('部门角色设置成功')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '设置失败')
  } finally { deptSaving.value = false }
}

async function clearDepartment() {
  deptSaving.value = true
  try {
    await api.put(`/admin/students/${currentStudent.value.id}/department`, {
      department: null,
      departmentRole: null,
    })
    currentStudent.value.department = null
    currentStudent.value.departmentRole = null
    deptForm.department = ''
    deptForm.departmentRole = ''
    ElMessage.success('部门角色已清除')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '清除失败')
  } finally { deptSaving.value = false }
}

function openDetail(row) {
  currentStudent.value = row
  detailTab.value = 'basic'
  deptForm.department = row.department || ''
  deptForm.departmentRole = row.departmentRole || ''
  showDetail.value = true
  nextTick(() => {
    gsap.from('.detail-panel', {
      x: 100,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
    })
    gsap.from('.detail-top', {
      y: -20,
      opacity: 0,
      duration: 0.35,
      delay: 0.1,
      ease: 'power2.out',
    })
  })
}

// ==================== Search / Filter ====================
function onSearch() {
  page.value = 1
}

function onCollegeChange() {
  gradeFilter.value = ''
  classFilter.value = ''
  onSearch()
}

// ==================== Batch Import ====================
const showImportDialog = ref(false)
const importLoading = ref(false)
const importFile = ref(null)

function onFileChange(file) {
  importFile.value = file
}

function onFileRemove() {
  importFile.value = null
}

async function doBatchImport() {
  if (!importFile.value) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }
  importLoading.value = true
  try {
    const fd = new FormData()
    fd.append('file', importFile.value.raw)
    const res = await importStudentsFile(fd)
    const { imported, total, errors } = res.data || {}
    ElNotification({
      title: '导入完成',
      message: `成功导入 ${imported}/${total} 名学生${errors ? '，部分行失败' : ''}`,
      type: errors ? 'warning' : 'success',
      duration: 5000,
    })
    showImportDialog.value = false
    importFile.value = null
  } catch (e) {
    ElNotification({
      title: '导入失败',
      message: e.response?.data?.message || '文件解析失败',
      type: 'error',
    })
  } finally {
    importLoading.value = false
  }
}

// ==================== GSAP Page Animations ====================
onMounted(() => {
  nextTick(() => {
    gsap.from('.table-row', {
      opacity: 0,
      y: 20,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power2.out',
    })
    gsap.from('.page-header', {
      y: -30,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
    })
    gsap.from('.filter-card', {
      y: -20,
      opacity: 0,
      duration: 0.4,
      delay: 0.1,
      ease: 'power2.out',
    })
  })
})
</script>

<style scoped>
.students-page {
  max-width: 1200px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* Filters */
.filter-card {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Table */
.table-card {
  margin-bottom: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ======== Full Page Detail Overlay ======== */
.detail-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
}

.detail-panel {
  width: 80vw;
  max-width: 960px;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.detail-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.detail-panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.detail-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

/* Top section: photo + key info */
.detail-top {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.detail-photo :deep(.el-avatar) {
  background: linear-gradient(135deg, #409eff, #67c23a);
  font-size: 36px;
  font-weight: 600;
  color: #fff;
}

.keyinfo-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.keyinfo-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

/* Tabs */
.detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

/* Overlay Transition */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-active .detail-panel,
.overlay-fade-leave-active .detail-panel {
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.overlay-fade-enter-from .detail-panel,
.overlay-fade-leave-to .detail-panel {
  transform: translateX(100%);
  opacity: 0;
}

/* ======== Import Dialog ======== */
.import-hint {
  margin-bottom: 16px;
}

.import-format {
  margin: 8px 0 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
  font-family: monospace;
}

.import-upload {
  margin-top: 8px;
}

/* Table row hover cursor */
:deep(.table-row) {
  cursor: pointer;
}

/* Department */
.dept-section {
  padding: 8px 0;
}
.dept-current {
  margin-top: 16px;
  padding: 12px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
}
</style>
