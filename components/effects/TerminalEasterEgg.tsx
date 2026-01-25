'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const commands: Record<string, string> = {
  help: 'Available commands: help, about, skills, contact, clear, exit, matrix, hack, coffee',
  about: 'Ankur Singh - Software Engineer building production-ready systems with clarity and ownership.',
  skills: 'TypeScript | React | Next.js | Node.js | PostgreSQL | MongoDB | Tailwind CSS',
  contact: 'Email: a4ankur.mail@gmail.com | GitHub: @ankursingh4u',
  matrix: 'Wake up, Neo... The Matrix has you...',
  hack: 'ACCESS GRANTED. Just kidding, this is a portfolio site.',
  coffee: '☕ Here\'s your virtual coffee! Now get back to coding.',
  whoami: 'You are a curious visitor who found the secret terminal!',
  date: new Date().toLocaleString(),
  clear: '',
  exit: '',
}

export function TerminalEasterEgg() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<{ cmd: string; output: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Toggle with Ctrl + `
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cmd = input.toLowerCase().trim()

    if (cmd === 'clear') {
      setHistory([])
    } else if (cmd === 'exit') {
      setIsOpen(false)
    } else {
      const output = commands[cmd] || `Command not found: ${cmd}. Type 'help' for available commands.`
      setHistory((prev) => [...prev, { cmd: input, output }])
    }

    setInput('')
  }

  return (
    <>
      {/* Hint */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#3a3a3f',
          zIndex: 100,
        }}
      >
        Press Ctrl + ` for terminal
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '60px',
              left: '20px',
              width: '500px',
              maxWidth: 'calc(100vw - 40px)',
              background: 'rgba(10, 10, 11, 0.98)',
              border: '1px solid #22c55e',
              borderRadius: '8px',
              overflow: 'hidden',
              zIndex: 10000,
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '10px 15px',
                borderBottom: '1px solid #1e1e21',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ marginLeft: '10px', fontFamily: 'monospace', fontSize: '12px', color: '#71717a' }}>
                secret_terminal.sh
              </span>
            </div>

            {/* Content */}
            <div
              style={{
                padding: '15px',
                height: '300px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            >
              <div style={{ color: '#22c55e', marginBottom: '10px' }}>
                Welcome to the secret terminal! Type 'help' for commands.
              </div>

              {history.map((item, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ color: '#22c55e' }}>
                    <span style={{ color: '#71717a' }}>visitor@portfolio:~$</span> {item.cmd}
                  </div>
                  <div style={{ color: '#e4e4e7', marginLeft: '20px' }}>{item.output}</div>
                </div>
              ))}

              <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#71717a' }}>visitor@portfolio:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#22c55e',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    marginLeft: '8px',
                  }}
                  autoFocus
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
