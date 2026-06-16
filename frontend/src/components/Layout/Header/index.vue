<template>
  <header class="header" :class="{ 'is-mobile': isMobile }">
    <div class="header-left">
      <span class="hamburger" @click="emit('toggle')">
        <el-icon :size="20">
          <Fold v-if="!collapsed" />
          <Expand v-else />
        </el-icon>
      </span>

      <el-breadcrumb v-if="!isMobile" separator="/">
        <el-breadcrumb-item
          v-for="item in breadcrumbs"
          :key="item.path"
          :to="{ path: item.path }"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      <span v-else class="mobile-title">{{ pageTitle }}</span>
    </div>

    <div class="header-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" :icon="UserFilled" />
          <span class="user-name">{{ userStore.user?.name || '用户' }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="changePassword">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Fold, Expand, ArrowDown, UserFilled, User, Lock, SwitchButton,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { changePassword as changePasswordApi } from '@/api/auth'

defineProps({
  collapsed: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const breadcrumbs = computed(() => {
  return route.matched
    .filter((r) => r.meta?.title)
    .map((r) => ({ path: r.path, title: r.meta.title }))
})

const pageTitle = computed(() => {
  const last = breadcrumbs.value[breadcrumbs.value.length - 1]
  return last?.title || '智慧学工'
})

const profilePath = computed(() => {
  return userStore.isAdmin ? '/admin/dashboard' : '/profile'
})

function handleCommand(command) {
  switch (command) {
    case 'profile':
      router.push(profilePath.value)
      break
    case 'changePassword':
      showChangePasswordDialog()
      break
    case 'logout':
      handleLogout()
      break
  }
}

async function showChangePasswordDialog() {
  try {
    const { value: oldPwd } = await ElMessageBox.prompt('请输入当前密码', '修改密码', {
      confirmButtonText: '下一步',
      cancelButtonText: '取消',
      inputType: 'password',
    })
    if (!oldPwd) return
    const { value: newPwd } = await ElMessageBox.prompt('请输入新密码（不少于6位）', '修改密码', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputType: 'password',
      inputValidator: (val) => {
        if (!val || val.length < 6) return '密码长度不能少于6位'
        return true
      },
    })
    await changePasswordApi(oldPwd, newPwd)
    ElMessage.success('密码修改成功，请重新登录')
    userStore.logout()
    router.push('/login')
  } catch {
    // user cancelled or error handled by interceptor
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}
</script>

<style scoped>
.header {
  height: var(--header-height, 56px);
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hamburger {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
  transition: color 0.2s;
}

.hamburger:hover {
  color: var(--color-primary);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.user-info:hover {
  background: var(--color-bg);
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.arrow-icon {
  font-size: 12px;
  color: #909399;
  transition: transform 0.2s;
}

.mobile-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

@media (max-width: 767px) {
  .header {
    padding: 0 12px;
    position: sticky;
    top: 0;
    z-index: 800;
  }
  .user-name {
    display: none;
  }
}
</style>
