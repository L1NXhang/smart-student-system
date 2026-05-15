<template>
  <div ref="elRef" class="carousel-wrapper">
    <div class="carousel-track" :style="trackStyle">
      <slot />
    </div>
    <button v-if="showArrows" class="carousel-arrow left" @click="prev">&lt;</button>
    <button v-if="showArrows" class="carousel-arrow right" @click="next">&gt;</button>
    <div v-if="showDots" class="carousel-dots">
      <span
        v-for="(_, i) in itemCount"
        :key="i"
        class="carousel-dot"
        :class="{ active: i === current }"
        @click="goTo(i)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  items: { type: Number, default: 3 },
  visible: { type: Number, default: 1 },
  gap: { type: Number, default: 16 },
  autoplay: { type: Boolean, default: false },
  interval: { type: Number, default: 3000 },
  showArrows: { type: Boolean, default: true },
  showDots: { type: Boolean, default: true },
})

const elRef = ref(null)
const current = ref(0)
const itemCount = props.items

const trackStyle = computed(() => ({
  transform: `translateX(-${current.value * (100 / props.visible)}%)`,
  gap: props.gap + 'px',
}))

function prev() {
  current.value = (current.value - 1 + itemCount) % itemCount
}

function next() {
  current.value = (current.value + 1) % itemCount
}

function goTo(i) {
  current.value = i
}

let timer = null
watch(current, () => {
  if (props.autoplay) {
    clearInterval(timer)
    timer = setInterval(next, props.interval)
  }
})

onMounted(() => {
  if (props.autoplay) {
    timer = setInterval(next, props.interval)
  }
})
</script>

<style scoped>
.carousel-wrapper {
  position: relative;
  overflow: hidden;
}
.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.3);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  z-index: 2;
}
.carousel-arrow.left { left: 8px; }
.carousel-arrow.right { right: 8px; }
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}
.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  cursor: pointer;
  transition: background 0.3s;
}
.carousel-dot.active {
  background: #409EFF;
  width: 20px;
  border-radius: 4px;
}
</style>
