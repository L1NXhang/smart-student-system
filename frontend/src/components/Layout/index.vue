<template>
  <div class="layout" :class="{ 'is-mobile': isMobile }">
    <!-- 移动端遮罩 -->
    <div
      v-if="isMobile && !sidebarCollapsed"
      class="mobile-overlay"
      @click="sidebarCollapsed = true"
    />
    <Sidebar
      :collapsed="sidebarCollapsed"
      :is-mobile="isMobile"
      @toggle="toggleSidebar"
      @close="sidebarCollapsed = true"
    />
    <div class="layout-main" :class="{ collapsed: sidebarCollapsed, 'is-mobile': isMobile }" ref="mainRef">
      <Header :collapsed="sidebarCollapsed" :is-mobile="isMobile" @toggle="toggleSidebar" />
      <div class="layout-content">
        <router-view v-slot="{ Component, route }">
          <transition :name="isMobile ? 'fade' : transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
      <!-- 移动端底部导航 -->
      <MobileNav v-if="isMobile" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import gsap from 'gsap'
import Sidebar from './Sidebar/index.vue'
import Header from './Header/index.vue'
import MobileNav from './MobileNav.vue'

const router = useRouter()
const route = useRoute()
const isMobile = ref(window.innerWidth < 768)
const sidebarCollapsed = ref(isMobile.value) // mobile starts hidden, desktop starts expanded
const mainRef = ref(null)

// Mobile detection
let mqMobile
function checkMobile() {
  const mobile = window.innerWidth < 768
  if (isMobile.value !== mobile) {
    isMobile.value = mobile
    // When switching to mobile, hide sidebar; when switching to desktop, show it expanded
    sidebarCollapsed.value = mobile ? true : false
  }
}
onMounted(() => {
  // Ensure correct initial state
  checkMobile()
  mqMobile = window.matchMedia('(max-width: 767px)')
  mqMobile.addEventListener('change', checkMobile)
})
onUnmounted(() => {
  mqMobile?.removeEventListener('change', checkMobile)
})

// Track navigation direction for push/pop transitions
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
  // Close sidebar on mobile when navigating
  if (isMobile.value) sidebarCollapsed.value = true
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

watch(sidebarCollapsed, (collapsed) => {
  if (isMobile.value) return // Mobile uses overlay, no margin shift
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

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

.layout-main.is-mobile .layout-content {
  padding: 12px 12px 72px;
}

@media (max-width: 767px) {
  .layout-main {
    margin-left: 0 !important;
  }
}
</style>
