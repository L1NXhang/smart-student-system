<template>
  <span ref="elRef" class="fuzzy-text" :class="{ 'is-fuzzy': fuzzy }">
    <slot />
  </span>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  blur: { type: Number, default: 4 },
  interval: { type: Number, default: 2000 },
  duration: { type: Number, default: 600 },
})

const elRef = ref(null)
const fuzzy = ref(false)
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    fuzzy.value = true
    setTimeout(() => { fuzzy.value = false }, props.duration)
  }, props.interval)
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.fuzzy-text {
  display: inline-block;
  transition: filter 0.1s ease;
}
.fuzzy-text.is-fuzzy {
  filter: blur(v-bind('props.blur + "px"'));
}
</style>
