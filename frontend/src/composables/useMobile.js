import { ref, onMounted, onUnmounted } from 'vue'

export function useMobile() {
  const isMobile = ref(false)
  const isReducedMotion = ref(false)

  onMounted(() => {
    const mqMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)')
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    isMobile.value = mqMobile.matches
    isReducedMotion.value = mqReduce.matches

    const onMobile = (e) => { isMobile.value = e.matches }
    const onReduce = (e) => { isReducedMotion.value = e.matches }

    mqMobile.addEventListener('change', onMobile)
    mqReduce.addEventListener('change', onReduce)

    onUnmounted(() => {
      mqMobile.removeEventListener('change', onMobile)
      mqReduce.removeEventListener('change', onReduce)
    })
  })

  return { isMobile, isReducedMotion }
}
