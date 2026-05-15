<template>
  <span ref="elRef" class="glitch-text" :data-text="text || slotText">
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  active: { type: Boolean, default: true },
})

const slots = useSlots()
const slotText = computed(() => {
  const children = slots.default?.()
  if (!children) return ''
  return children.map(c => c.children || '').join('')
})
</script>

<style scoped>
.glitch-text {
  position: relative;
  display: inline-block;
}
.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.glitch-text:hover::before {
  opacity: 0.5;
  color: #ff0000;
  animation: glitchTop 0.3s infinite linear alternate-reverse;
}
.glitch-text:hover::after {
  opacity: 0.5;
  color: #00ffff;
  animation: glitchBottom 0.3s infinite linear alternate-reverse;
}

@keyframes glitchTop {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 1px); }
  80% { transform: translate(2px, -1px); }
  100% { transform: translate(0); }
}

@keyframes glitchBottom {
  0% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(2px, 2px); }
  60% { transform: translate(-2px, -1px); }
  80% { transform: translate(-2px, 1px); }
  100% { transform: translate(0); }
}
</style>
