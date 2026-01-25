'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { siteConfig } from '@/lib/site-config'
import { TypeWriter } from '../terminal'
import { GlitchText, ScanLines, MatrixRain, FloatingParticles, CircuitLines, CyberGrid, HolographicText } from '../effects'

// ASCII Art Logo
const asciiLogo = `
    _    _   _ _  ___   _ ____
   / \\  | \\ | | |/ / | | |  _ \\
  / _ \\ |  \\| | ' /| | | | |_) |
 / ___ \\| |\\  | . \\| |_| |  _ <
/_/   \\_\\_| \\_|_|\\_\\\\___/|_| \\_\\
`

const bootLines = [
  { text: '> initializing system...', delay: 0 },
  { text: '> loading kernel modules...', delay: 300 },
  { text: '> user: ankur_singh [AUTHENTICATED]', delay: 600, highlight: true },
]

export function HeroSection() {
  const [showContent, setShowContent] = useState(false)
  const [bootComplete, setBootComplete] = useState(false)
  const [visibleBootLines, setVisibleBootLines] = useState<number[]>([])

  useEffect(() => {
    // Boot sequence animation
    bootLines.forEach((line, index) => {
      setTimeout(() => {
        setVisibleBootLines((prev) => [...prev, index])
      }, line.delay)
    })

    // Show main content after boot
    const bootTimer = setTimeout(() => {
      setBootComplete(true)
    }, 1000)

    const contentTimer = setTimeout(() => {
      setShowContent(true)
    }, 1200)

    return () => {
      clearTimeout(bootTimer)
      clearTimeout(contentTimer)
    }
  }, [])

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Matrix Rain Background - subtle */}
      <MatrixRain opacity={0.15} density={0.08} speed={1} />

      {/* Circuit Lines - very subtle tech feel */}
      <CircuitLines />

      {/* Cyber Grid Floor - subtle 3D depth */}
      <CyberGrid />

      {/* Floating Particles - reduced */}
      <FloatingParticles count={25} opacity={0.2} />

      {/* Scan Lines Overlay - minimal */}
      <ScanLines opacity={0.01} movingLine={true} />

      {/* Background grid - subtle */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-terminal-bg/80 via-transparent to-terminal-bg/80 pointer-events-none z-[2]" />

      {/* Content */}
      <div className="relative z-[10] container-narrow mx-auto px-6 py-20">
        <div className="space-y-8">
          {/* Boot sequence */}
          <div className="space-y-1 min-h-[80px]">
            <AnimatePresence>
              {bootLines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={
                    visibleBootLines.includes(index)
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -10 }
                  }
                  transition={{ duration: 0.3 }}
                  className={`text-sm font-mono ${
                    line.highlight
                      ? 'text-terminal-accent text-glow-accent'
                      : 'text-terminal-dim'
                  }`}
                >
                  {line.text}
                  {index === visibleBootLines.length - 1 && !bootComplete && (
                    <span className="inline-block w-2 h-4 bg-terminal-accent animate-cursor-blink ml-1" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ASCII Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={bootComplete ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:block"
          >
            <pre className="text-terminal-accent text-xs md:text-sm leading-none font-mono text-glow-accent opacity-80 overflow-x-auto">
              {asciiLogo}
            </pre>
          </motion.div>

          {/* Main heading with glitch effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={bootComplete ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight">
              <GlitchText
                text={siteConfig.name}
                className="text-terminal-text"
                glitchInterval={5000}
                glitchDuration={150}
              />
            </h1>

            <div className="flex items-center gap-2 text-lg md:text-xl text-terminal-dim">
              <span className="text-terminal-muted font-mono">{'>'}</span>
              {showContent ? (
                <TypeWriter
                  text={siteConfig.title}
                  speed={40}
                  showCursor={true}
                />
              ) : (
                <span className="opacity-0">{siteConfig.title}</span>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xl"
          >
            <p className="text-terminal-dim text-base md:text-lg leading-relaxed">
              {siteConfig.description}
            </p>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <motion.a
              href="#work"
              className="terminal-btn hover-glow"
              whileHover={{ scale: 1.02, borderColor: '#22c55e' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-terminal-muted">[</span>
              <span>view_work</span>
              <span className="text-terminal-muted">]</span>
            </motion.a>
            <motion.a
              href="#contact"
              className="terminal-btn terminal-btn-primary"
              whileHover={{
                scale: 1.02,
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-terminal-bg/80">[</span>
              <span>contact</span>
              <span className="text-terminal-bg/80">]</span>
            </motion.a>
          </motion.div>

          {/* Status bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={showContent ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-8"
          >
            <div className="flex flex-wrap items-center gap-6 text-xs text-terminal-dim font-mono">
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="relative">
                  <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent block" />
                  <span className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-terminal-accent animate-ping opacity-75" />
                </span>
                <span>{siteConfig.status}</span>
              </motion.div>
              <div className="flex items-center gap-2">
                <span className="text-terminal-muted">loc:</span>
                <span>{siteConfig.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terminal-muted">tz:</span>
                <span>IST (UTC+5:30)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={showContent ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[10]"
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-terminal-dim"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs font-mono">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-terminal-dim to-transparent" />
        </motion.div>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-terminal-accent/30 hidden md:block z-[10]" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-terminal-accent/30 hidden md:block z-[10]" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-terminal-accent/30 hidden md:block z-[10]" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-terminal-accent/30 hidden md:block z-[10]" />
    </section>
  )
}
