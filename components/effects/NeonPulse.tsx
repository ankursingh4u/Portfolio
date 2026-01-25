'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface NeonPulseProps {
  children: ReactNode
  color?: string
  className?: string
}

export function NeonPulse({ children, color = '#22c55e', className = '' }: NeonPulseProps) {
  return (
    <motion.span
      className={className}
      animate={{
        textShadow: [
          `0 0 2px ${color}, 0 0 5px ${color}`,
          `0 0 5px ${color}, 0 0 10px ${color}, 0 0 15px ${color}`,
          `0 0 2px ${color}, 0 0 5px ${color}`,
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{ color }}
    >
      {children}
    </motion.span>
  )
}
