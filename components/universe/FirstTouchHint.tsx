'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useUniverse } from '@/lib/hooks/useUniverse'

/**
 * The single most important onboarding beat: telling a first-time visitor that
 * the planets are *destinations*. On desktop hover eventually reveals it — but
 * on touch there is no hover, so nothing signals "tap me" until a tap already
 * navigates. This shows a one-time, interaction-adaptive cue that dismisses the
 * moment the user does anything, and never nags again this session.
 */
export function FirstTouchHint() {
  const { phase, tourActive } = useUniverse()
  const reduce = useReducedMotion()
  const [show, setShow] = useState(false)
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    // Once per session — don't pester on every route change or refresh-in-tab.
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('cosmos-hint-seen')) return

    const isTouch =
      window.matchMedia?.('(hover: none), (pointer: coarse)').matches ?? false
    setTouch(isTouch)

    const reveal = setTimeout(() => setShow(true), 1100)
    return () => clearTimeout(reveal)
  }, [])

  // Dismiss on the very first real interaction with the scene, or after a beat.
  useEffect(() => {
    if (!show) return
    const dismiss = () => {
      setShow(false)
      try {
        sessionStorage.setItem('cosmos-hint-seen', '1')
      } catch {
        /* private mode — fine, it just shows again next load */
      }
    }
    const opts = { passive: true } as const
    window.addEventListener('pointerdown', dismiss, opts)
    window.addEventListener('wheel', dismiss, opts)
    window.addEventListener('touchstart', dismiss, opts)
    window.addEventListener('keydown', dismiss)
    const auto = setTimeout(dismiss, 7000)
    return () => {
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('wheel', dismiss)
      window.removeEventListener('touchstart', dismiss)
      window.removeEventListener('keydown', dismiss)
      clearTimeout(auto)
    }
  }, [show])

  const visible = show && phase === 'home' && !tourActive

  const cues = touch
    ? [
        { icon: '🌍', text: 'Tap a planet to explore' },
        { icon: '✥', text: 'Drag to orbit' },
        { icon: '⇔', text: 'Pinch to zoom' },
      ]
    : [
        { icon: '🌍', text: 'Click a planet to explore' },
        { icon: '✥', text: 'Drag to orbit' },
        { icon: '⇕', text: 'Scroll to zoom' },
      ]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="first-touch-hint"
          aria-hidden="true"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, transition: { duration: 0.35 } }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 md:bottom-10"
        >
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#070d1c]/80 p-1 shadow-2xl backdrop-blur-xl sm:gap-1.5 sm:p-1.5">
            {cues.map((c, i) => (
              <div
                key={c.text}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 sm:gap-2 sm:px-3.5"
                style={i === 0 ? { background: 'rgba(255,255,255,0.06)' } : undefined}
              >
                <motion.span
                  aria-hidden
                  className="text-sm leading-none sm:text-base"
                  animate={reduce || i !== 0 ? {} : { scale: [1, 1.18, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {c.icon}
                </motion.span>
                <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-white/70 sm:text-[11px]">
                  {c.text}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
