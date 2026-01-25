'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TypedCommandProps {
  command: string
  delay?: number
}

export function TypedCommand({ command, delay = 0 }: TypedCommandProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setStarted(true)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    let index = 0
    const interval = setInterval(() => {
      if (index < command.length) {
        setDisplayedText(command.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [command, started])

  return (
    <span style={{ fontFamily: 'monospace' }}>
      <span style={{ color: '#71717a' }}>$ </span>
      <span style={{ color: '#22c55e' }}>{displayedText}</span>
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{
            display: 'inline-block',
            width: '8px',
            height: '16px',
            background: '#22c55e',
            marginLeft: '2px',
            verticalAlign: 'middle',
          }}
        />
      )}
    </span>
  )
}
