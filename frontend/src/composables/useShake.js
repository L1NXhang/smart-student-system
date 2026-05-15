import gsap from 'gsap'

export function useShake() {
  const trigger = (elementRef) => {
    if (!elementRef) return
    gsap.fromTo(
      elementRef,
      { x: 0 },
      { x: -6, duration: 0.05, repeat: 5, yoyo: true, ease: 'power2.inOut' }
    )
  }
  return { trigger }
}
