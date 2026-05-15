<template>
  <div ref="elRef" class="split-text" :style="{ '--delay': delay + 's' }">
    <span
      v-for="(word, wi) in words"
      :key="wi"
      class="split-word"
    >
      <span
        v-for="(char, ci) in word"
        :key="ci"
        class="split-char"
        :style="{ animationDelay: (wi * word.length + ci) * stagger + delay + 's' }"
      >{{ char }}</span>
      <span v-if="wi < words.length - 1" class="split-space">&nbsp;</span>
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  text: { type: String, default: '' },
  delay: { type: Number, default: 0 },
  stagger: { type: Number, default: 0.03 },
  duration: { type: Number, default: 0.4 },
  direction: { type: String, default: 'up' },
  tag: { type: String, default: 'div' },
})

const elRef = ref(null)
const words = computed(() => props.text.split(' '))

const dirMap = { up: 20, down: -20, left: -20, right: 20 }
const propMap = { up: 'y', down: 'y', left: 'x', right: 'x' }

onMounted(() => {
  nextTick(() => {
    if (!elRef.value) return
    const chars = elRef.value.querySelectorAll('.split-char')
    const offset = dirMap[props.direction] || 20
    const prop = propMap[props.direction] || 'y'
    gsap.fromTo(
      chars,
      { [prop]: offset, opacity: 0 },
      {
        [prop]: 0,
        opacity: 1,
        duration: props.duration,
        stagger: props.stagger,
        delay: props.delay,
        ease: 'power3.out',
      }
    )
  })
})
</script>

<style scoped>
.split-text {
  display: inline;
}
.split-word {
  display: inline;
}
.split-char {
  display: inline-block;
}
.split-space {
  display: inline;
}
</style>
