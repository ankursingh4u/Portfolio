'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { WORLDS, SUN_NAV, navByDest, type PlanetNav } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'
import { InfoWidget } from '@/components/ui/InfoWidget'

export function SpaceNav() {
  const { phase, tourActive, enterWorld, exitWorld } = useUniverse()
  const [open, setOpen] = useState(false)

  // Stay out of the way while a world is open or a tour is flying.
  const visible = phase === 'home' && !tourActive
  const contact = navByDest('contact')

  // Escape closes the worlds dropdown (the global Esc handler owns worlds/tour).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (nav: PlanetNav) => {
    enterWorld(nav)
    setOpen(false)
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
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8"
          >
            {/* Logo */}
            <button
              type="button"
              onClick={exitWorld}
              title="Ankur Singh — home"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 font-mono text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white/10"
            >
              AS
            </button>

            {/* Worlds dropdown — one button for all 8 destinations (mobile + desktop) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white/80 backdrop-blur-md transition-colors hover:bg-white/10"
              >
                <span className="text-white/50">◧</span> worlds
                <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  ▾
                </motion.span>
              </button>

              <AnimatePresence>
                {open && (
                  <>
                    <button
                      type="button"
                      aria-label="Close menu"
                      onClick={() => setOpen(false)}
                      className="fixed inset-0 z-0 cursor-default"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-1/2 z-10 mt-2 w-60 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#070d1c]/95 p-1.5 shadow-2xl backdrop-blur-xl"
                    >
                      {[SUN_NAV, ...WORLDS].map((w) => (
                        <button
                          key={w.destId}
                          type="button"
                          onClick={() => go(w)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.07]"
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: w.accent, boxShadow: `0 0 8px ${w.accent}` }}
                          />
                          <span className="flex-1">
                            <span className="block text-sm font-medium text-white">{w.label}</span>
                            <span className="block font-mono text-[10px] text-white/60">
                              {w.name} · {w.tag}
                            </span>
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block">
                <InfoWidget />
              </div>
              <button
                type="button"
                onClick={() => contact && enterWorld(contact)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-2 font-mono text-xs text-emerald-200 backdrop-blur-md transition-colors hover:bg-emerald-400/20"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                hire me
              </button>
            </div>
          </nav>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
