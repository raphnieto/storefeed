import { useEffect, useRef } from 'react'
import './NeuralNetBackground.css'

type Node = {
  baseX: number
  baseY: number
  phase: number
  speed: number
  amplitude: number
  hot: boolean
}

const NODE_LAYOUT: Array<[number, number, boolean]> = [
  [0.08, 0.12, false],
  [0.18, 0.28, false],
  [0.32, 0.08, true],
  [0.45, 0.22, false],
  [0.58, 0.1, false],
  [0.72, 0.18, true],
  [0.88, 0.32, false],
  [0.95, 0.55, false],
  [0.82, 0.68, false],
  [0.68, 0.82, true],
  [0.52, 0.92, false],
  [0.35, 0.78, false],
  [0.2, 0.88, false],
  [0.06, 0.62, false],
  [0.14, 0.48, true],
  [0.28, 0.42, false],
  [0.42, 0.52, false],
  [0.55, 0.38, false],
  [0.7, 0.48, false],
  [0.84, 0.5, false],
  [0.62, 0.62, false],
  [0.48, 0.68, true],
  [0.3, 0.58, false],
  [0.38, 0.18, false],
  [0.62, 0.28, false],
  [0.76, 0.38, false],
  [0.22, 0.68, false],
  [0.5, 0.12, false],
  [0.9, 0.78, false],
  [0.1, 0.82, false],
]

const CONNECTION_DISTANCE = 0.19

function buildNodes(): Node[] {
  return NODE_LAYOUT.map(([baseX, baseY, hot], index) => ({
    baseX,
    baseY,
    phase: index * 0.7,
    speed: 0.18 + (index % 5) * 0.04,
    amplitude: hot ? 0.004 : 0.007,
    hot,
  }))
}

function nodePosition(node: Node, time: number, width: number, height: number) {
  const driftX =
    Math.sin(time * node.speed + node.phase) * node.amplitude * width
  const driftY =
    Math.cos(time * node.speed * 0.85 + node.phase * 1.1) *
    node.amplitude *
    height

  return {
    x: node.baseX * width + driftX,
    y: node.baseY * height + driftY,
  }
}

export function NeuralNetBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const nodes = buildNodes()
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (time: number) => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      const t = reducedMotion ? 0 : time * 0.001
      const positions = nodes.map((node) => nodePosition(node, t, width, height))

      for (let i = 0; i < positions.length; i += 1) {
        for (let j = i + 1; j < positions.length; j += 1) {
          const a = positions[i]
          const b = positions[j]
          const dx = (a.x - b.x) / width
          const dy = (a.y - b.y) / height
          const dist = Math.hypot(dx, dy)
          if (dist > CONNECTION_DISTANCE) continue

          const alpha = 0.08 + (1 - dist / CONNECTION_DISTANCE) * 0.14
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(110, 170, 255, ${alpha})`
          ctx.lineWidth = 0.75
          ctx.stroke()
        }
      }

      positions.forEach((point, index) => {
        const node = nodes[index]

        if (node.hot) {
          const glow = ctx.createRadialGradient(
            point.x,
            point.y,
            0,
            point.x,
            point.y,
            22,
          )
          glow.addColorStop(0, 'rgba(170, 120, 255, 0.55)')
          glow.addColorStop(0.45, 'rgba(120, 80, 220, 0.18)')
          glow.addColorStop(1, 'rgba(120, 80, 220, 0)')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(point.x, point.y, 22, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(point.x, point.y, node.hot ? 2.8 : 2, 0, Math.PI * 2)
        ctx.fillStyle = node.hot
          ? 'rgba(210, 180, 255, 0.95)'
          : 'rgba(130, 190, 255, 0.85)'
        ctx.fill()
      })
    }

    const loop = (time: number) => {
      draw(time)
      frameRef.current = window.requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)

    if (reducedMotion) {
      draw(0)
    } else {
      frameRef.current = window.requestAnimationFrame(loop)
    }

    return () => {
      window.removeEventListener('resize', resize)
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return (
    <div className="neural-net-bg" aria-hidden>
      <div className="neural-net-bg__gradient" />
      <canvas ref={canvasRef} className="neural-net-bg__canvas" />
      <div className="neural-net-bg__scanlines" />
      <div className="neural-net-bg__vignette" />
    </div>
  )
}
