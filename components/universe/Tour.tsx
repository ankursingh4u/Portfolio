'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { siteConfig } from '@/lib/site-config'
import { navByDest } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'

interface Lock {
  x: number
  y: number
  r: number
}

/** Types a string out character-by-character; instant under reduced motion. */
function useTypewriter(text: string, active: boolean, cps = 55) {
  const reduce = useReducedMotion()
  const [out, setOut] = useState('')
  useEffect(() => {
    if (!active) return
    if (reduce) {
      setOut(text)
      return
    }
    setOut('')
    let i = 0
    const id = setInterval(() => {
      i++
      setOut(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 1000 / cps)
    return () => clearInterval(id)
  }, [text, active, reduce, cps])
  return out
}

export function Tour() {
  const reduce = useReducedMotion()
  const {
    tourActive,
    tourStep,
    tourIndex,
    tourCount,
    tourNext,
    tourPrev,
    tourGoTo,
    endTour,
    enterWorld,
    getSpotlight,
  } = useUniverse()

  const [lock, setLock] = useState<Lock | null>(null)
  const isPlanet = tourStep?.kind === 'planet'

  // Track the spotlighted planet's live screen position for the reticle.
  useEffect(() => {
    if (!tourActive || !isPlanet) {
      setLock(null)
      return
    }
    let raf = 0
    const tick = () => {
      const s = getSpotlight()
      if (s) {
        setLock((prev) =>
          prev &&
          Math.abs(prev.x - s.x) < 0.5 &&
          Math.abs(prev.y - s.y) < 0.5 &&
          Math.abs(prev.r - s.r) < 0.5
            ? prev
            : { x: s.x, y: s.y, r: s.r },
        )
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [tourActive, isPlanet, tourIndex, getSpotlight])

  const stepKey = tourStep?.kind === 'planet' ? tourStep.nav.name : tourStep?.kind ?? ''
  const contact = navByDest('contact')
  const totalSteps = tourCount + 2
  const accent =
    tourStep?.kind === 'planet'
      ? tourStep.nav.accent
      : tourStep?.kind === 'finale'
        ? '#34d399'
        : '#f5b73b'

  // Readout copy for the terminal panel.
  const readout =
    tourStep?.kind === 'planet'
      ? {
          body: tourStep.nav.name.toUpperCase(),
          system: `${tourStep.nav.label.replace(' ↗', '').toUpperCase()}.sys`,
          desig: tourStep.nav.tag,
          desc: tourStep.nav.blurb,
        }
      : tourStep?.kind === 'sun'
        ? {
            body: 'SOL // SYSTEM CORE',
            system: `${siteConfig.name.toUpperCase()}.sys`,
            desig: 'the centre of it all',
            desc: 'Everything in this system orbits the work. Initiating guided flight — one world at a time.',
          }
        : {
            body: 'FLIGHT COMPLETE',
            system: 'ALL WORLDS.mapped',
            desig: 'navigation log saved',
            desc: 'You have seen my cosmos. Take the controls yourself — or set course for working together.',
          }

  const typed = useTypewriter(readout.desc, tourActive, 60)

  if (!tourActive || !tourStep) return null

  const hudBtn =
    'pointer-events-auto font-mono text-[11px] uppercase tracking-widest transition-all focus-visible:outline-none'
  const reticleSize = lock ? Math.max(130, lock.r * 3.4) : 160

  return (
    <div className="pointer-events-none fixed inset-0 z-[55] font-mono text-white">
      {/* ── Cockpit frame ─────────────────────────────────────────────── */}
      <div className="hud-scan pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: `inset 0 0 200px 20px rgba(0,0,0,0.6), inset 0 0 60px 0 ${accent}22`,
        }}
      />
      {/* corner brackets */}
      {[
        'left-4 top-16 border-l-2 border-t-2',
        'right-4 top-16 border-r-2 border-t-2',
        'left-4 bottom-4 border-l-2 border-b-2',
        'right-4 bottom-4 border-r-2 border-b-2',
      ].map((c) => (
        <span
          key={c}
          aria-hidden
          className={`pointer-events-none absolute h-7 w-7 ${c}`}
          style={{ borderColor: `${accent}88` }}
        />
      ))}

      {/* ── Top status bar ────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-5 py-3 md:px-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em]">
          <motion.span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: accent }}
            animate={reduce ? {} : { opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span style={{ color: accent }}>NAVICOM</span>
          <span className="text-white/60">// guided flight</span>
        </div>
        <div className="hidden items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/65 md:flex">
          <span>
            TARGET{' '}
            <span className="text-white">
              {String(tourIndex + 1).padStart(2, '0')}
            </span>
            /{String(totalSteps).padStart(2, '0')}
          </span>
        </div>
        <button
          type="button"
          onClick={endTour}
          className={`${hudBtn} rounded-sm border px-3 py-1.5 text-white/80 hover:bg-white/10`}
          style={{ borderColor: `${accent}66` }}
        >
          esc // disengage ✕
        </button>
      </div>

      {/* ── Targeting reticle locked on the planet ────────────────────── */}
      <AnimatePresence>
        {isPlanet && lock && (
          <motion.div
            key={`ret-${stepKey}`}
            className="pointer-events-none fixed"
            style={{
              left: lock.x,
              top: lock.y,
              width: reticleSize,
              height: reticleSize,
              marginLeft: -reticleSize / 2,
              marginTop: -reticleSize / 2,
            }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.5, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* snapping corner brackets */}
            {[
              'left-0 top-0 border-l-2 border-t-2',
              'right-0 top-0 border-r-2 border-t-2',
              'left-0 bottom-0 border-l-2 border-b-2',
              'right-0 bottom-0 border-r-2 border-b-2',
            ].map((c) => (
              <span
                key={c}
                className={`absolute h-6 w-6 ${c}`}
                style={{ borderColor: accent }}
              />
            ))}
            {/* rotating outer ring */}
            <motion.span
              aria-hidden
              className="absolute inset-[14%] rounded-full border"
              style={{ borderColor: `${accent}55`, borderTopColor: accent }}
              animate={reduce ? {} : { rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            {/* crosshair ticks */}
            <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2" style={{ background: accent }} />
            <span className="absolute left-1/2 bottom-0 h-3 w-px -translate-x-1/2" style={{ background: accent }} />
            <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2" style={{ background: accent }} />
            <span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2" style={{ background: accent }} />
            {/* scan sweep */}
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-x-[10%] h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                initial={{ top: '12%', opacity: 0 }}
                animate={{ top: ['12%', '88%', '12%'], opacity: [0, 1, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {/* lock label */}
            <span
              className="absolute -top-6 left-0 whitespace-nowrap text-[9px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              ◈ target locked
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Data readout terminal ─────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-24 md:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={`panel-${stepKey}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 16, filter: 'blur(6px)' }}
            transition={{ duration: reduce ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto relative mx-auto w-full max-w-md overflow-hidden rounded-sm border bg-[#03060f]/85 p-5 backdrop-blur-[2px]"
            style={{ borderColor: `${accent}44`, boxShadow: `0 0 40px -12px ${accent}88, inset 0 0 30px -18px ${accent}` }}
          >
            {/* header strip */}
            <div
              className="mb-3 flex items-center justify-between border-b pb-2 text-[10px] uppercase tracking-[0.25em]"
              style={{ borderColor: `${accent}33`, color: accent }}
            >
              <span>▸ scanning</span>
              <span className="text-white/60">{readout.system}</span>
            </div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              celestial body
            </p>
            <h2 className="mt-0.5 text-2xl font-bold text-white md:text-3xl">
              {readout.body}
            </h2>
            <p className="mt-1 text-xs" style={{ color: accent }}>
              {readout.desig}
            </p>

            <p className="mt-3 min-h-[3.5rem] text-sm leading-relaxed text-slate-200">
              {typed}
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-4 w-[7px] translate-y-0.5"
                style={{ background: accent }}
                animate={reduce ? {} : { opacity: [1, 0, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              />
            </p>

            {/* action row */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {tourStep.kind === 'planet' && tourStep.nav.kind === 'world' && (
                <button
                  type="button"
                  onClick={() => {
                    const nav = tourStep.nav
                    endTour()
                    setTimeout(() => enterWorld(nav), reduce ? 0 : 120)
                  }}
                  className={`${hudBtn} rounded-sm px-4 py-2 font-semibold text-[#03060f] hover:brightness-110`}
                  style={{ background: accent, boxShadow: `0 0 24px -6px ${accent}` }}
                >
                  ▸ engage landing
                </button>
              )}
              {tourStep.kind === 'planet' && tourStep.nav.kind === 'link' && (
                <a
                  href={tourStep.nav.target}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${hudBtn} rounded-sm border px-4 py-2 hover:bg-white/10`}
                  style={{ borderColor: `${accent}88`, color: accent }}
                >
                  ▸ open channel
                </a>
              )}
              {tourStep.kind === 'finale' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      endTour()
                      if (contact) setTimeout(() => enterWorld(contact), reduce ? 0 : 120)
                    }}
                    className={`${hudBtn} rounded-sm px-4 py-2 font-semibold text-[#03060f] hover:brightness-110`}
                    style={{ background: accent, boxShadow: `0 0 24px -6px ${accent}` }}
                  >
                    ▸ hail the pilot
                  </button>
                  <button
                    type="button"
                    onClick={endTour}
                    className={`${hudBtn} rounded-sm border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10`}
                  >
                    free flight
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Flight controls dock ──────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-5 py-4 md:px-8">
        <div className="pointer-events-auto flex items-center gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => {
            const done = i < tourIndex
            const active = i === tourIndex
            return (
              <button
                key={i}
                type="button"
                onClick={() => tourGoTo(i)}
                aria-label={`Jump to target ${i + 1}`}
                className="grid h-5 place-items-center focus-visible:outline-none"
              >
                <span
                  className="block transition-all duration-300"
                  style={
                    active
                      ? { width: 20, height: 3, background: accent, boxShadow: `0 0 8px ${accent}` }
                      : { width: 9, height: 3, background: done ? `${accent}88` : 'rgba(255,255,255,0.22)' }
                  }
                />
              </button>
            )
          })}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={tourPrev}
            disabled={tourIndex === 0}
            className={`${hudBtn} rounded-sm border border-white/15 bg-black/40 px-4 py-2 text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30`}
          >
            ◂ prev
          </button>
          {tourIndex < totalSteps - 1 && (
            <button
              type="button"
              onClick={tourNext}
              className={`${hudBtn} rounded-sm px-4 py-2 font-semibold text-[#03060f] hover:brightness-110`}
              style={{ background: accent, boxShadow: `0 0 20px -6px ${accent}` }}
            >
              next ▸
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .hud-scan {
          background-image: repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.03) 0px,
            rgba(255, 255, 255, 0.03) 1px,
            transparent 1px,
            transparent 3px
          );
          mix-blend-mode: overlay;
          opacity: 0.5;
        }
        @media (prefers-reduced-motion: reduce) {
          .hud-scan { display: none; }
        }
      `}</style>
    </div>
  )
}
