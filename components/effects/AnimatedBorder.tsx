'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedBorderProps {
  children: ReactNode
  className?: string
  borderColor?: 'green' | 'blue' | 'amber' | 'red' | 'cyan'
  hoverOnly?: boolean
  rounded?: string
}

const borderColors = {
  green: {
    gradient: 'linear-gradient(90deg, #22c55e, #06B6D4, #22c55e)',
    glow: 'rgba(34, 197, 94, 0.3)',
  },
  blue: {
    gradient: 'linear-gradient(90deg, #3B82F6, #06B6D4, #3B82F6)',
    glow: 'rgba(59, 130, 246, 0.3)',
  },
  amber: {
    gradient: 'linear-gradient(90deg, #F59E0B, #EAB308, #F59E0B)',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  red: {
    gradient: 'linear-gradient(90deg, #EF4444, #F97316, #EF4444)',
    glow: 'rgba(239, 68, 68, 0.3)',
  },
  cyan: {
    gradient: 'linear-gradient(90deg, #06B6D4, #22D3EE, #06B6D4)',
    glow: 'rgba(6, 182, 212, 0.3)',
  },
}

export function AnimatedBorder({
  children,
  className = '',
  borderColor = 'green',
  hoverOnly = true,
  rounded = 'rounded-lg',
}: AnimatedBorderProps) {
  const colors = borderColors[borderColor]

  return (
    <motion.div
      className={`relative ${rounded} ${className}`}
      initial="idle"
      whileHover="hover"
    >
      {/* Animated gradient border */}
      <motion.div
        className={`absolute -inset-[1px] ${rounded} z-0`}
        style={{
          background: colors.gradient,
          backgroundSize: '200% 100%',
        }}
        variants={{
          idle: hoverOnly
            ? { opacity: 0, backgroundPosition: '0% 0%' }
            : { opacity: 1, backgroundPosition: '0% 0%' },
          hover: { opacity: 1, backgroundPosition: '100% 0%' },
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      {/* Glow effect */}
      <motion.div
        className={`absolute -inset-[2px] ${rounded} z-0`}
        style={{ boxShadow: `0 0 20px ${colors.glow}` }}
        variants={{
          idle: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Inner content */}
      <div className={`relative z-10 bg-terminal-surface ${rounded}`}>
        {children}
      </div>
    </motion.div>
  )
}
