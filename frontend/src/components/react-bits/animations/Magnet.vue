<template>
  <div ref="elRef" class="magnet" @mouseenter="onEnter" @mouseleave="onLeave">
    <div ref="innerRef" class="magnet-inner">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  strength: { type: Number, default: 0.3 },
  radius: { type: Number, default: 200 },
})

const elRef = ref(null)
const innerRef = ref(null)
let bounds = null

function onEnter() {
  if (elRef.value) {
    bounds = elRef.value.getBoundingClientRect()
    elRef.value.addEventListener('mousemove', onMove)
  }
}

function onLeave() {
  elRef.value?.removeEventListener('mousemove', onMove)
  gsap.to(innerRef.value, {
    x: 0,
    y: 0,
    rotation: 0,
    duration: 0.5,
    ease: 'elastic.out(1, 0.4)',
  })
}

function onMove(e) {
  if (!bounds) return
  const cx = bounds.left + bounds.width / 2
  const cy = bounds.top + bounds.height / 2
  const dx = (e.clientX - cx) * props.strength
  const dy = (e.clientY - cy) * props.strength
  gsap.to(innerRef.value, {
    x: dx,
    y: dy,
    duration: 0.4,
    ease: 'power3.out',
  })
}
</script>

<style scoped>
.magnet {
  display: inline-block;
  overflow: visible;
}
.magnet-inner {
  will-change: transform;
}
</style>
