<template>
  <div ref="elRef" class="star-border" :style="starStyle">
    <div class="star-border-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: { type: String, default: '#409EFF' },
  speed: { type: Number, default: 3 },
  width: { type: String, default: '2px' },
  radius: { type: String, default: '12px' },
})

const starStyle = computed(() => ({
  '--sb-color': props.color,
  '--sb-speed': props.speed + 's',
  '--sb-width': props.width,
  '--sb-radius': props.radius,
}))
</script>

<style scoped>
.star-border {
  position: relative;
  border-radius: var(--sb-radius);
  padding: var(--sb-width);
  background: conic-gradient(
    from var(--angle, 0deg),
    transparent 70%,
    var(--sb-color)
  );
  animation: starRotate var(--sb-speed) linear infinite;
}

.star-border-content {
  background: #fff;
  border-radius: calc(var(--sb-radius) - 2px);
  padding: inherit;
}

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes starRotate {
  0% { --angle: 0deg; }
  100% { --angle: 360deg; }
}
</style>
