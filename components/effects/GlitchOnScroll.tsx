'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlitchOnScrollProps {
  children: ReactNode
  className?: string
}

export function GlitchOnScroll({ children, className = '' }: GlitchOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isGlitching, setIsGlitching] = useState(false)
  const [hasGlitched, setHasGlitched] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasGlitched) {
          setIsGlitching(true)
          setHasGlitched(true)
          setTimeout(() => setIsGlitching(false), 300)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasGlitched])

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={isGlitching ? {
        x: [0, -2, 2, -2, 2, 0],
        filter: [
          'hue-rotate(0deg)',
          'hue-rotate(30deg)',
          'hue-rotate(-30deg)',
          'hue-rotate(30deg)',
          'hue-rotate(0deg)',
        ],
      } : {}}
      transition={{ duration: 0.2 }}
      style={{
        position: 'relative',
      }}
    >
      {children}

      {/* RGB split effect during glitch - subtle */}
      {isGlitching && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-1px',
              width: '100%',
              height: '100%',
              opacity: 0.3,
              color: '#ff0000',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          >
            {children}
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '1px',
              width: '100%',
              height: '100%',
              opacity: 0.3,
              color: '#00ffff',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          >
            {children}
          </div>
        </>
      )}
    </motion.div>
  )
}
