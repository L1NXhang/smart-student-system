<template>
  <div ref="elRef" class="fade-content" :class="{ 'is-visible': isVisible }">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  threshold: { type: Number, default: 0.1 },
  rootMargin: { type: String, default: '0px 0px -40px 0px' },
  duration: { type: Number, default: 0.5 },
  delay: { type: Number, default: 0 },
  stagger: { type: Number, default: 0.06 },
  direction: { type: String, default: 'up' },
  distance: { type: Number, default: 40 },
  once: { type: Boolean, default: true },
})

const elRef = ref(null)
const isVisible = ref(false)
let observer = null
let triggered = false

const dirMap = { up: 'y', down: 'y', left: 'x', right: 'x' }
const valMap = { up: -1, down: 1, left: -1, right: 1 }

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !triggered) {
        triggered = props.once
        isVisible.value = true
        const prop = dirMap[props.direction] || 'y'
        const val = (valMap[props.direction] || -1) * props.distance
        const children = elRef.value?.children
        if (children && children.length) {
          gsap.fromTo(
            children,
            { [prop]: val, opacity: 0 },
            {
              [prop]: 0,
              opacity: 1,
              duration: props.duration,
              stagger: props.stagger,
              delay: props.delay,
              ease: 'power3.out',
            }
          )
        }
      } else if (!props.once && !entry.isIntersecting) {
        isVisible.value = false
      }
    },
    { threshold: props.threshold, rootMargin: props.rootMargin }
  )
  if (elRef.value) observer.observe(elRef.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.fade-content > :deep(*) {
  opacity: 0;
}
.fade-content.is-visible > :deep(*) {
  opacity: 1;
}
</style>
