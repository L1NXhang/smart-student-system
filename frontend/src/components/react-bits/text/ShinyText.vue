<template>
  <span ref="elRef" class="shiny-text" :style="shinyStyle">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  speed: { type: Number, default: 3 },
  color: { type: String, default: '#ffffff' },
})

const shinyStyle = computed(() => ({
  '--shiny-speed': props.speed + 's',
  '--shiny-color': props.color,
}))
</script>

<style scoped>
.shiny-text {
  display: inline-block;
  background: linear-gradient(
    105deg,
    var(--shiny-color) 20%,
    rgba(255, 255, 255, 0.9) 30%,
    var(--shiny-color) 40%,
    var(--shiny-color) 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine var(--shiny-speed) linear infinite;
}

@keyframes shine {
  to { background-position: 200% center; }
}
</style>
