<template>
  <div ref="elRef" class="grid-motion-bg">
    <canvas ref="canvasRef" class="grid-canvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  color: { type: String, default: 'rgba(64, 158, 255, 0.08)' },
  gridSize: { type: Number, default: 50 },
  speed: { type: Number, default: 0.3 },
})

const elRef = ref(null)
const canvasRef = ref(null)
let ctx = null
let canvas = null
let animId = null
let offset = 0

function resize() {
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = canvas.offsetWidth * dpr
  canvas.height = canvas.offsetHeight * dpr
}

function draw() {
  if (!ctx || !canvas) return
  const dpr = window.devicePixelRatio || 1
  const w = canvas.width / dpr
  const h = canvas.height / dpr
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.scale(dpr, dpr)
  ctx.strokeStyle = props.color
  ctx.lineWidth = 0.5

  offset = (offset + props.speed * 0.1) % props.gridSize

  for (let x = offset; x < w; x += props.gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = offset; y < h; y += props.gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  animId = requestAnimationFrame(draw)
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
.grid-motion-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.grid-canvas {
  width: 100%;
  height: 100%;
}
</style>
