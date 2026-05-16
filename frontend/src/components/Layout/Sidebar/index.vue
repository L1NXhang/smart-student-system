<template>
  <aside class="sidebar" :class="{ collapsed, 'is-mobile': isMobile }" ref="sidebarRef">
    <div class="sidebar-logo" @click="isMobile ? emit('close') : emit('toggle')">
      <span class="logo-icon">&#x1F393;</span>
      <Transition name="fade">
        <span v-show="!collapsed || isMobile" class="logo-text">智慧学工</span>
      </Transition>
    </div>

    <!-- 移动端关闭按钮 -->
    <button v-if="isMobile && !collapsed" class="mobile-close-btn" @click="emit('close')">
      <el-icon :size="18"><Close /></el-icon>
    </button>

    <el-menu
      :default-active="activeMenu"
      :default-openeds="defaultOpeneds"
      :collapse="!isMobile && collapsed"
      :router="true"
      class="sidebar-menu"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      @select="onMenuSelect"
    >
      <!-- ========== Student Menus ========== -->
      <template v-if="!isAdmin">
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人信息</span>
        </el-menu-item>

        <el-sub-menu index="scholarship-group">
          <template #title>
            <el-icon><Money /></el-icon>
            <span>奖助服务</span>
          </template>
          <el-menu-item index="/scholarship">奖学金申请</el-menu-item>
          <el-menu-item index="/work-study">勤工助学</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="academic-group">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>学业发展</span>
          </template>
          <el-menu-item index="/academic/grades">成绩查询</el-menu-item>
          <el-menu-item index="/academic/evaluation">中期鉴定</el-menu-item>
          <el-menu-item index="/academic/second-classroom">第二课堂</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="career-group">
          <template #title>
            <el-icon><Aim /></el-icon>
            <span>职业规划</span>
          </template>
          <el-menu-item index="/career/assessment">生涯测评</el-menu-item>
          <el-menu-item index="/career/appointment">就业指导预约</el-menu-item>
          <el-menu-item index="/career/jobs">就业信息</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="safety-group">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>安全管理</span>
          </template>
          <el-menu-item index="/safety/late-return">晚归登记</el-menu-item>
          <el-menu-item index="/safety/leave">外出报备</el-menu-item>
          <el-menu-item index="/safety/exam">安全考试</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="message-group">
          <template #title>
            <el-icon><ChatDotRound /></el-icon>
            <span>沟通互动</span>
          </template>
          <el-menu-item index="/message/chat">班任留言</el-menu-item>
          <el-menu-item index="/message/notice">公告通知</el-menu-item>
          <el-menu-item index="/message/feedback">意见反馈</el-menu-item>
          <el-menu-item index="/message/events">活动报名</el-menu-item>
        </el-sub-menu>
      </template>

      <!-- ========== Admin Menus ========== -->
      <template v-else>
        <el-menu-item index="/admin/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>管理首页</span>
        </el-menu-item>

        <el-menu-item index="/admin/students">
          <el-icon><UserFilled /></el-icon>
          <span>学生管理</span>
        </el-menu-item>

        <el-sub-menu index="applications-group">
          <template #title>
            <el-icon><DocumentChecked /></el-icon>
            <span>申请审核</span>
          </template>
          <el-menu-item index="/admin/applications/scholarship">奖学金审核</el-menu-item>
          <el-menu-item index="/admin/applications/info-change">信息变更审核</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/work-study">
          <el-icon><Briefcase /></el-icon>
          <span>勤工助学管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/academic/grades">
          <el-icon><DataAnalysis /></el-icon>
          <span>学业管理</span>
        </el-menu-item>

        <el-sub-menu index="admin-safety-group">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>安全管理</span>
          </template>
          <el-menu-item index="/admin/safety">晚归/外出审核</el-menu-item>
          <el-menu-item index="/admin/exams">考试管理</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/notice">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/events">
          <el-icon><Calendar /></el-icon>
          <span>活动管理</span>
        </el-menu-item>

        <el-menu-item index="/message/chat">
          <el-icon><ChatDotRound /></el-icon>
          <span>班任留言</span>
        </el-menu-item>
      </template>
    </el-menu>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'
import {
  Odometer, User, Money, Reading, Aim, Lock, ChatDotRound,
  UserFilled, DocumentChecked, Briefcase, DataAnalysis, Bell, Calendar, Close,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const props = defineProps({
  collapsed: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle', 'close'])

const route = useRoute()
const userStore = useUserStore()
const sidebarRef = ref(null)

const isAdmin = computed(() => userStore.isAdmin)

const activeMenu = computed(() => route.path)

const defaultOpeneds = computed(() => {
  const path = route.path
  if (isAdmin.value) {
    const groups = []
    if (path.startsWith('/admin/applications')) groups.push('applications-group')
    if (path.startsWith('/admin/safety') || path.startsWith('/admin/exams')) groups.push('admin-safety-group')
    return groups
  }
  const groups = []
  if (path.startsWith('/scholarship') || path.startsWith('/work-study')) groups.push('scholarship-group')
  if (path.startsWith('/academic')) groups.push('academic-group')
  if (path.startsWith('/career')) groups.push('career-group')
  if (path.startsWith('/safety')) groups.push('safety-group')
  if (path.startsWith('/message')) groups.push('message-group')
  return groups
})

let menuTween

function onMenuSelect() {
  if (props.isMobile) emit('close')
}

onMounted(async () => {
  await nextTick()
  if (sidebarRef.value) {
    const items = sidebarRef.value.querySelectorAll('.el-menu-item')
    if (items.length) {
      menuTween = gsap.from(items, {
        opacity: 0,
        x: -20,
        stagger: 0.03,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }
})

onBeforeUnmount(() => {
  if (menuTween) {
    menuTween.kill()
  }
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width, 220px);
  background-color: #304156;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1000;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-logo {
  height: var(--header-height, 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: var(--sidebar-width, 220px);
}

.mobile-close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255,255,255,0.1);
  color: #bfcbd9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}
.mobile-close-btn:hover {
  background: rgba(255,255,255,0.2);
}

@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 240px !important;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1100;
    box-shadow: 4px 0 20px rgba(0,0,0,0.3);
  }
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>
