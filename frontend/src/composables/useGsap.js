import { onUnmounted } from 'vue'
import gsap from 'gsap'

export function useGsap(fn) {
  let ctx = null

  const create = (scope) => {
    ctx = gsap.context(() => {
      fn()
    }, scope)
    return ctx
  }

  onUnmounted(() => {
    ctx?.revert()
  })

  return { create }
}
