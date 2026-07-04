'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { siteConfig } from '@/lib/site-config'
import { SUN_NAV } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'

const roles = ['Full-Stack Engineer', 'Shopify App Builder', 'AI Product Developer']

export function HeroOverlay() {
  const { phase, tourActive, bioOpen, startTour, enterWorld } = useUniverse()
  const [roleIndex, setRoleIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = roles[roleIndex]
    let timeout: ReturnType<typeof setTimeout>
    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 65)
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800)
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 35)
    } else {
      setIsDeleting(false)
      setRoleIndex((i) => (i + 1) % roles.length)
    }
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, roleIndex])

  const visible = phase === 'home' && !tourActive && !bioOpen

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hero"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="pointer-events-none fixed left-3 top-[4.5rem] z-30 w-[min(64vw,15rem)] md:left-8 md:top-24 md:w-auto md:max-w-sm"
        >
          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-xl md:p-6">
            <div className="mb-2 hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-indigo-200 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {siteConfig.status}
            </div>

            <h1 className="text-lg font-bold leading-tight tracking-tight text-white md:text-3xl">
              Ankur’s Cosmos
            </h1>

            <div className="mt-1 flex h-5 items-center gap-2 md:h-6">
              <span className="font-mono text-xs text-indigo-300 md:text-sm">{displayed}</span>
              <span className="inline-block h-3.5 w-0.5 animate-pulse bg-indigo-300 md:h-4" />
            </div>

            <p className="mt-2 hidden text-sm leading-relaxed text-slate-300 sm:block">
              Every planet is a part of my world. Click one to fly in — or start at
              the&nbsp;sun.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap md:mt-4">
              <motion.button
                type="button"
                onClick={startTour}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Take the guided tour of the solar system"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 md:text-sm"
              >
                🚀 Tour
              </motion.button>
              <button
                type="button"
                onClick={() => enterWorld(SUN_NAV)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 md:text-sm"
              >
                Who am I?
              </button>
            </div>
          </div>

          <p className="mt-2 hidden pl-1 font-mono text-[11px] uppercase tracking-widest text-slate-400 md:block">
            ↗ click a planet to travel
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
