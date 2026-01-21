'use client'

import { ReactNode } from 'react'

interface TerminalWindowProps {
  children: ReactNode
  title?: string
  className?: string
}

export function TerminalWindow({ children, title, className = '' }: TerminalWindowProps) {
  return (
    <div className={`terminal-window ${className}`}>
      <div className="terminal-header">
        <div className="flex items-center gap-1.5">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
        </div>
        {title && (
          <span className="ml-4 text-xs text-terminal-dim font-mono">
            {title}
          </span>
        )}
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}
