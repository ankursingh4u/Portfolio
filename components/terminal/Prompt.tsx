'use client'

interface PromptProps {
  user?: string
  path?: string
  className?: string
}

export function Prompt({ user = 'ankur_singh', path = '~', className = '' }: PromptProps) {
  return (
    <span className={`text-sm ${className}`}>
      <span className="text-terminal-accent">{user}</span>
      <span className="text-terminal-dim">:</span>
      <span className="text-blue-400">{path}</span>
      <span className="text-terminal-dim"> $ </span>
    </span>
  )
}

interface SystemPromptProps {
  message: string
  timestamp?: string
  className?: string
}

export function SystemPrompt({ message, timestamp, className = '' }: SystemPromptProps) {
  return (
    <div className={`flex items-center gap-3 text-xs ${className}`}>
      {timestamp && (
        <span className="text-terminal-dim font-mono">[{timestamp}]</span>
      )}
      <span className="text-terminal-dim">{'>'}</span>
      <span className="text-terminal-text">{message}</span>
    </div>
  )
}
