<template>
  <div ref="elRef" class="tilt-card" @mousemove="onMove" @mouseleave="onLeave">
    <div ref="innerRef" class="tilt-card-inner">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  maxTilt: { type: Number, default: 10 },
  scale: { type: Number, default: 1.02 },
  speed: { type: Number, default: 0.4 },
})

const elRef = ref(null)
const innerRef = ref(null)
let bounds = null

function onMove(e) {
  if (!elRef.value) return
  const rect = elRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  const rotateX = (y - 0.5) * -props.maxTilt
  const rotateY = (x - 0.5) * props.maxTilt
  gsap.to(innerRef.value, {
    rotateX,
    rotateY,
    scale: props.scale,
    duration: props.speed,
    ease: 'power2.out',
  })
}

function onLeave() {
  gsap.to(innerRef.value, {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    duration: props.speed,
    ease: 'power2.out',
  })
}
</script>

<style scoped>
.tilt-card {
  perspective: 800px;
  transform-style: preserve-3d;
}
.tilt-card-inner {
  transform-style: preserve-3d;
  will-change: transform;
}
</style>
