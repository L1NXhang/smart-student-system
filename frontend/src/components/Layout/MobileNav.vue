<template>
  <nav class="mobile-nav">
    <div
      v-for="tab in tabs"
      :key="tab.path"
      class="nav-item"
      :class="{ active: isActive(tab) }"
      @click="$router.push(tab.path)"
    >
      <el-icon :size="20"><component :is="tab.icon" /></el-icon>
      <span class="nav-label">{{ tab.label }}</span>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  HomeFilled, User, Reading, ChatDotRound, Menu,
} from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()

const tabs = computed(() => {
  if (userStore.isAdmin) {
    return [
      { path: '/admin/dashboard', label: '首页', icon: HomeFilled },
      { path: '/admin/students', label: '学生', icon: User },
      { path: '/admin/applications/scholarship', label: '审核', icon: Reading },
      { path: '/message/chat', label: '消息', icon: ChatDotRound },
    ]
  }
  return [
    { path: '/dashboard', label: '首页', icon: HomeFilled },
    { path: '/profile', label: '我的', icon: User },
    { path: '/academic/grades', label: '学业', icon: Reading },
    { path: '/message/chat', label: '消息', icon: ChatDotRound },
  ]
})

function isActive(tab) {
  return route.path === tab.path || route.path.startsWith(tab.path + '/')
}
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 900;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 16px;
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
