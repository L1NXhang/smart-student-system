<template>
  <Teleport to="body">
    <canvas ref="canvasRef" class="cursor-trail" aria-hidden="true" />
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  count: { type: Number, default: 20 },
  color: { type: String, default: '37, 99, 235' },
  size: { type: Number, default: 4 },
  lifetime: { type: Number, default: 0.6 },
})

const canvasRef = ref(null)
let ctx = null
let canvas = null
let particles = []
let mouse = { x: -100, y: -100 }
let animId = null
let isMobile = false
const history = []

function onMouseMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  history.push({ x: mouse.x, y: mouse.y, t: performance.now() })
  if (history.length > 30) history.shift()
}

function createParticle(x, y) {
  return {
    x: x + (Math.random() - 0.5) * 8,
    y: y + (Math.random() - 0.5) * 8,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    life: 1,
    size: Math.random() * props.size + 1,
  }
}

function loop() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Spawn particles from mouse history trail
  if (mouse.x > 0 && mouse.y > 0) {
    for (let i = 0; i < 2; i++) {
      const h = history[history.length - 1 - Math.floor(Math.random() * Math.min(history.length, 5))]
      if (h) particles.push(createParticle(h.x, h.y))
    }
  }

  particles = particles.filter((p) => p.life > 0)
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.015
    const alpha = p.life * 0.6
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${props.color}, ${alpha})`
    ctx.fill()
  }

  if (particles.length > 50) particles.splice(0, particles.length - 50)
  animId = requestAnimationFrame(loop)
}

function resize() {
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

onMounted(() => {
  isMobile = window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  if (isMobile) return

  canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resize()
  loop()
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.cursor-trail {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: var(--z-cursor-trail, 9999);
}
</style>
