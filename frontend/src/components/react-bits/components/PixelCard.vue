<template>
  <div ref="elRef" class="pixel-card" :class="{ 'is-hovered': isHovered }">
    <canvas ref="canvasRef" class="pixel-canvas" />
    <div class="pixel-card-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  color: { type: String, default: '#409EFF' },
  gridSize: { type: Number, default: 6 },
})

const elRef = ref(null)
const canvasRef = ref(null)
const isHovered = ref(false)
let ctx = null
let animId = null
let shimmerOffset = 0
let canvas = null

function draw() {
  if (!ctx || !canvas) return
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  const gs = props.gridSize
  const offset = shimmerOffset % (gs * 2)
  for (let x = 0; x < w; x += gs) {
    for (let y = 0; y < h; y += gs) {
      const dist = Math.abs(x - w / 2) + Math.abs(y - h / 2)
      const alpha = isHovered.value
        ? 0.1 + 0.15 * Math.sin((dist + offset) * 0.1)
        : 0.02 + 0.04 * Math.sin((dist + shimmerOffset * 0.3) * 0.08)
      ctx.fillStyle = props.color
      ctx.globalAlpha = alpha
      ctx.fillRect(x, y, gs - 1, gs - 1)
    }
  }
  ctx.globalAlpha = 1
  shimmerOffset += isHovered.value ? 3 : 0.5
  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  canvas = canvasRef.value
  if (!canvas) return
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
  ctx = canvas.getContext('2d')
  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
})
</script>

<style scoped>
.pixel-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}
.pixel-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  z-index: 0;
}
.pixel-card-content {
  position: relative;
  z-index: 1;
}
</style>
