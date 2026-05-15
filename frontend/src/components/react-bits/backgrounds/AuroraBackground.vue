<template>
  <canvas ref="canvasRef" class="aurora-bg" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  color1: { type: String, default: '#4fc3f7' },
  color2: { type: String, default: '#81c784' },
  color3: { type: String, default: '#ce93d8' },
  color4: { type: String, default: '#64ffda' },
  speed: { type: Number, default: 0.5 },
  intensity: { type: Number, default: 1.0 },
})

const canvasRef = ref(null)
let ctx = null
let canvas = null
let animId = null
let time = 0
let w = 0
let h = 0
let dpr = 1

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

const c1 = hexToRgb(props.color1)
const c2 = hexToRgb(props.color2)
const c3 = hexToRgb(props.color3)
const c4 = hexToRgb(props.color4)

function draw() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, w * dpr, h * dpr)
  ctx.save()
  ctx.scale(dpr, dpr)

  const t = time
  const I = props.intensity

  // ── Aurora curtain 1: sweeping from top-left ──
  for (let y = 0; y < h; y += 2) {
    const py = y / h

    // Multi-frequency undulation
    const wave1 = Math.sin(y * 0.012 + t * 0.6) * 0.25
    const wave2 = Math.cos(y * 0.007 + t * 0.35) * 0.3
    const wave3 = Math.sin(y * 0.018 - t * 0.45) * 0.15
    const wave4 = Math.cos(y * 0.004 + t * 0.55) * 0.2
    const totalWave = wave1 + wave2 + wave3 + wave4

    const xCenter = w * (0.35 + totalWave)
    const spread = 180 + Math.sin(y * 0.009 + t * 0.5) * 60

    // Shimmer: brightness pulses with time
    const shimmer = 1 + Math.sin(y * 0.03 + t * 1.8) * 0.3 + Math.cos(y * 0.02 + t * 1.2) * 0.2

    const dist = 1 - Math.abs(py - 0.3) * 1.5
    const fade = Math.max(0, dist) * Math.max(0, 1 - Math.abs(py - 0.3) * 2.5)

    if (fade > 0.01) {
      const alpha = fade * 0.18 * I * shimmer
      const grad = ctx.createLinearGradient(xCenter - spread, y, xCenter + spread, y)
      grad.addColorStop(0, `rgba(${c1[0]},${c1[1]},${c1[2]},0)`)
      grad.addColorStop(0.3, `rgba(${c1[0]},${c1[1]},${c1[2]},${alpha * 0.5})`)
      grad.addColorStop(0.5, `rgba(${c1[0]},${c1[1]},${c1[2]},${alpha})`)
      grad.addColorStop(0.7, `rgba(${c4[0]},${c4[1]},${c4[2]},${alpha * 0.3})`)
      grad.addColorStop(1, `rgba(${c1[0]},${c1[1]},${c1[2]},0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, y, w, 2)
    }
  }

  // ── Aurora curtain 2: lower, warmer tone ──
  for (let y = 0; y < h; y += 2) {
    const py = y / h

    const wave1 = Math.cos(y * 0.008 + t * 0.4) * 0.3
    const wave2 = Math.sin(y * 0.011 - t * 0.3) * 0.2
    const wave3 = Math.cos(y * 0.005 + t * 0.5) * 0.25
    const totalWave = wave1 + wave2 + wave3

    const xCenter = w * (0.55 + totalWave)
    const spread = 200 + Math.cos(y * 0.006 + t * 0.6) * 70

    const shimmer = 1 + Math.sin(y * 0.025 + t * 1.5) * 0.35 + Math.cos(y * 0.015 + t * 1.0) * 0.25

    const dist = 1 - Math.abs(py - 0.55) * 1.8
    const fade = Math.max(0, dist) * Math.max(0, 1 - Math.abs(py - 0.55) * 2.2)

    if (fade > 0.01) {
      const alpha = fade * 0.16 * I * shimmer
      const grad = ctx.createLinearGradient(xCenter - spread, y, xCenter + spread, y)
      grad.addColorStop(0, `rgba(${c2[0]},${c2[1]},${c2[2]},0)`)
      grad.addColorStop(0.4, `rgba(${c3[0]},${c3[1]},${c3[2]},${alpha * 0.4})`)
      grad.addColorStop(0.5, `rgba(${c2[0]},${c2[1]},${c2[2]},${alpha})`)
      grad.addColorStop(0.6, `rgba(${c4[0]},${c4[1]},${c4[2]},${alpha * 0.35})`)
      grad.addColorStop(1, `rgba(${c2[0]},${c2[1]},${c2[2]},0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, y, w, 2)
    }
  }

  // ── Aurora curtain 3: subtle high band ──
  for (let y = 0; y < h; y += 3) {
    const py = y / h

    const wave1 = Math.sin(y * 0.01 + t * 0.55) * 0.28
    const wave2 = Math.cos(y * 0.006 - t * 0.4) * 0.22
    const totalWave = wave1 + wave2

    const xCenter = w * (0.45 + totalWave)
    const spread = 160 + Math.sin(y * 0.007 + t * 0.7) * 50

    const shimmer = 1 + Math.sin(y * 0.02 + t * 2.0) * 0.4

    const dist = 1 - Math.abs(py - 0.15) * 2.0
    const fade = Math.max(0, dist) * Math.max(0, 1 - Math.abs(py - 0.15) * 3.0)

    if (fade > 0.01) {
      const alpha = fade * 0.12 * I * shimmer
      const grad = ctx.createLinearGradient(xCenter - spread, y, xCenter + spread, y)
      grad.addColorStop(0, `rgba(${c3[0]},${c3[1]},${c3[2]},0)`)
      grad.addColorStop(0.5, `rgba(${c3[0]},${c3[1]},${c3[2]},${alpha})`)
      grad.addColorStop(1, `rgba(${c3[0]},${c3[1]},${c3[2]},0)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, y, w, 3)
    }
  }

  ctx.restore()
  time += props.speed * 0.016
  animId = requestAnimationFrame(draw)
}

function resize() {
  if (!canvas) return
  dpr = Math.min(window.devicePixelRatio || 1, 2) // cap at 2x for perf
  canvas.width = w * dpr
  canvas.height = h * dpr
  w = canvas.offsetWidth
  h = canvas.offsetHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
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
