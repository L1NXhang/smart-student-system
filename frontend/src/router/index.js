import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken } from '../utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('../views/auth/ChangePassword.vue'),
  },
  {
    path: '/',
    component: () => import('../components/Layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/student/Dashboard.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/student/Profile.vue'),
        meta: { title: '个人信息' },
      },
      {
        path: 'scholarship',
        name: 'ScholarshipList',
        component: () => import('../views/student/ScholarshipList.vue'),
        meta: { title: '奖助服务' },
      },
      {
        path: 'scholarship/apply',
        name: 'ScholarshipApply',
        component: () => import('../views/student/ScholarshipApply.vue'),
        meta: { title: '奖学金申请' },
      },
      {
        path: 'work-study',
        name: 'WorkStudyList',
        component: () => import('../views/student/WorkStudyList.vue'),
        meta: { title: '勤工助学' },
      },
      {
        path: 'academic/grades',
        name: 'Grades',
        component: () => import('../views/student/Grades.vue'),
        meta: { title: '成绩查询' },
      },
      {
        path: 'academic/evaluation',
        name: 'Evaluation',
        component: () => import('../views/student/Evaluation.vue'),
        meta: { title: '中期鉴定' },
      },
      {
        path: 'academic/second-classroom',
        name: 'SecondClassroom',
        component: () => import('../views/student/SecondClassroom.vue'),
        meta: { title: '第二课堂' },
      },
      {
        path: 'career/assessment',
        name: 'CareerAssessment',
        component: () => import('../views/student/CareerAssessment.vue'),
        meta: { title: '生涯测评' },
      },
      {
        path: 'career/appointment',
        name: 'CareerAppointment',
        component: () => import('../views/student/CareerAppointment.vue'),
        meta: { title: '就业指导预约' },
      },
      {
        path: 'career/jobs',
        name: 'JobInfos',
        component: () => import('../views/student/JobInfos.vue'),
        meta: { title: '就业信息' },
      },
      {
        path: 'safety/late-return',
        name: 'LateReturn',
        component: () => import('../views/student/LateReturn.vue'),
        meta: { title: '晚归登记' },
      },
      {
        path: 'safety/leave',
        name: 'LeaveApply',
        component: () => import('../views/student/LeaveApply.vue'),
        meta: { title: '外出报备' },
      },
      {
        path: 'safety/exam',
        name: 'SafetyExam',
        component: () => import('../views/student/SafetyExam.vue'),
        meta: { title: '安全考试' },
      },
      {
        path: 'message/chat',
        name: 'Chat',
        component: () => import('../views/student/Chat.vue'),
        meta: { title: '聊天室' },
      },
      {
        path: 'message/notice',
        name: 'Notice',
        component: () => import('../views/student/Notice.vue'),
        meta: { title: '公告通知' },
      },
      {
        path: 'message/feedback',
        name: 'Feedback',
        component: () => import('../views/student/Feedback.vue'),
        meta: { title: '意见反馈' },
      },
      {
        path: 'message/events',
        name: 'Events',
        component: () => import('../views/student/Events.vue'),
        meta: { title: '活动报名' },
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('../components/Layout/index.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '管理首页' },
      },
      {
        path: 'students',
        name: 'AdminStudents',
        component: () => import('../views/admin/Students.vue'),
        meta: { title: '学生管理' },
      },
      {
        path: 'applications/scholarship',
        name: 'AdminScholarship',
        component: () => import('../views/admin/ScholarshipReview.vue'),
        meta: { title: '奖学金审核' },
      },
      {
        path: 'applications/info-change',
        name: 'AdminInfoChange',
        component: () => import('../views/admin/InfoChange.vue'),
        meta: { title: '信息变更审核' },
      },
      {
        path: 'work-study',
        name: 'AdminWorkStudy',
        component: () => import('../views/admin/WorkStudy.vue'),
        meta: { title: '勤工助学管理' },
      },
      {
        path: 'academic/grades',
        name: 'AdminGrades',
        component: () => import('../views/admin/GradesImport.vue'),
        meta: { title: '成绩导入' },
      },
      {
        path: 'safety',
        name: 'AdminSafety',
        component: () => import('../views/admin/SafetyReview.vue'),
        meta: { title: '安全管理' },
      },
      {
        path: 'exams',
        name: 'AdminExams',
        component: () => import('../views/admin/ExamManage.vue'),
        meta: { title: '考试管理' },
      },
      {
        path: 'notice',
        name: 'AdminNotice',
        component: () => import('../views/admin/NoticeManage.vue'),
        meta: { title: '公告管理' },
      },
      {
        path: 'events',
        name: 'AdminEvents',
        component: () => import('../views/admin/EventManage.vue'),
        meta: { title: '活动管理' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = getToken()
  if (to.meta.guest) {
    if (token) return next('/dashboard')
    return next()
  }
  if (!token) return next('/login')
  next()
})

export default router
