'use client'

import { ReactNode } from 'react'

interface CommandLineProps {
  prefix?: string
  command?: string
  children?: ReactNode
  showCursor?: boolean
  className?: string
}

export function CommandLine({
  prefix = '$',
  command,
  children,
  showCursor = false,
  className = '',
}: CommandLineProps) {
  return (
    <div className={`command-line ${className}`}>
      <span className="command-prefix">{prefix}</span>
      {command && <span className="command-text">{command}</span>}
      {children}
      {showCursor && <span className="cursor" />}
    </div>
  )
}

interface OutputLineProps {
  children: ReactNode
  type?: 'default' | 'success' | 'error' | 'warning' | 'muted'
  className?: string
}

export function OutputLine({
  children,
  type = 'default',
  className = '',
}: OutputLineProps) {
  const typeStyles = {
    default: 'text-terminal-text',
    success: 'text-terminal-accent',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    muted: 'text-terminal-dim',
  }

  return (
    <div className={`text-sm ${typeStyles[type]} ${className}`}>
      {children}
    </div>
  )
}

interface CommentLineProps {
  children: ReactNode
  className?: string
}

export function CommentLine({ children, className = '' }: CommentLineProps) {
  return (
    <div className={`text-sm text-terminal-dim ${className}`}>
      <span className="select-none">// </span>
      {children}
    </div>
  )
}
