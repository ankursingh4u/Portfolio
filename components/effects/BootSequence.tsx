'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootSequenceProps {
  onComplete?: () => void
  duration?: number
}

const bootMessages = [
  { text: '> initializing system...', delay: 0 },
  { text: '> loading kernel modules...', delay: 200 },
  { text: '> mounting filesystems...', delay: 400 },
  { text: '> establishing secure connection...', delay: 600 },
  { text: '> authenticating user...', delay: 800 },
  { text: '> user: ankur_singh [AUTHENTICATED]', delay: 1000, highlight: true },
  { text: '> system ready.', delay: 1200, success: true },
]

export function BootSequence({
  onComplete,
  duration = 2000
}: BootSequenceProps) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    bootMessages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, index])
      }, message.delay)
    })

    setTimeout(() => {
      setIsComplete(true)
      onComplete?.()
    }, duration)
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-terminal-bg flex items-center justify-center"
        >
          <div className="font-mono text-sm space-y-1 max-w-lg px-6">
            {bootMessages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={
                  visibleMessages.includes(index)
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -10 }
                }
                transition={{ duration: 0.2 }}
                className={`
                  ${message.highlight ? 'text-terminal-accent' : ''}
                  ${message.success ? 'text-terminal-accent font-medium' : ''}
                  ${!message.highlight && !message.success ? 'text-terminal-dim' : ''}
                `}
              >
                {message.text}
                {index === visibleMessages[visibleMessages.length - 1] && (
                  <span className="inline-block w-2 h-4 bg-terminal-accent animate-cursor-blink ml-1" />
                )}
              </motion.div>
            ))}

            {/* Loading bar */}
            <motion.div
              className="mt-4 h-1 bg-terminal-border rounded overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-full bg-terminal-accent"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: duration / 1000, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
