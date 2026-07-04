'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useUniverse } from '@/lib/hooks/useUniverse'

/**
 * Free-flight controls, bottom-right. Pause/resume the orbital motion (so you
 * can inspect a planet without it drifting) and recenter the view on the sun
 * after exploring. Touch-sized (44px) and mobile-responsive.
 */
export function SpaceControls() {
  const { phase, tourActive, paused, togglePaused, recenter } = useUniverse()
  const visible = phase === 'home' && !tourActive

  const btn =
    'grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#070d1c]/80 text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35 }}
          className="fixed bottom-4 right-3 z-30 flex flex-col gap-2 md:bottom-6 md:right-6"
        >
          <button
            type="button"
            onClick={togglePaused}
            aria-pressed={paused}
            aria-label={paused ? 'Resume orbital motion' : 'Pause orbital motion'}
            title={paused ? 'Resume motion' : 'Pause motion'}
            className={btn}
          >
            {paused ? (
              // play
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              // pause
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={recenter}
            aria-label="Recenter the view on the sun"
            title="Recenter view"
            className={btn}
          >
            {/* target / recenter glyph */}
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="12" r="3.4" />
              <circle cx="12" cy="12" r="8" opacity="0.5" />
              <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
