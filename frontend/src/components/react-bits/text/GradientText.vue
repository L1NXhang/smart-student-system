<template>
  <span ref="elRef" class="gradient-text" :style="gradientStyle">
    <slot />
  </span>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const props = defineProps({
  from: { type: String, default: '#409EFF' },
  to: { type: String, default: '#67C23A' },
  speed: { type: Number, default: 4 },
  angle: { type: Number, default: 45 },
})

const elRef = ref(null)

const gradientStyle = computed(() => ({
  '--grad-from': props.from,
  '--grad-to': props.to,
  '--grad-speed': props.speed + 's',
  '--grad-angle': props.angle + 'deg',
  background: `linear-gradient(var(--grad-angle), ${props.from}, ${props.to})`,
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
  'background-clip': 'text',
}))
</script>

<style scoped>
.gradient-text {
  display: inline-block;
  font-weight: inherit;
}
</style>
