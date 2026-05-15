<template>
  <span ref="elRef" class="decrypted-text" :style="{ fontFamily: fontFamily }">
    {{ displayText }}
  </span>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  text: { type: String, default: '' },
  speed: { type: Number, default: 40 },
  chars: { type: String, default: '!@#$%^&*()[]{}<>?|/~abcdefghijklmnopqrstuvwxyz0123456789' },
  fontFamily: { type: String, default: 'monospace' },
})

const elRef = ref(null)
const displayText = ref('')
let intervalId = null
let frame = 0
let revealIndex = 0

function scramble() {
  revealIndex = 0
  frame = 0
  const target = props.text
  const maxFrames = target.length * 1.2

  clearInterval(intervalId)
  intervalId = setInterval(() => {
    frame++
    revealIndex = Math.floor((frame / maxFrames) * target.length)

    let result = ''
    for (let i = 0; i < target.length; i++) {
      if (i < revealIndex) {
        result += target[i]
      } else {
        result += props.chars[Math.floor(Math.random() * props.chars.length)]
      }
    }
    displayText.value = result

    if (revealIndex >= target.length) {
      displayText.value = target
      clearInterval(intervalId)
    }
  }, props.speed)
}

onMounted(() => {
  if (props.text) scramble()
})

watch(() => props.text, () => {
  if (props.text) scramble()
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>
