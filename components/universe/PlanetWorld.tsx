'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { PlanetNav } from '@/lib/universe-nav'
import { PLANET_TEXTURE_2K } from '@/lib/planet-textures'
import { useUniverse } from '@/lib/hooks/useUniverse'

const EASE = [0.22, 1, 0.36, 1] as const

// Deterministic floating dust motes (SSR-safe — no Math.random at render).
const MOTES = Array.from({ length: 14 }, (_, i) => {
  const s = Math.sin(i * 12.9898) * 43758.5453
  const r1 = s - Math.floor(s)
  const s2 = Math.sin(i * 78.233) * 12543.21
  const r2 = s2 - Math.floor(s2)
  return {
    left: 4 + r1 * 92, // vw %
    size: 1.5 + r2 * 2.5,
    dur: 14 + r1 * 18,
    delay: r2 * 12,
    drift: (r1 - 0.5) * 60,
  }
})

export function PlanetWorld({
  nav,
  eyebrow,
  title,
  intro,
  children,
}: {
  nav: PlanetNav
  eyebrow: string
  title: string
  intro?: string
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const { exitWorld, takeAnchor } = useUniverse()
  const accent = nav.accent
  const texture = PLANET_TEXTURE_2K[nav.name]
  const sectionRef = useRef<HTMLElement>(null)

  // A moon brought us here → glide to its section once the landing settles.
  useEffect(() => {
    const anchor = takeAnchor()
    if (!anchor || !anchor.startsWith('#')) return
    const id = setTimeout(() => {
      sectionRef.current
        ?.querySelector(anchor)
        ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }, 750)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.section
      ref={sectionRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${nav.label} world`}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#04060e]"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.12, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
      transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
    >
      {/* ── Planet environment ─────────────────────────────────────────── */}
      {/* Sky tinted by this planet's atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(120% 80% at 50% -10%, ${accent}26 0%, transparent 55%), radial-gradient(90% 50% at 50% 115%, ${accent}30 0%, transparent 60%)`,
        }}
      />

      {/* Aurora ribbons drifting in the accent colour */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed -left-1/4 top-1/4 h-[40vh] w-[70vw] rounded-full"
            style={{
              background: `radial-gradient(ellipse at center, ${accent}14 0%, transparent 65%)`,
            }}
            animate={{ x: ['0%', '12%', '0%'], y: ['0%', '-8%', '0%'] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed -right-1/4 top-1/2 h-[36vh] w-[60vw] rounded-full"
            style={{
              background: `radial-gradient(ellipse at center, ${accent}10 0%, transparent 65%)`,
            }}
            animate={{ x: ['0%', '-10%', '0%'], y: ['0%', '6%', '0%'] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* THE PLANET as a giant orb in the sky (top-right) — its real surface
          slowly turning. Decorative only: it never sits behind body text. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed -right-[10vmin] -top-[10vmin] z-0"
        initial={reduce ? false : { opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0 : 1.2, delay: 0.2, ease: EASE }}
      >
        <div
          className="world-orb relative overflow-hidden rounded-full"
          style={{
            width: '42vmin',
            height: '42vmin',
            backgroundImage: `url(${texture})`,
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'repeat-x',
            boxShadow: `0 0 90px -18px ${accent}88, inset -24px -18px 60px rgba(0,0,0,0.75), inset 6px 6px 30px rgba(255,255,255,0.14)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.12), rgba(0,0,0,0) 45%), radial-gradient(circle at 70% 72%, rgba(0,0,0,0.5), rgba(0,0,0,0) 60%)',
            }}
          />
        </div>
      </motion.div>

      {/* Thin, DARK surface horizon at the very bottom — pure ambience. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[20vh]"
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 1.0, delay: 0.3, ease: EASE }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${texture})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            maskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 100%)',
            opacity: 0.32,
          }}
        />
        <div
          className="absolute inset-x-[8%] top-6 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}88, transparent)` }}
        />
      </motion.div>

      {/* Rising dust motes in the planet's light */}
      {!reduce &&
        MOTES.map((m, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="world-mote pointer-events-none fixed rounded-full"
            style={
              {
                left: `${m.left}%`,
                bottom: '-8px',
                width: m.size,
                height: m.size,
                background: accent,
                '--mote-dur': `${m.dur}s`,
                '--mote-delay': `${m.delay}s`,
                '--mote-drift': `${m.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/5 bg-[#04060e]/70 px-5 py-3 backdrop-blur-xl md:px-8">
        <button
          type="button"
          onClick={exitWorld}
          className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-white/80 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          back to space
        </button>

        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/40">
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

      {/* ── Content (staggered reveal) ─────────────────────────────────── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 py-10 pb-[24vh] md:px-8 md:py-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: 0.15 } },
          }}
        >
          <motion.p
            variants={{
              hidden: reduce ? {} : { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
            }}
            className="font-mono text-xs uppercase tracking-[0.25em]"
            style={{ color: accent }}
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            variants={{
              hidden: reduce ? {} : { opacity: 0, y: 22 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }}
            className="mt-3 text-4xl font-bold tracking-tight text-white md:text-6xl"
          >
            {title}
          </motion.h1>
          {intro && (
            <motion.p
              variants={{
                hidden: reduce ? {} : { opacity: 0, y: 22 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
              }}
              className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg"
            >
              {intro}
            </motion.p>
          )}
          <motion.div
            variants={{
              hidden: reduce ? {} : { opacity: 0, y: 28 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
            }}
            className="mt-12"
          >
            {children}
          </motion.div>
        </motion.div>
      </div>

      <style jsx global>{`
        .world-mote {
          opacity: 0;
          animation: moteRise var(--mote-dur, 16s) linear var(--mote-delay, 0s) infinite;
          will-change: transform, opacity;
        }
        @keyframes moteRise {
          0% { opacity: 0; transform: translate3d(0, 0, 0); }
          12% { opacity: 0.55; }
          85% { opacity: 0.25; }
          100% { opacity: 0; transform: translate3d(var(--mote-drift, 20px), -92vh, 0); }
        }
        .world-orb {
          animation: orbTurn 210s linear infinite;
          will-change: background-position;
        }
        @keyframes orbTurn {
          from { background-position-x: 0; }
          to { background-position-x: 84vmin; } /* = 2 × orb width → one revolution */
        }
        @media (prefers-reduced-motion: reduce) {
          .world-mote { display: none; }
          .world-orb { animation: none; }
        }
      `}</style>
    </motion.section>
  )
}

/** A reusable dark glass card used across worlds. */
export function GlassCard({
  children,
  className = '',
  accent,
}: {
  children: ReactNode
  className?: string
  accent?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#0a101f]/85 p-5 backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-white/25 ${className}`}
      style={
        accent
          ? ({
              boxShadow: `inset 0 1px 0 0 ${accent}22`,
              ['--card-accent' as string]: accent,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  )
}
