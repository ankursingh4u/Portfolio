'use client'

import { useEffect, useState } from 'react'

export function CRTEffect() {
  const [flicker, setFlicker] = useState(false)

  useEffect(() => {
    // Random flicker effect
    const flickerInterval = setInterval(() => {
      if (Math.random() > 0.97) {
        setFlicker(true)
        setTimeout(() => setFlicker(false), 50 + Math.random() * 100)
      }
    }, 100)

    return () => clearInterval(flickerInterval)
  }, [])

  return (
    <>
      {/* Scanlines - very subtle */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9998,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0, 0, 0, 0.015) 3px,
            rgba(0, 0, 0, 0.015) 6px
          )`,
        }}
      />

      {/* Flicker overlay */}
      {flicker && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9997,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
        />
      )}

      {/* Vignette effect - subtle */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9996,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* RGB shift on edges */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9995,
          boxShadow: 'inset 0 0 100px rgba(34, 197, 94, 0.03)',
        }}
      />
    </>
  )
}
