import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

export function useParticles(options = {}) {
  const canvasRef = ref(null)
  let ctx = null
  let particles = []
  let animationId = null
  let canvas = null

  const defaults = {
    count: options.count || 50,
    color: options.color || 'rgba(64, 158, 255, 0.15)',
    minSize: options.minSize || 1,
    maxSize: options.maxSize || 3,
    speed: options.speed || 0.3,
    connectDistance: options.connectDistance || 120,
  }

  function createParticle(w, h) {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * defaults.speed,
      vy: (Math.random() - 0.5) * defaults.speed,
      size: defaults.minSize + Math.random() * (defaults.maxSize - defaults.minSize),
    }
  }

  function resize() {
    if (!canvas) return
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
  }

  function animate() {
    if (!canvas || !ctx) return
    const w = canvas.width / (window.devicePixelRatio || 1)
    const h = canvas.height / (window.devicePixelRatio || 1)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = defaults.color
      ctx.fill()

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]
        const dx = p.x - p2.x
        const dy = p.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < defaults.connectDistance) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = `rgba(64, 158, 255, ${0.08 * (1 - dist / defaults.connectDistance)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    animationId = requestAnimationFrame(animate)
  }

  onMounted(() => {
    canvas = canvasRef.value
    if (!canvas) return
    ctx = canvas.getContext('2d')
    resize()
    particles = Array.from({ length: defaults.count }, () => createParticle(canvas.width, canvas.height))
    animate()
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resize)
  })

  return { canvasRef }
}
