'use client'

import { useState, useEffect } from 'react'

interface TypeWriterProps {
  text: string
  speed?: number
  delay?: number
  showCursor?: boolean
  onComplete?: () => void
  className?: string
}

export function TypeWriter({
  text,
  speed = 50,
  delay = 0,
  showCursor = true,
  onComplete,
  className = '',
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setHasStarted(true)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!hasStarted) return

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)

      return () => clearTimeout(timeout)
    } else {
      setIsComplete(true)
      onComplete?.()
    }
  }, [displayedText, text, speed, hasStarted, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && (
        <span className="cursor" />
      )}
    </span>
  )
}
