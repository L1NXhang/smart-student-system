<template>
  <span ref="elRef" class="blur-text" :style="{ '--blur-duration': duration + 's', '--blur-delay': delay + 's' }">
    <span
      v-for="(word, wi) in words"
      :key="wi"
      class="blur-word"
    >
      <span
        v-for="(char, ci) in word"
        :key="ci"
        class="blur-char"
        :style="{ animationDelay: (wi * word.length + ci) * stagger + delay + 's' }"
      >{{ char }}</span>
      <span v-if="wi < words.length - 1" class="blur-space">&nbsp;</span>
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, default: '' },
  delay: { type: Number, default: 0 },
  stagger: { type: Number, default: 0.04 },
  duration: { type: Number, default: 0.6 },
  blur: { type: Number, default: 8 },
})

const words = computed(() => props.text.split(' '))
</script>

<style scoped>
.blur-text {
  display: inline;
}
.blur-word {
  display: inline;
}
.blur-char {
  display: inline-block;
  filter: blur(var(--blur, 8px));
  opacity: 0;
  animation: blurReveal var(--blur-duration) cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--blur-delay);
}

@keyframes blurReveal {
  0% {
    filter: blur(var(--blur, 8px));
    opacity: 0;
  }
  100% {
    filter: blur(0);
    opacity: 1;
  }
}
</style>
