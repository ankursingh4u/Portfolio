'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass border-b border-terminal-border/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-wide mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Identity */}
          <motion.a
            href="#home"
            className="flex items-center gap-2 text-sm font-mono group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-terminal-dim">{'>'}</span>
            <span className="text-terminal-text group-hover:text-terminal-accent transition-colors">
              {siteConfig.username}
            </span>
            <motion.span
              className="text-terminal-accent"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              _
            </motion.span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className={`relative px-3 py-1.5 text-sm font-mono rounded transition-colors ${
                  activeSection === item.label
                    ? 'text-terminal-accent'
                    : 'text-terminal-dim hover:text-terminal-text'
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                .{item.label}()
                {activeSection === item.label && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 bg-terminal-accent/10 rounded -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}
          </div>

          {/* Status indicator */}
          <motion.div
            className="hidden md:flex status-indicator"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="relative">
              <span className="status-dot" />
              <span className="absolute inset-0 status-dot animate-ping opacity-75" />
            </span>
            <span>{siteConfig.status}</span>
          </motion.div>

          {/* Mobile menu button */}
          <MobileMenuButton navItems={navItems} activeSection={activeSection} />
        </div>
      </nav>
    </motion.header>
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
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-terminal-dim hover:text-terminal-text transition-colors"
        aria-label="Toggle menu"
        whileTap={{ scale: 0.95 }}
      >
        <span className="font-mono text-sm">{isOpen ? '[x]' : '[=]'}</span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 glass border-b border-terminal-border"
        >
          <div className="px-6 py-4 flex flex-col gap-2">
            {navItems.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`px-3 py-2 text-sm font-mono rounded transition-colors ${
                  activeSection === item.label
                    ? 'text-terminal-accent bg-terminal-bg'
                    : 'text-terminal-dim hover:text-terminal-text'
                }`}
              >
                .{item.label}()
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
