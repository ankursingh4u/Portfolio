'use client'

import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/site-config'
import { TypeWriter } from '../terminal'

export function HeroSection() {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Content */}
      <div className="relative z-10 container-narrow mx-auto px-6 py-20">
        <div className="space-y-8">
          {/* System identity */}
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-terminal-dim font-mono">
              <span className="text-terminal-muted">{'>'}</span>
              <span>initializing session...</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-terminal-muted">{'>'}</span>
              <span className="text-terminal-dim">user:</span>
              <span className="text-terminal-accent">{siteConfig.username}</span>
            </div>
          </div>

          {/* Main heading */}
          <div className="space-y-4 animate-fade-in delay-200">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight">
              <span className="text-terminal-text">{siteConfig.name}</span>
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
          </div>

          {/* Description */}
          <div className="max-w-xl animate-fade-in delay-300">
            <p className="text-terminal-dim text-base md:text-lg leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 animate-fade-in delay-400">
            <a href="#work" className="terminal-btn">
              <span className="text-terminal-muted">[</span>
              <span>view_work</span>
              <span className="text-terminal-muted">]</span>
            </a>
            <a href="#contact" className="terminal-btn terminal-btn-primary">
              <span className="text-terminal-bg/80">[</span>
              <span>contact</span>
              <span className="text-terminal-bg/80">]</span>
            </a>
          </div>

          {/* Status bar */}
          <div className="pt-8 animate-fade-in delay-500">
            <div className="flex flex-wrap items-center gap-6 text-xs text-terminal-dim font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent animate-pulse" />
                <span>{siteConfig.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terminal-muted">loc:</span>
                <span>{siteConfig.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-terminal-muted">tz:</span>
                <span>IST (UTC+5:30)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in delay-500">
        <div className="flex flex-col items-center gap-2 text-terminal-dim">
          <span className="text-xs font-mono">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-terminal-dim to-transparent" />
        </div>
      </div>
    </section>
  )
}
