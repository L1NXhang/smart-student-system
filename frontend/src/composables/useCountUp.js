import { ref, onUnmounted } from 'vue'
import gsap from 'gsap'

export function useCountUp(endValue, options = {}) {
  const display = ref(0)
  let tween = null

  const start = (end = endValue) => {
    if (tween) tween.kill()
    const proxy = { v: 0 }
    tween = gsap.to(proxy, {
      v: end,
      duration: options.duration || 1.5,
      delay: options.delay || 0,
      ease: options.ease || 'power2.out',
      snap: { v: 1 },
      onUpdate() {
        display.value = Math.round(proxy.v)
      },
    })
  }

  onUnmounted(() => {
    tween?.kill()
  })

  return { display, start }
}
