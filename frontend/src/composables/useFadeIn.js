import { ref, onMounted } from 'vue'
import gsap from 'gsap'

export function useFadeIn(config = {}) {
  const targetRef = ref(null)
  const isVisible = ref(false)

  const animate = (selector, options = {}) => {
    const el = typeof selector === 'string' ? document.querySelectorAll(selector) : selector
    if (!el || (el.length === 0)) return null
    return gsap.fromTo(
      el,
      { opacity: 0, y: options.y ?? 30 },
      {
        opacity: 1,
        y: 0,
        duration: options.duration || 0.5,
        stagger: options.stagger || 0.08,
        delay: options.delay || 0,
        ease: options.ease || 'power3.out',
      }
    )
  }

  const animateIn = (target, opts = {}) => {
    if (!target) return
    gsap.fromTo(
      target,
      { opacity: 0, y: opts.y ?? 40 },
      {
        opacity: 1,
        y: 0,
        duration: opts.duration || 0.6,
        delay: opts.delay || 0,
        ease: opts.ease || 'power3.out',
      }
    )
  }

  onMounted(() => {
    if (config.selector) {
      setTimeout(() => animate(config.selector, config), config.delay || 100)
    }
    isVisible.value = true
  })

  return { targetRef, isVisible, animate, animateIn }
}
