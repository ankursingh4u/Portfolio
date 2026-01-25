'use client'

import { useState, useEffect, useCallback } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
  glitchInterval?: number
  glitchDuration?: number
  enableGlitch?: boolean
}

export function GlitchText({
  text,
  className = '',
  glitchInterval = 3000,
  glitchDuration = 200,
  enableGlitch = true,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [displayText, setDisplayText] = useState(text)

  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`アイウエオ'

  const triggerGlitch = useCallback(() => {
    if (!enableGlitch) return

    setIsGlitching(true)

    // Scramble text briefly
    const scrambleInterval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char) =>
            Math.random() > 0.7
              ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
              : char
          )
          .join('')
      )
    }, 50)

    setTimeout(() => {
      clearInterval(scrambleInterval)
      setDisplayText(text)
      setIsGlitching(false)
    }, glitchDuration)
  }, [text, enableGlitch, glitchDuration, glitchChars])

  useEffect(() => {
    if (!enableGlitch) return

    const interval = setInterval(triggerGlitch, glitchInterval)
    return () => clearInterval(interval)
  }, [enableGlitch, glitchInterval, triggerGlitch])

  return (
    <span
      className={`relative inline-block ${className} ${
        isGlitching ? 'animate-glitch' : ''
      }`}
      data-text={text}
    >
      <span
        className={`relative z-10 ${
          isGlitching
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-cyan-500'
            : ''
        }`}
      >
        {displayText}
      </span>

      {/* Glitch layers */}
      {isGlitching && (
        <>
          <span
            className="absolute inset-0 text-red-500 opacity-70"
            style={{
              clipPath: 'inset(20% 0 30% 0)',
              transform: 'translateX(-2px)',
            }}
            aria-hidden="true"
          >
            {displayText}
          </span>
          <span
            className="absolute inset-0 text-cyan-500 opacity-70"
            style={{
              clipPath: 'inset(50% 0 20% 0)',
              transform: 'translateX(2px)',
            }}
            aria-hidden="true"
          >
            {displayText}
          </span>
        </>
      )}
    </span>
  )
}
