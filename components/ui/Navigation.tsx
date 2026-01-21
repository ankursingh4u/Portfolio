'use client'

import { useState, useEffect } from 'react'
import { siteConfig } from '@/lib/site-config'

const navItems = [
  { label: 'home', href: '#home' },
  { label: 'about', href: '#about' },
  { label: 'work', href: '#work' },
  { label: 'stack', href: '#stack' },
  { label: 'contact', href: '#contact' },
]

export function Navigation() {
  const [activeSection, setActiveSection] = useState('home')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Update active section based on scroll position
      const sections = navItems.map((item) => item.label)
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-terminal-bg/90 backdrop-blur-sm border-b border-terminal-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-wide mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Identity */}
          <a
            href="#home"
            className="flex items-center gap-2 text-sm font-mono group"
          >
            <span className="text-terminal-dim">{'>'}</span>
            <span className="text-terminal-text group-hover:text-terminal-accent transition-colors">
              {siteConfig.username}
            </span>
            <span className="text-terminal-accent animate-cursor-blink">_</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 text-sm font-mono rounded transition-colors ${
                  activeSection === item.label
                    ? 'text-terminal-accent'
                    : 'text-terminal-dim hover:text-terminal-text'
                }`}
              >
                .{item.label}()
              </a>
            ))}
          </div>

          {/* Status indicator */}
          <div className="hidden md:flex status-indicator">
            <span className="status-dot" />
            <span>{siteConfig.status}</span>
          </div>

          {/* Mobile menu button */}
          <MobileMenuButton navItems={navItems} activeSection={activeSection} />
        </div>
      </nav>
    </header>
  )
}

interface MobileMenuButtonProps {
  navItems: { label: string; href: string }[]
  activeSection: string
}

function MobileMenuButton({ navItems, activeSection }: MobileMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-terminal-dim hover:text-terminal-text transition-colors"
        aria-label="Toggle menu"
      >
        <span className="font-mono text-sm">{isOpen ? '[x]' : '[=]'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-terminal-surface border-b border-terminal-border">
          <div className="px-6 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 text-sm font-mono rounded transition-colors ${
                  activeSection === item.label
                    ? 'text-terminal-accent bg-terminal-bg'
                    : 'text-terminal-dim hover:text-terminal-text'
                }`}
              >
                .{item.label}()
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
