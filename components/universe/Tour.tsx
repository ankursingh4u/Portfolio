'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { siteConfig } from '@/lib/site-config'
import { navByDest } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'

const EASE = [0.16, 1, 0.3, 1] as const

/** Where the caption card is anchored on screen + where its leader line lands. */
interface Anchor {
  cardX: number
  cardTop: number
  joinX: number
  joinY: number
  targetX: number
  targetY: number
  targetR: number
}

const GAP = 30 // breathing room between the planet edge and the card
const CARD_W = 'min(92vw, 30rem)'

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

  const cardRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<Anchor | null>(null)

  const isPlanet = tourStep?.kind === 'planet'

  // Track the spotlighted planet's live screen position and place the caption
  // beside it with an accurate leader line.
  useEffect(() => {
    if (!tourActive || !isPlanet) {
      setAnchor(null)
      return
    }
    let raf = 0
    const tick = () => {
      const s = getSpotlight()
      if (s) {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const cardH = cardRef.current?.offsetHeight ?? 220
        const halfW = Math.min(vw * 0.92, 480) / 2
        const cardX = Math.max(halfW + 14, Math.min(vw - halfW - 14, s.x))
        const belowTop = s.y + s.r + GAP
        const fitsBelow = belowTop + cardH + 96 <= vh
        const cardTop = fitsBelow ? belowTop : s.y - s.r - GAP - cardH
        const joinY = fitsBelow ? cardTop : cardTop + cardH

        setAnchor((prev) => {
          const next: Anchor = {
            cardX,
            cardTop,
            joinX: cardX,
            joinY,
            targetX: s.x,
            targetY: s.y,
            targetR: s.r,
          }
          if (
            prev &&
            Math.abs(prev.cardX - next.cardX) < 0.5 &&
            Math.abs(prev.cardTop - next.cardTop) < 0.5 &&
            Math.abs(prev.targetX - next.targetX) < 0.5 &&
            Math.abs(prev.targetY - next.targetY) < 0.5
          ) {
            return prev
          }
          return next
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [tourActive, isPlanet, tourIndex, getSpotlight])

  if (!tourActive || !tourStep) return null

  const stepKey = tourStep.kind === 'planet' ? tourStep.nav.name : tourStep.kind
  const contact = navByDest('contact')
  const accent =
    tourStep.kind === 'planet'
      ? tourStep.nav.accent
      : tourStep.kind === 'sun'
        ? '#f5b73b'
        : '#8b7cf6'
  const totalSteps = tourCount + 2
  const stepNo = String(tourIndex + 1).padStart(2, '0')

  // Staggered content reveal inside each card.
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: reduce ? 0 : 0.12 } },
  }
  const item = {
    hidden: reduce ? {} : { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  }

  const chip = (text: string) => (
    <motion.div variants={item} className="flex items-center justify-center gap-2.5">
      <span
        className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-widest"
        style={{ borderColor: `${accent}55`, color: accent, background: `${accent}14` }}
      >
        {stepNo} / {String(totalSteps).padStart(2, '0')}
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
        {text}
      </span>
    </motion.div>
  )

  const cardInner = (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, y: 26, scale: 0.94, filter: 'blur(8px)' }
        }
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={
          reduce ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.97, filter: 'blur(6px)' }
        }
        transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
        className="pointer-events-auto relative overflow-hidden rounded-2xl border bg-[#070c1a]/95 p-6 text-center"
        style={{
          borderColor: `${accent}3a`,
          boxShadow: `0 24px 70px -20px rgba(0,0,0,0.9), 0 0 70px -28px ${accent}88, inset 0 1px 0 0 ${accent}2e`,
        }}
      >
        {/* accent beam + faint orbit decorations */}
        <span
          aria-hidden
          className="absolute inset-x-10 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border"
          style={{ borderColor: `${accent}1f` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full border"
          style={{ borderColor: `${accent}14` }}
        />

        <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
          {tourStep.kind === 'sun' && (
            <>
              {chip('the sun · start here')}
              <motion.h2 variants={item} className="mt-3 text-2xl font-bold text-white md:text-3xl">
                This is {siteConfig.name}
              </motion.h2>
              <motion.p variants={item} className="mt-3 text-sm leading-relaxed text-slate-300">
                At the centre of it all. Everything in this system orbits the work — let me fly
                you through each world, one planet at a time.
              </motion.p>
            </>
          )}

          {tourStep.kind === 'planet' && (
            <>
              {chip(tourStep.nav.name)}
              <motion.h2 variants={item} className="mt-3 text-2xl font-bold text-white md:text-3xl">
                {tourStep.nav.label.replace(' ↗', '')}
              </motion.h2>
              <motion.p variants={item} className="mt-3 text-sm leading-relaxed text-slate-300">
                {tourStep.nav.blurb}
              </motion.p>
              <motion.div variants={item}>
                {tourStep.nav.kind === 'world' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const nav = tourStep.nav
                      endTour()
                      setTimeout(() => enterWorld(nav), reduce ? 0 : 120)
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-[#05070f] transition-transform hover:scale-[1.04]"
                    style={{ background: accent, boxShadow: `0 8px 30px -8px ${accent}aa` }}
                  >
                    Land on this world →
                  </button>
                ) : (
                  <a
                    href={tourStep.nav.target}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Open {tourStep.nav.label}
                  </a>
                )}
              </motion.div>
            </>
          )}

          {tourStep.kind === 'finale' && (
            <>
              {chip('tour complete')}
              <motion.h2 variants={item} className="mt-3 text-2xl font-bold text-white md:text-3xl">
                You’ve seen my cosmos.
              </motion.h2>
              <motion.p variants={item} className="mt-3 text-sm leading-relaxed text-slate-300">
                Now explore it yourself — grab the system, zoom into any world — or jump straight
                to working together.
              </motion.p>
              <motion.div variants={item} className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    endTour()
                    if (contact) setTimeout(() => enterWorld(contact), reduce ? 0 : 120)
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(139,124,246,0.7)] transition-transform hover:scale-[1.04]"
                >
                  Let’s talk →
                </button>
                <button
                  type="button"
                  onClick={endTour}
                  className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Explore freely
                </button>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  // Floating beside the planet only when we have a fresh anchor for THIS step.
  const floating = isPlanet && !!anchor

  return (
    <div className="pointer-events-none fixed inset-0 z-[55]">
      {/* Skip / close */}
      <div className="pointer-events-auto absolute right-0 top-0 p-5">
        <button
          type="button"
          onClick={endTour}
          className="rounded-full border border-white/15 bg-black/70 px-4 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          esc · skip tour ✕
        </button>
      </div>

      {/* Leader line — energy flows from the card toward the planet. */}
      {floating && anchor && (
        <svg
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[54] h-full w-full"
        >
          <motion.line
            key={stepKey}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              strokeDashoffset: reduce ? 0 : [0, -14],
            }}
            transition={{
              opacity: { duration: 0.3 },
              strokeDashoffset: { duration: 0.9, repeat: Infinity, ease: 'linear' },
            }}
            x1={anchor.joinX}
            y1={anchor.joinY}
            x2={anchor.targetX}
            y2={anchor.targetY}
            stroke={accent}
            strokeWidth={1.5}
            strokeDasharray="2 5"
            strokeLinecap="round"
          />
          <motion.circle
            key={`pulse-${stepKey}`}
            cx={anchor.targetX}
            cy={anchor.targetY}
            fill="none"
            stroke={accent}
            strokeWidth={1}
            initial={{ r: 4, opacity: 0.8 }}
            animate={reduce ? { r: 9, opacity: 0.4 } : { r: [5, 14], opacity: [0.7, 0] }}
            transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <circle cx={anchor.targetX} cy={anchor.targetY} r={3.5} fill={accent} />
          <circle cx={anchor.joinX} cy={anchor.joinY} r={2.5} fill={accent} />
        </svg>
      )}

      {/* Caption card — floats beside the planet, or centres for sun/finale */}
      {floating && anchor ? (
        <div
          ref={cardRef}
          className="fixed z-[56]"
          style={{
            left: anchor.cardX,
            top: anchor.cardTop,
            width: CARD_W,
            transform: 'translateX(-50%)',
          }}
        >
          {cardInner}
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-28 px-4 md:bottom-32">
          <div ref={cardRef} className="mx-auto" style={{ width: CARD_W }}>
            {cardInner}
          </div>
        </div>
      )}

      {/* Controls dock — pinned to the bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#02030a] via-[#02030a]/70 to-transparent px-4 pb-6 pt-10">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-4">
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-sm">
            {Array.from({ length: totalSteps }, (_, i) => {
              const active = tourIndex === i
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => tourGoTo(i)}
                  aria-label={`Go to tour step ${i + 1}`}
                  className="grid h-4 place-items-center focus-visible:outline-none"
                >
                  <span
                    className="block rounded-full transition-all duration-300"
                    style={
                      active
                        ? { width: 18, height: 6, background: accent, boxShadow: `0 0 10px ${accent}aa` }
                        : { width: 6, height: 6, background: 'rgba(255,255,255,0.28)' }
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
              className="rounded-full border border-white/15 bg-black/60 px-4 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← prev
            </button>
            {tourIndex < totalSteps - 1 && (
              <button
                type="button"
                onClick={tourNext}
                className="rounded-full px-4 py-2 font-mono text-xs font-semibold text-[#05070f] transition-transform hover:scale-[1.05]"
                style={{ background: accent, boxShadow: `0 6px 24px -8px ${accent}aa` }}
              >
                next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
