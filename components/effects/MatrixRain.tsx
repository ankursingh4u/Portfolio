'use client'

import { useEffect, useRef } from 'react'

interface MatrixRainProps {
  opacity?: number
  speed?: number
  density?: number
}

export function MatrixRain({
  opacity = 0.3,
  speed = 1,
  density = 0.1
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Matrix characters
    const chars = 'アイウエオカキクケコサシスセソタチツテト01234567890ABCDEF<>/{}[]'
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)

    // Initialize drops
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100
    }

    // Animation
    let animationId: number

    const draw = () => {
      // Fade effect - more transparent for better content visibility
      ctx.fillStyle = 'rgba(10, 10, 11, 0.03)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        // Only draw some columns based on density
        if (Math.random() > density) continue

        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Random green shades
        const brightness = Math.random()
        if (brightness > 0.95) {
          ctx.fillStyle = '#fff'
        } else if (brightness > 0.8) {
          ctx.fillStyle = '#22c55e'
        } else {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.6)'
        }

        ctx.fillText(char, x, y)

        // Reset drop when it goes off screen
        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0
        }

        drops[i] += speed
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [speed, density])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity,
      }}
    />
  )
}
