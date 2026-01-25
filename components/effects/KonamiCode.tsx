'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
]

export function KonamiCode() {
  const [input, setInput] = useState<string[]>([])
  const [activated, setActivated] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newInput = [...input, e.code].slice(-10)
      setInput(newInput)

      if (newInput.join(',') === KONAMI_CODE.join(',')) {
        setActivated(true)
        setShowMessage(true)
        setTimeout(() => setShowMessage(false), 5000)
        setTimeout(() => setActivated(false), 10000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [input])

  return (
    <>
      {/* Secret activated overlay */}
      <AnimatePresence>
        {activated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10000,
              background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1))',
              animation: 'rainbow 2s linear infinite',
            }}
          />
        )}
      </AnimatePresence>

      {/* Message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10001,
              background: 'rgba(10, 10, 11, 0.95)',
              border: '2px solid #22c55e',
              borderRadius: '8px',
              padding: '30px 50px',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(34, 197, 94, 0.5)',
            }}
          >
            <motion.div
              animate={{
                textShadow: [
                  '0 0 10px #22c55e',
                  '0 0 20px #22c55e',
                  '0 0 30px #22c55e',
                  '0 0 20px #22c55e',
                  '0 0 10px #22c55e',
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#22c55e',
                marginBottom: '10px',
              }}
            >
              ★ SECRET UNLOCKED ★
            </motion.div>
            <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#71717a' }}>
              You found the easter egg!
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#22c55e', marginTop: '10px' }}>
              {'>'} HACKER MODE ACTIVATED
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </>
  )
}
