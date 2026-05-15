<template>
  <TransitionGroup
    :tag="tag"
    :name="animationName"
    :appear="appear"
    :css="useCss"
  >
    <slot />
  </TransitionGroup>
</template>

<script setup>
const props = defineProps({
  animation: { type: String, default: 'fade-slide' },
  tag: { type: String, default: 'div' },
  stagger: { type: Number, default: 0.05 },
  appear: { type: Boolean, default: true },
})

const useCss = props.animation !== 'gsap'
const animationName = props.animation === 'fade-slide' ? 'anim-list' : props.animation
</script>

<style scoped>
.anim-list-enter-active {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.anim-list-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.anim-list-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.anim-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
