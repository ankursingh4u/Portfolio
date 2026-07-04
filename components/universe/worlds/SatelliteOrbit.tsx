'use client'

import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export interface Satellite {
  label: string
  value: string
  href: string
  icon: string
}

/**
 * Neptune's signature module: the satellites literally in orbit. Each channel
 * is a spacecraft circling the contact core; hover/focus to lock on, click to
 * hail. The ring turns slowly and each satellite counter-spins to stay upright.
 * Static and fully usable under reduced motion.
 */
export function SatelliteOrbit({
  satellites,
  accent,
  email,
}: {
  satellites: Satellite[]
  accent: string
  email: string
}) {
  const reduce = useReducedMotion()
  const [hot, setHot] = useState<string | null>(null)
  const R = 40 // ring radius as % of stage half-size
  const spin = 48

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accent}1e, transparent 62%)` }}
      />

      {/* core — the fastest way to reach me */}
      <a
        href={`mailto:${email}`}
        onMouseEnter={() => setHot('core')}
        onMouseLeave={() => setHot(null)}
        onFocus={() => setHot('core')}
        onBlur={() => setHot(null)}
        className="absolute left-1/2 top-1/2 z-20 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-center transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:h-28 md:w-28"
        style={{
          borderColor: `${accent}66`,
          background: `radial-gradient(circle at 50% 35%, ${accent}44, ${accent}10 70%)`,
          boxShadow: `0 0 44px -6px ${accent}`,
          transform: `translate(-50%, -50%) scale(${hot === 'core' ? 1.06 : 1})`,
        }}
      >
        <span className="px-2">
          <span className="block text-lg" aria-hidden>
            ✉️
          </span>
          <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-widest text-white/80">
            email me
          </span>
        </span>
      </a>

      {/* ring track */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ width: `${R * 2}%`, height: `${R * 2}%`, borderColor: `${accent}22` }}
      />

      {/* orbiting satellites */}
      <div
        className="absolute inset-0"
        style={reduce ? undefined : { animation: `sat-orbit ${spin}s linear infinite` }}
      >
        {satellites.map((s, i) => {
          const a = (i / satellites.length) * Math.PI * 2 - Math.PI / 2
          const x = 50 + R * Math.cos(a)
          const y = 50 + R * Math.sin(a)
          const isHot = hot === s.label
          return (
            <div
              key={s.label}
              className="absolute z-10"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div style={reduce ? undefined : { animation: `sat-orbit ${spin}s linear infinite reverse` }}>
                <a
                  href={s.href}
                  target={s.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={`${s.label} — ${s.value}`}
                  onMouseEnter={() => setHot(s.label)}
                  onMouseLeave={() => setHot(null)}
                  onFocus={() => setHot(s.label)}
                  onBlur={() => setHot(null)}
                  className="flex items-center gap-2 rounded-full border px-2.5 py-1.5 backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  style={{
                    borderColor: isHot ? accent : 'rgba(255,255,255,0.14)',
                    background: isHot ? `${accent}22` : 'rgba(10,16,31,0.8)',
                    boxShadow: isHot ? `0 0 18px -4px ${accent}` : 'none',
                    transform: isHot ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  <span className="text-sm leading-none" aria-hidden>
                    {s.icon}
                  </span>
                  <span className="whitespace-nowrap text-xs font-medium text-white">{s.label}</span>
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes sat-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
