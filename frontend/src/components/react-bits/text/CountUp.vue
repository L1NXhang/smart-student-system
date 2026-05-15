<template>
  <span ref="elRef" class="count-up">{{ displayValue }}</span>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  to: { type: Number, default: 0 },
  from: { type: Number, default: 0 },
  duration: { type: Number, default: 1.5 },
  delay: { type: Number, default: 0 },
  separator: { type: String, default: '' },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
})

const elRef = ref(null)
const displayValue = ref(props.prefix + props.from + props.suffix)
let tween = null

function start() {
  if (tween) tween.kill()
  const proxy = { v: props.from }
  tween = gsap.to(proxy, {
    v: props.to,
    duration: props.duration,
    delay: props.delay,
    ease: 'power2.out',
    snap: { v: 1 },
    onUpdate() {
      displayValue.value = props.prefix + Math.round(proxy.v).toLocaleString() + props.suffix
    },
  })
}

onMounted(() => {
  start()
})

watch(() => props.to, () => {
  start()
})
</script>

<style scoped>
.count-up {
  font-variant-numeric: tabular-nums;
}
</style>
