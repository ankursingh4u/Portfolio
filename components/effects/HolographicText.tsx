'use client'

import { ReactNode } from 'react'

interface HolographicTextProps {
  children: ReactNode
  className?: string
}

export function HolographicText({ children, className = '' }: HolographicTextProps) {
  return (
    <span
      className={className}
      style={{
        background: 'linear-gradient(90deg, #22c55e, #06b6d4, #a855f7, #ec4899, #22c55e)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'holographic 3s linear infinite',
      }}
    >
      {children}
      <style jsx>{`
        @keyframes holographic {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </span>
  )
}
