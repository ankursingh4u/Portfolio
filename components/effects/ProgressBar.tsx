'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function ProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = (window.scrollY / scrollHeight) * 100
      setProgress(scrollProgress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        background: 'rgba(30, 30, 33, 0.5)',
        zIndex: 9999,
      }}
    >
      <motion.div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #22c55e, #06b6d4, #a855f7)',
          boxShadow: '0 0 10px #22c55e, 0 0 20px #22c55e',
        }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />

      {/* Percentage indicator */}
      {progress > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            right: '10px',
            top: '8px',
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#22c55e',
            textShadow: '0 0 5px #22c55e',
          }}
        >
          {Math.round(progress)}%
        </motion.div>
      )}
    </div>
  )
}
