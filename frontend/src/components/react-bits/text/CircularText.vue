<template>
  <div ref="elRef" class="circular-text" :style="circleStyle">
    <svg viewBox="0 0 200 200" class="circular-svg">
      <defs>
        <path id="circle-path" :d="circlePath" />
      </defs>
      <text :font-size="fontSize" :fill="color" :font-weight="fontWeight" letter-spacing="1">
        <textPath href="#circle-path" startOffset="50%" text-anchor="middle">
          {{ text }}&nbsp;&nbsp;{{ text }}
        </textPath>
      </text>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  text: { type: String, default: 'CIRCULAR TEXT' },
  radius: { type: Number, default: 80 },
  fontSize: { type: Number, default: 14 },
  color: { type: String, default: '#409EFF' },
  fontWeight: { type: Number, default: 600 },
  speed: { type: Number, default: 10 },
})

const elRef = ref(null)

const circlePath = computed(() => {
  const r = props.radius
  const ox = 100 - r
  const oy = 100 - r
  return `M ${ox},100 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`
})

const circleStyle = computed(() => ({
  width: '200px',
  height: '200px',
}))

onMounted(() => {
  if (elRef.value) {
    const svg = elRef.value.querySelector('svg')
    gsap.to(svg, {
      rotation: 360,
      duration: props.speed,
      repeat: -1,
      ease: 'none',
    })
  }
})
</script>

<style scoped>
.circular-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.circular-svg {
  width: 100%;
  height: 100%;
}
</style>
