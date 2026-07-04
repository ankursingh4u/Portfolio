'use client'

import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export interface OrbitRing {
  label: string
  items: string[]
  color: string
}

/**
 * Saturn's signature module: the stack as an orbital system.
 *
 * Each category is a ring; each technology rides it as a satellite. The rings
 * counter-rotate at different speeds (inner faster, like real orbits) and every
 * chip counter-spins so its label stays upright. All geometry is percent-based,
 * so it scales from phone to desktop without recomputation. Under reduced
 * motion nothing spins — it settles into a clean, legible constellation.
 */
export function OrbitConstellation({
  rings,
  accent,
  centerLabel = 'STACK',
}: {
  rings: OrbitRing[]
  accent: string
  centerLabel?: string
}) {
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState<string | null>(null)

  // Ring radii as a % of the stage half-size, inner → outer.
  const radiusFor = (i: number) => 17 + i * (30 / Math.max(1, rings.length - 1 || 1))

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]">
      {/* faint field glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle at 50% 50%, ${accent}18, transparent 62%)` }}
      />

      {/* the core */}
      <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-center">
        <div
          className="grid h-16 w-16 place-items-center rounded-full border md:h-20 md:w-20"
          style={{
            borderColor: `${accent}66`,
            background: `radial-gradient(circle at 50% 35%, ${accent}55, ${accent}12 70%)`,
            boxShadow: `0 0 40px -6px ${accent}, inset 0 0 20px -6px ${accent}`,
          }}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white md:text-xs">
            {centerLabel}
          </span>
        </div>
      </div>

      {rings.map((ring, ri) => {
        const R = radiusFor(ri)
        const spin = 44 + ri * 16 // seconds — outer rings turn slower
        const dir = ri % 2 === 0 ? 'normal' : 'reverse'
        return (
          <div
            key={ring.label}
            className="orbit-ring absolute inset-0"
            style={
              reduce
                ? undefined
                : { animation: `orbit-spin ${spin}s linear infinite`, animationDirection: dir }
            }
          >
            {/* the ring track */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                width: `${R * 2}%`,
                height: `${R * 2}%`,
                borderColor: `${accent}22`,
              }}
            />
            {ring.items.map((item, ii) => {
              const a = (ii / ring.items.length) * Math.PI * 2 - Math.PI / 2
              const x = 50 + R * Math.cos(a)
              const y = 50 + R * Math.sin(a)
              const isHot = hovered === item
              return (
                <div
                  key={item}
                  className="absolute z-10"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {/* counter-spin keeps the label upright as the ring turns */}
                  <div
                    style={
                      reduce
                        ? undefined
                        : {
                            animation: `orbit-spin ${spin}s linear infinite`,
                            animationDirection: dir === 'normal' ? 'reverse' : 'normal',
                          }
                    }
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setHovered(item)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(item)}
                      onBlur={() => setHovered(null)}
                      className="whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[10px] backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 md:text-[11px]"
                      style={{
                        borderColor: isHot ? accent : 'rgba(255,255,255,0.12)',
                        background: isHot ? `${accent}22` : 'rgba(10,16,31,0.72)',
                        color: isHot ? '#fff' : 'rgb(203,213,225)',
                        boxShadow: isHot ? `0 0 18px -4px ${accent}` : 'none',
                        transform: isHot ? 'scale(1.12)' : 'scale(1)',
                      }}
                    >
                      {item}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* ring legend */}
      <div className="pointer-events-none absolute -bottom-2 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-x-3 gap-y-1">
        {rings.map((r) => (
          <span key={r.label} className="font-mono text-[9px] uppercase tracking-widest text-white/45">
            · {r.label}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes orbit-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .orbit-ring {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
