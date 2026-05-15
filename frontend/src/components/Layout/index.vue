<template>
  <div class="layout">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
    <div class="layout-main" :class="{ collapsed: sidebarCollapsed }" ref="mainRef">
      <Header :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
      <div class="layout-content">
        <router-view v-slot="{ Component, route }">
          <transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import gsap from 'gsap'
import Sidebar from './Sidebar/index.vue'
import Header from './Header/index.vue'

const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)
const mainRef = ref(null)

// Track navigation direction for push/pop transitions
let historyStack = []
const transitionName = ref('slide-left')

router.beforeEach((to, from) => {
  if (!from || !from.path) return
  const fromDepth = from.path.split('/').length
  const toDepth = to.path.split('/').length
  if (toDepth > fromDepth || to.path !== from.path) {
    transitionName.value = 'slide-left'
  } else {
    transitionName.value = 'slide-right'
  }
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

watch(sidebarCollapsed, (collapsed) => {
  if (mainRef.value) {
    gsap.to(mainRef.value, {
      marginLeft: collapsed ? 64 : 220,
      duration: 0.3,
      ease: 'power2.inOut',
    })
  }
}, { immediate: true })
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.layout-main {
  flex: 1;
  margin-left: var(--sidebar-width, 220px);
  min-width: 0;
  transition: none;
}

.layout-main.collapsed {
  margin-left: 64px;
}

.layout-content {
  padding: 20px;
  background: var(--color-bg);
  min-height: calc(100vh - var(--header-height));
}

@media (max-width: 768px) {
  .layout-main {
    margin-left: 0 !important;
  }

  .layout-content {
    padding: 12px;
  }
}
</style>
