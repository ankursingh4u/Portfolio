'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useInView,
} from 'framer-motion'
import type { PlanetNav } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'
import { useFocusTrap } from '@/lib/hooks/useFocusTrap'
import { PlanetHero3D } from './worlds/PlanetHero3D'

const EASE = [0.22, 1, 0.36, 1] as const

export interface WorldStat {
  value: string // e.g. "200+", "3", "2 wks"
  label: string // e.g. "web3 projects"
}

/** A stat that counts up when it scrolls into view (falls back for non-numeric). */
function AnimatedStat({ stat, accent }: { stat: WorldStat; accent: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const numMatch = stat.value.match(/^(\D*)(\d+)(.*)$/)
  const target = numMatch ? parseInt(numMatch[2], 10) : 0
  const [shown, setShown] = useState(reduce || !numMatch ? stat.value : `${numMatch[1]}0${numMatch[3]}`)
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { duration: 1.1, bounce: 0 })

  useEffect(() => {
    if (!inView || reduce || !numMatch) return
    mv.set(target)
    const unsub = spring.on('change', (v) => {
      setShown(`${numMatch[1]}${Math.round(v)}${numMatch[3]}`)
    })
    return () => unsub()
  }, [inView, reduce, numMatch, target, mv, spring])

  return (
    <div ref={ref}>
      <div className="text-3xl font-bold text-white md:text-4xl" style={{ color: accent }}>
        {shown}
      </div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-400">
        {stat.label}
      </div>
    </div>
  )
}

export function PlanetWorld({
  nav,
  eyebrow,
  title,
  intro,
  stats,
  children,
}: {
  nav: PlanetNav
  eyebrow: string
  title: string
  intro?: string
  stats?: WorldStat[]
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const { exitWorld, takeAnchor } = useUniverse()
  const accent = nav.accent
  const sectionRef = useRef<HTMLElement>(null)

  // Behave like a real modal dialog: move focus in, trap it, restore on close.
  useFocusTrap(sectionRef)

  // A moon brought us here → glide to its section once the landing settles.
  useEffect(() => {
    const anchor = takeAnchor()
    if (!anchor || !anchor.startsWith('#')) return
    const id = setTimeout(() => {
      sectionRef.current
        ?.querySelector(anchor)
        ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }, 900)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.section
      ref={sectionRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${nav.label} world`}
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#04060e] focus:outline-none"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
      transition={{ duration: reduce ? 0 : 0.75, ease: EASE }}
    >
      {/* Atmospheric tints */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(130% 90% at 78% -10%, ${accent}2e 0%, transparent 52%), radial-gradient(90% 60% at 15% 108%, ${accent}22 0%, transparent 60%)`,
        }}
      />

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/5 bg-[#04060e]/85 px-5 py-3 backdrop-blur-md md:px-8">
        <button
          type="button"
          onClick={exitWorld}
          className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          back to space
        </button>
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/60">
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: accent }} />
          {nav.name} · orbit locked
        </div>
        <button
          type="button"
          onClick={exitWorld}
          aria-label="Close and return to the solar system"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg text-white/70 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          ✕
        </button>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <header className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-5 pb-6 pt-10 md:min-h-[74vh] md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:px-8 md:pt-16">
        {/* Copy */}
        <div className="relative z-10 order-2 md:order-1">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ borderColor: `${accent}44`, color: accent, background: `${accent}12` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
            className="mt-4 text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl"
            style={{
              backgroundImage: `linear-gradient(105deg, #ffffff 30%, ${accent})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {title}
          </motion.h1>
          {intro && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg"
            >
              {intro}
            </motion.p>
          )}
          {stats && stats.length > 0 && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
              className="mt-8 flex flex-wrap gap-x-10 gap-y-5"
            >
              {stats.map((s) => (
                <AnimatedStat key={s.label} stat={s} accent={accent} />
              ))}
            </motion.div>
          )}
        </div>

        {/* The real 3D planet */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
          className="relative order-1 flex items-center justify-center md:order-2"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: `radial-gradient(circle at 50% 45%, ${accent}22, transparent 60%)`,
            }}
          />
          <PlanetHero3D
            planet={nav.name}
            accent={accent}
            className="aspect-square w-[68vw] max-w-[440px] md:w-full"
          />
        </motion.div>

        {/* scroll cue */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-1 z-10 hidden justify-center md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex flex-col items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white/55">
            scroll
            <motion.span
              animate={reduce ? {} : { y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↓
            </motion.span>
          </div>
        </motion.div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-28 pt-6 md:px-8">
        {children}
      </div>

      <style jsx global>{`
        .card-shine::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.09) 50%, transparent 58%);
          transform: translateX(-130%);
          transition: transform 0.7s ease;
          pointer-events: none;
        }
        .card-shine:hover::after { transform: translateX(130%); }
        @media (prefers-reduced-motion: reduce) {
          .card-shine::after { display: none; }
        }
      `}</style>
    </motion.section>
  )
}

/** Section heading with an accent kicker — gives the body editorial rhythm. */
export function WorldSection({
  kicker,
  title,
  subtitle,
  accent,
  children,
}: {
  kicker?: string
  title: string
  subtitle?: string
  accent?: string
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <section className="mt-16 first:mt-4">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {kicker && (
          <p
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: accent ?? '#8ca3d8' }}
          >
            {kicker}
          </p>
        )}
        <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>}
      </motion.div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

/**
 * A reusable dark glass card — slides in from the SIDE on scroll (alternating
 * left/right by index so a grid weaves in), shines on hover.
 */
export function GlassCard({
  children,
  className = '',
  accent,
  index = 0,
}: {
  children: ReactNode
  className?: string
  accent?: string
  index?: number
}) {
  const reduce = useReducedMotion()
  const fromX = index % 2 === 0 ? -48 : 48
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: fromX, y: 12 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: EASE, delay: (index % 3) * 0.06 }}
      className={`card-shine relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a101f]/85 p-5 transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-white/25 ${className}`}
      style={accent ? { boxShadow: `inset 0 1px 0 0 ${accent}22` } : undefined}
    >
      {children}
    </motion.div>
  )
}
