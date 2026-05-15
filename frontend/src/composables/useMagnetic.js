import { ref, reactive, onUnmounted } from 'vue'
import gsap from 'gsap'

export function useMagnetic(strength = 0.3) {
  const elementRef = ref(null)
  const position = reactive({ x: 0, y: 0 })
  let bounds = null
  let anim = null

  const onMouseMove = (e) => {
    if (!bounds) return
    const centerX = bounds.left + bounds.width / 2
    const centerY = bounds.top + bounds.height / 2
    const dx = (e.clientX - centerX) * strength
    const dy = (e.clientY - centerY) * strength
    anim = gsap.to(elementRef.value, {
      x: dx,
      y: dy,
      duration: 0.6,
      ease: 'power3.out',
    })
  }

  const onMouseLeave = () => {
    anim = gsap.to(elementRef.value, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)',
    })
  }

  const bind = (el) => {
    elementRef.value = el
    if (el) {
      bounds = el.getBoundingClientRect()
      el.addEventListener('mousemove', onMouseMove)
      el.addEventListener('mouseleave', onMouseLeave)
    }
  }

  onUnmounted(() => {
    if (elementRef.value) {
      elementRef.value.removeEventListener('mousemove', onMouseMove)
      elementRef.value.removeEventListener('mouseleave', onMouseLeave)
    }
  })

  return { position, bind }
}
