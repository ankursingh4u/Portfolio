'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { siteConfig, aboutContent } from '@/lib/site-config'
import { aboutMe } from '@/lib/about-me'
import { navByDest } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'

export function SunBio() {
  const reduce = useReducedMotion()
  const { bioOpen, closeBio, startTour, enterWorld } = useUniverse()
  const contact = navByDest('contact')

  return (
    <AnimatePresence>
      {bioOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="About Ankur Singh"
          className="fixed inset-0 z-[58] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
        >
          {/* dim + sun glow */}
          <button
            type="button"
            aria-label="Close"
            onClick={closeBio}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
          />

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-300/20 bg-[#0c1020]/90 p-7 backdrop-blur-2xl md:p-9"
            style={{ boxShadow: '0 0 80px -20px rgba(245,158,11,0.5)' }}
          >
            {/* close */}
            <button
              type="button"
              onClick={closeBio}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10"
            >
              ✕
            </button>

            {/* mini sun */}
            <div
              aria-hidden
              className="mb-5 h-14 w-14 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, #fff7d6 0%, #ffd34d 38%, #f59e0b 70%, #ea7a0b 100%)',
                boxShadow: '0 0 40px 8px rgba(245,158,11,0.5)',
              }}
            />

            <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber-300/90">
              the sun · the centre of it all
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">{siteConfig.name}</h2>
            <p className="mt-1 text-sm font-medium text-indigo-200">{siteConfig.title}</p>

            <p className="mt-5 text-sm leading-relaxed text-slate-300">{aboutContent.intro}</p>

            {/* the road here + life beyond the code */}
            <div className="mt-5 space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-300">
                <span aria-hidden className="mt-0.5">🧭</span>
                <span>
                  Started deep in <strong className="text-amber-200">200+ Web3 projects</strong> —
                  systems thinking &amp; experimentation discipline — then moved to building
                  practical products people use every day.
                </span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['📚 reading', '✈️ traveling', '💪 calisthenics', '🎬 films'].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* what I'm after */}
            <div className="mt-5 flex flex-wrap gap-2">
              {aboutMe.ambition.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-amber-300/20 bg-amber-300/5 px-3 py-1 font-mono text-[11px] text-amber-200"
                >
                  {a}
                </span>
              ))}
            </div>

            <p className="mt-5 text-sm italic leading-relaxed text-slate-400">
              {aboutMe.identity}
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  closeBio()
                  setTimeout(startTour, reduce ? 0 : 150)
                }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white"
              >
                🚀 Tour the cosmos
              </button>
              <button
                type="button"
                onClick={() => {
                  closeBio()
                  if (contact) setTimeout(() => enterWorld(contact), reduce ? 0 : 150)
                }}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Work with me →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
