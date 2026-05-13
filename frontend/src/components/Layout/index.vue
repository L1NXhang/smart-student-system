<template>
  <div class="layout">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
    <div class="layout-main" :class="{ collapsed: sidebarCollapsed }" ref="mainRef">
      <Header :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
      <div class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import gsap from 'gsap'
import Sidebar from './Sidebar/index.vue'
import Header from './Header/index.vue'

const sidebarCollapsed = ref(false)
const mainRef = ref(null)

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

.layout-content {
  padding: 20px;
  background: var(--color-bg);
  min-height: calc(100vh - var(--header-height));
}
</style>
