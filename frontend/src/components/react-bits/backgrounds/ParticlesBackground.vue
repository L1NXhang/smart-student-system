<template>
  <canvas ref="canvasRef" class="particles-bg" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  count: { type: Number, default: 60 },
  color: { type: String, default: 'rgba(64, 158, 255, 0.12)' },
  connectColor: { type: String, default: 'rgba(64, 158, 255, 0.06)' },
  speed: { type: Number, default: 0.3 },
  connectDistance: { type: Number, default: 130 },
})

const canvasRef = ref(null)
let ctx = null
let canvas = null
let particles = []
let animId = null

function create(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * props.speed,
    vy: (Math.random() - 0.5) * props.speed,
    size: 1 + Math.random() * 2.5,
  }
}

function resize() {
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = canvas.offsetWidth * dpr
  canvas.height = canvas.offsetHeight * dpr
}

function loop() {
  if (!ctx || !canvas) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.scale(dpr, dpr)

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    if (p.x < -20) p.x = w + 20
    if (p.x > w + 20) p.x = -20
    if (p.y < -20) p.y = h + 20
    if (p.y > h + 20) p.y = -20

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = props.color
    ctx.fill()

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j]
      const dx = p.x - p2.x
      const dy = p.y - p2.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < props.connectDistance) {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = props.connectColor
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  animId = requestAnimationFrame(loop)
}

onMounted(() => {
  canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resize()
  const dpr = window.devicePixelRatio || 1
  particles = Array.from({ length: props.count }, () => create(canvas.width / dpr, canvas.height / dpr))
  loop()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.particles-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
