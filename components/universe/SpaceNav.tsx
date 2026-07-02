'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WORLDS, navByDest, type PlanetNav } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'
import { InfoWidget } from '@/components/ui/InfoWidget'

import type { DestId } from '@/lib/universe-nav'

const ORDER: { label: string; dest: DestId }[] = [
  { label: 'story', dest: 'story' },
  { label: 'flagships', dest: 'flagships' },
  { label: 'clients', dest: 'clients' },
  { label: 'open_source', dest: 'opensource' },
  { label: 'stack', dest: 'stack' },
  { label: 'pricing', dest: 'pricing' },
  { label: 'contact', dest: 'contact' },
]

export function SpaceNav() {
  const { phase, tourActive, enterWorld, exitWorld } = useUniverse()
  const [menuOpen, setMenuOpen] = useState(false)

  // Stay out of the way while a world is open or a tour is flying.
  const visible = phase === 'home' && !tourActive
  const contact = navByDest('contact')

  const go = (dest: string) => {
    const nav = WORLDS.find((w) => w.destId === dest) as PlanetNav | undefined
    if (nav) enterWorld(nav)
    setMenuOpen(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed left-0 right-0 top-0 z-40"
        >
          <nav aria-label="Primary" className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
            {/* Logo */}
            <button
              type="button"
              onClick={exitWorld}
              title="Ankur Singh — home"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 font-mono text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white/10"
            >
              AS
            </button>

            {/* Desktop links */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 backdrop-blur-md md:flex">
              {ORDER.map((item) => (
                <button
                  key={item.dest}
                  type="button"
                  onClick={() => go(item.dest)}
                  className="rounded-full px-3 py-1.5 font-mono text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  .{item.label}()
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <InfoWidget />
              </div>
              <button
                type="button"
                onClick={() => contact && enterWorld(contact)}
                className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 font-mono text-xs text-white backdrop-blur-md transition-colors hover:bg-white/10 md:inline-flex"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                hire me
              </button>

              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className="rounded-lg border border-white/20 bg-white/5 p-2 font-mono text-sm text-white backdrop-blur-md md:hidden"
              >
                {menuOpen ? '[x]' : '[=]'}
              </button>
            </div>
          </nav>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-5 rounded-2xl border border-white/10 bg-[#0a1024]/95 p-3 backdrop-blur-xl md:hidden"
              >
                {ORDER.map((item) => (
                  <button
                    key={item.dest}
                    type="button"
                    onClick={() => go(item.dest)}
                    className="block w-full rounded-lg px-3 py-2.5 text-left font-mono text-sm text-white/80 transition-colors hover:bg-white/10"
                  >
                    .{item.label}()
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
