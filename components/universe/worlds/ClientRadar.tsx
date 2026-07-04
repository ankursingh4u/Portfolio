'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface RadarPin {
  id: string
  name: string
  sub: string
  /** Position in the 0–400 viewBox. */
  x: number
  y: number
  accent: string
}

/**
 * Mars's signature module: a mission-control radar.
 *
 * Client systems plotted as contacts around a central hub, each linked by an
 * arc that draws itself into view. A sweep line rotates over the grid; pins
 * pulse and reveal a callout on hover/focus. Reduced motion drops the sweep and
 * shows the arcs already drawn.
 */
export function ClientRadar({ pins, accent }: { pins: RadarPin[]; accent: string }) {
  const reduce = useReducedMotion()
  const [active, setActive] = useState<string | null>(null)
  const cx = 200
  const cy = 200

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="70%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweep-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.5" />
          </linearGradient>
        </defs>

        <circle cx={cx} cy={cy} r={190} fill="url(#radar-glow)" />

        {/* range rings */}
        {[60, 120, 180].map((r) => (
          <circle
            key={r}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={accent}
            strokeOpacity={0.16}
            strokeWidth={1}
          />
        ))}
        {/* cross axes */}
        <line x1={cx} y1={10} x2={cx} y2={390} stroke={accent} strokeOpacity={0.1} />
        <line x1={10} y1={cy} x2={390} y2={cy} stroke={accent} strokeOpacity={0.1} />

        {/* rotating sweep */}
        {!reduce && (
          <motion.g
            style={{ originX: '200px', originY: '200px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          >
            <path d={`M${cx},${cy} L${cx},${cy - 180} A180,180 0 0,1 ${cx + 62},${cy - 169} Z`} fill="url(#sweep-grad)" />
            <line x1={cx} y1={cy} x2={cx} y2={cy - 180} stroke={accent} strokeOpacity={0.6} strokeWidth={1.5} />
          </motion.g>
        )}

        {/* connection arcs (drawn on view) */}
        {pins.map((p, i) => {
          const mx = (cx + p.x) / 2
          const my = (cy + p.y) / 2 - 46 // bow the arc upward
          return (
            <motion.path
              key={`arc-${p.id}`}
              d={`M${cx},${cy} Q${mx},${my} ${p.x},${p.y}`}
              fill="none"
              stroke={p.accent}
              strokeWidth={active === p.id ? 2 : 1.2}
              strokeOpacity={active && active !== p.id ? 0.25 : 0.7}
              strokeDasharray="1"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0 : 1, delay: reduce ? 0 : 0.3 + i * 0.25, ease: 'easeInOut' }}
            />
          )
        })}

        {/* central hub */}
        <circle cx={cx} cy={cy} r={7} fill={accent} />
        <circle cx={cx} cy={cy} r={7} fill="none" stroke={accent} strokeOpacity={0.5}>
          {!reduce && <animate attributeName="r" values="7;18;7" dur="2.6s" repeatCount="indefinite" />}
          {!reduce && <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite" />}
        </circle>

        {/* client pins */}
        {pins.map((p) => (
          <g
            key={p.id}
            className="cursor-pointer"
            onMouseEnter={() => setActive(p.id)}
            onMouseLeave={() => setActive(null)}
            tabIndex={0}
            role="button"
            aria-label={`${p.name} — ${p.sub}`}
            onFocus={() => setActive(p.id)}
            onBlur={() => setActive(null)}
            style={{ outline: 'none' }}
          >
            <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
            <circle cx={p.x} cy={p.y} r={active === p.id ? 6 : 4.5} fill={p.accent} style={{ transition: 'r 0.2s' }} />
            <circle cx={p.x} cy={p.y} r={5} fill="none" stroke={p.accent} strokeOpacity={0.6}>
              {!reduce && <animate attributeName="r" values="5;13;5" dur="2.2s" repeatCount="indefinite" />}
              {!reduce && <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />}
            </circle>
          </g>
        ))}
      </svg>

      {/* HTML callouts (crisp text, positioned over the SVG) */}
      {pins.map((p) => (
        <div
          key={`label-${p.id}`}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full transition-all duration-200"
          style={{
            left: `${(p.x / 400) * 100}%`,
            top: `${(p.y / 400) * 100}%`,
            marginTop: -14,
            opacity: active === p.id ? 1 : 0.72,
            transform: `translate(-50%, -100%) scale(${active === p.id ? 1 : 0.94})`,
          }}
        >
          <div
            className="whitespace-nowrap rounded-lg border bg-[#0a0605]/85 px-2.5 py-1.5 backdrop-blur-sm"
            style={{ borderColor: active === p.id ? p.accent : 'rgba(255,255,255,0.12)' }}
          >
            <p className="text-xs font-bold text-white">{p.name}</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-white/60">{p.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
