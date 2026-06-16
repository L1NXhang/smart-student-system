<template>
  <div ref="elRef" class="reveal" :class="{ 'is-revealed': isRevealed }">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  threshold: { type: Number, default: 0.1 },
  rootMargin: { type: String, default: '0px 0px -30px 0px' },
  delay: { type: Number, default: 0 },
  once: { type: Boolean, default: true },
})

const elRef = ref(null)
const isRevealed = ref(false)
let observer = null
let triggered = false

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !triggered) {
        triggered = props.once
        setTimeout(() => { isRevealed.value = true }, props.delay * 1000)
      } else if (!props.once && !entry.isIntersecting) {
        triggered = false
        isRevealed.value = false
      }
    },
    { threshold: props.threshold, rootMargin: props.rootMargin }
  )
  if (elRef.value) observer.observe(elRef.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.is-revealed {
  opacity: 1;
  transform: translateY(0);
}
</style>
