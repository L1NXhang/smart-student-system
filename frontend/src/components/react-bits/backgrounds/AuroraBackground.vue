<template>
  <canvas ref="canvasRef" class="aurora-bg" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  color1: { type: String, default: '#64b5f6' },
  color2: { type: String, default: '#81c784' },
  color3: { type: String, default: '#ce93d8' },
  speed: { type: Number, default: 0.5 },
})

const canvasRef = ref(null)
let ctx = null
let canvas = null
let animId = null
let time = 0
let width = 0
let height = 0

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

const c1 = hexToRgb(props.color1)
const c2 = hexToRgb(props.color2)
const c3 = hexToRgb(props.color3)

function lerp(a, b, t) { return a + (b - a) * t }

function draw() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, width, height)

  for (let y = 0; y < height; y += 3) {
    const t = y / height
    const xNoise1 = Math.sin(y * 0.008 + time * 0.3) * 180 + width * 0.2 + Math.sin(y * 0.003 + time * 0.2) * 120
    const xNoise2 = Math.cos(y * 0.006 + time * 0.25) * 160 + width * 0.5 + Math.cos(y * 0.004 + time * 0.3) * 100
    const xNoise3 = Math.sin(y * 0.007 - time * 0.35) * 140 + width * 0.75 + Math.sin(y * 0.002 - time * 0.15) * 80

    const grad = ctx.createLinearGradient(0, y, width, y + 3)
    const stop1 = Math.max(0, Math.min(1, xNoise1 / width))
    const stop2 = Math.max(0, Math.min(1, xNoise2 / width))
    const stop3 = Math.max(0, Math.min(1, xNoise3 / width))

    grad.addColorStop(stop1, `rgba(${c1[0]},${c1[1]},${c1[2]},0.12)`)
    grad.addColorStop(stop2, `rgba(${c2[0]},${c2[1]},${c2[2]},0.10)`)
    grad.addColorStop(stop3, `rgba(${c3[0]},${c3[1]},${c3[2]},0.09)`)

    ctx.fillStyle = grad
    ctx.fillRect(0, y, width, 3)
  }

  time += props.speed * 0.01
  animId = requestAnimationFrame(draw)
}

function resize() {
  canvas.width = width = canvas.offsetWidth
  canvas.height = height = canvas.offsetHeight
}

onMounted(() => {
  canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  resize()
  draw()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.aurora-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
