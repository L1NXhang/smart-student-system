<template>
  <div ref="elRef" class="masonry" :style="{ columns: columns }">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="masonry-item"
    >
      <slot :item="item" :index="index" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  items: { type: Array, default: () => [] },
  columns: { type: [Number, String], default: 3 },
  gap: { type: Number, default: 16 },
  animate: { type: Boolean, default: true },
})

const elRef = ref(null)

onMounted(() => {
  if (!props.animate) return
  nextTick(() => {
    const items = elRef.value?.querySelectorAll('.masonry-item')
    if (items) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.06,
          duration: 0.5,
          ease: 'power2.out',
        }
      )
    }
  })
})
</script>

<style scoped>
.masonry {
  column-gap: v-bind('props.gap + "px"');
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: v-bind('props.gap + "px"');
}

@media (max-width: 768px) {
  .masonry {
    columns: 1 !important;
  }
}
</style>
