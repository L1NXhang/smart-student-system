<template>
  <div ref="elRef" class="dock" @mousemove="onMove" @mouseleave="onLeave">
    <slot />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  magnification: { type: Number, default: 2 },
  maxScale: { type: Number, default: 1.5 },
  baseScale: { type: Number, default: 1 },
})

const elRef = ref(null)

function onMove(e) {
  if (!elRef.value) return
  const items = elRef.value.querySelectorAll('.dock-item')
  const rect = elRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left

  items.forEach((item) => {
    const itemRect = item.getBoundingClientRect()
    const itemCenter = itemRect.left - rect.left + itemRect.width / 2
    const distance = Math.abs(mouseX - itemCenter)
    const maxDist = itemRect.width * props.magnification
    const scale = Math.max(
      props.baseScale,
      props.maxScale - (distance / maxDist) * (props.maxScale - props.baseScale)
    )
    gsap.to(item, {
      scale,
      duration: 0.3,
      ease: 'power2.out',
    })
  })
}

function onLeave() {
  if (!elRef.value) return
  const items = elRef.value.querySelectorAll('.dock-item')
  gsap.to(items, {
    scale: props.baseScale,
    duration: 0.4,
    ease: 'power3.out',
  })
}
</script>

<style scoped>
.dock {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px;
}
</style>
