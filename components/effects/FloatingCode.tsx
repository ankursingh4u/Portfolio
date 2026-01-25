'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const codeSnippets = [
  'const init = () => {}',
  'npm install --save',
  'git push origin main',
  'docker build -t app .',
  'SELECT * FROM users',
  'export default App',
  'import { useState }',
  'async/await',
  'return <Component />',
  'useEffect(() => {})',
  'fetch("/api/data")',
  'console.log("debug")',
  '.env.local',
  'next build',
  'tailwind.config',
  'prisma migrate',
  'vercel deploy',
  'npm run dev',
  '// TODO: fix bug',
  'interface Props {}',
]

interface FloatingSnippet {
  id: number
  text: string
  x: number
  y: number
  duration: number
}

export function FloatingCode() {
  const [snippets, setSnippets] = useState<FloatingSnippet[]>([])

  useEffect(() => {
    let id = 0

    const addSnippet = () => {
      const newSnippet: FloatingSnippet = {
        id: id++,
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        duration: 8 + Math.random() * 4,
      }

      setSnippets((prev) => [...prev.slice(-10), newSnippet])
    }

    addSnippet()
    const interval = setInterval(addSnippet, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {snippets.map((snippet) => (
          <motion.div
            key={snippet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.08, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: snippet.duration, ease: 'linear' }}
            style={{
              position: 'absolute',
              left: `${snippet.x}%`,
              top: `${snippet.y}%`,
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#22c55e',
              whiteSpace: 'nowrap',
              textShadow: '0 0 5px rgba(34, 197, 94, 0.3)',
            }}
          >
            {snippet.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
