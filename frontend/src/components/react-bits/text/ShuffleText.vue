<template>
  <span ref="elRef" class="shuffle-text">
    {{ displayText }}
  </span>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  chars: { type: String, default: 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%' },
  speed: { type: Number, default: 30 },
})

const elRef = ref(null)
const displayText = ref('')
let intervalId = null

function shuffle() {
  clearInterval(intervalId)
  const target = props.text
  if (!target) { displayText.value = ''; return }
  displayText.value = Array.from({ length: target.length }, () =>
    props.chars[Math.floor(Math.random() * props.chars.length)]
  ).join('')

  let index = 0
  intervalId = setInterval(() => {
    if (index >= target.length) {
      displayText.value = target
      clearInterval(intervalId)
      return
    }
    const chars = displayText.value.split('')
    chars[index] = target[index]
    for (let i = index + 1; i < target.length; i++) {
      chars[i] = props.chars[Math.floor(Math.random() * props.chars.length)]
    }
    displayText.value = chars.join('')
    index++
  }, props.speed)
}

onMounted(() => shuffle())
watch(() => props.text, shuffle)
onUnmounted(() => clearInterval(intervalId))
</script>
