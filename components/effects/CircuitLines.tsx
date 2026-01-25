'use client'

import { useEffect, useRef } from 'react'

interface Line {
  x: number
  y: number
  length: number
  direction: number // 0: right, 1: down, 2: left, 3: up
  speed: number
  life: number
}

export function CircuitLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const lines: Line[] = []
    const maxLines = 15

    const createLine = () => {
      const edge = Math.floor(Math.random() * 4)
      let x, y, direction

      switch (edge) {
        case 0: // top
          x = Math.random() * canvas.width
          y = 0
          direction = 1
          break
        case 1: // right
          x = canvas.width
          y = Math.random() * canvas.height
          direction = 2
          break
        case 2: // bottom
          x = Math.random() * canvas.width
          y = canvas.height
          direction = 3
          break
        default: // left
          x = 0
          y = Math.random() * canvas.height
          direction = 0
      }

      return {
        x,
        y,
        length: 0,
        direction,
        speed: 2 + Math.random() * 3,
        life: 100 + Math.random() * 200,
      }
    }

    const animate = () => {
      // Clear canvas without dark overlay for better visibility
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Add new lines
      if (lines.length < maxLines && Math.random() > 0.98) {
        lines.push(createLine())
      }

      // Update and draw lines
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i]

        // Move line
        switch (line.direction) {
          case 0: line.x += line.speed; break
          case 1: line.y += line.speed; break
          case 2: line.x -= line.speed; break
          case 3: line.y -= line.speed; break
        }

        line.length += line.speed
        line.life--

        // Random direction change
        if (Math.random() > 0.98) {
          line.direction = (line.direction + (Math.random() > 0.5 ? 1 : 3)) % 4
        }

        // Draw
        ctx.beginPath()
        ctx.strokeStyle = `rgba(34, 197, 94, ${Math.min(line.life / 100, 0.4)})`
        ctx.lineWidth = 1
        ctx.shadowColor = '#22c55e'
        ctx.shadowBlur = 5

        let endX = line.x
        let endY = line.y
        const segmentLength = 20

        switch (line.direction) {
          case 0: endX = line.x - segmentLength; break
          case 1: endY = line.y - segmentLength; break
          case 2: endX = line.x + segmentLength; break
          case 3: endY = line.y + segmentLength; break
        }

        ctx.moveTo(endX, endY)
        ctx.lineTo(line.x, line.y)
        ctx.stroke()

        // Draw node
        ctx.beginPath()
        ctx.arc(line.x, line.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = '#22c55e'
        ctx.fill()

        // Remove dead lines
        if (line.life <= 0 || line.x < -50 || line.x > canvas.width + 50 ||
            line.y < -50 || line.y > canvas.height + 50) {
          lines.splice(i, 1)
        }
      }

      ctx.shadowBlur = 0
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

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
        zIndex: 0,
        opacity: 0.3,
      }}
    />
  )
}
