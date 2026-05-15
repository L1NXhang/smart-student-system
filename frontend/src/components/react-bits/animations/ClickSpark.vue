<template>
  <canvas ref="elRef" class="click-spark" :style="{ width: size + 'px', height: size + 'px' }" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  color: { type: String, default: '#409EFF' },
  size: { type: Number, default: 40 },
  count: { type: Number, default: 8 },
  duration: { type: Number, default: 0.6 },
})

const elRef = ref(null)
let canvas = null
let ctx = null
let particles = []
let animId = null

function burst(x, y) {
  particles = Array.from({ length: props.count }, (_, i) => {
    const angle = (Math.PI * 2 / props.count) * i + Math.random() * 0.3
    const speed = 0.5 + Math.random() * 1.5
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: 1 + Math.random() * 2,
    }
  })
  if (!animId) {
    animId = requestAnimationFrame(loop)
  }
}

function loop() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particles = particles.filter((p) => p.life > 0)
  particles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.02
    p.vx *= 0.98
    p.vy *= 0.98
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fillStyle = props.color
    ctx.globalAlpha = p.life
    ctx.fill()
  })
  ctx.globalAlpha = 1
  if (particles.length > 0) {
    animId = requestAnimationFrame(loop)
  } else {
    animId = null
  }
}

defineExpose({ burst })

onMounted(() => {
  canvas = elRef.value
  if (canvas) {
    canvas.width = props.size * 2
    canvas.height = props.size * 2
    ctx = canvas.getContext('2d')
  }
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
})
</script>

<style scoped>
.click-spark {
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9999;
}
</style>
