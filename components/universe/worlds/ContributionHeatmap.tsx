'use client'

import { useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

const WEEKS = 53
const DAYS = 7
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Deterministic 0–4 intensity (same on server + client — no hydration drift). */
function level(w: number, d: number) {
  const n = Math.sin(w * 12.9898 + d * 78.233) * 43758.5453
  const frac = n - Math.floor(n)
  return Math.floor(frac * frac * 5) // biased toward the quiet end, like real activity
}

const alphaFor = [0.25, 0.45, 0.7, 1]
const hexA = (hex: string, a: number) =>
  `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`

/**
 * Jupiter's signature module: the giant's mass of code as a contribution
 * heatmap. A full year of activity squares that cascade in when scrolled into
 * view. Deterministic, so it's stable across renders; static under reduced motion.
 */
export function ContributionHeatmap({ accent }: { accent: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  let total = 0
  for (let w = 0; w < WEEKS; w++) for (let d = 0; d < DAYS; d++) total += level(w, d)
  const approx = total * 11 // pseudo commit-count for the headline

  return (
    <div
      className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a101f]/85 p-5 md:p-7"
      style={{ boxShadow: `inset 0 1px 0 0 ${accent}33` }}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: accent }}>
            the last orbit
          </p>
          <h3 className="mt-1 text-lg font-bold text-white md:text-xl">
            ~{approx.toLocaleString()} contributions of gravity
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/55">
          less
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
          {alphaFor.map((a) => (
            <span key={a} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: hexA(accent, a) }} />
          ))}
          more
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div ref={ref} className="inline-flex flex-col gap-2">
          {/* month row */}
          <div className="flex gap-1 pl-0 font-mono text-[9px] text-white/40">
            {Array.from({ length: WEEKS }, (_, w) => {
              const showMonth = w % 4 === 0
              return (
                <span key={w} className="w-2.5 shrink-0 text-center">
                  {showMonth ? MONTHS[(w / 4) % 12 | 0] : ''}
                </span>
              )
            })}
          </div>
          {/* the grid — rows are days, columns are weeks */}
          <div className="flex gap-1">
            {Array.from({ length: WEEKS }, (_, w) => (
              <div key={w} className="flex flex-col gap-1">
                {Array.from({ length: DAYS }, (_, d) => {
                  const lvl = level(w, d)
                  const bg = lvl === 0 ? 'rgba(255,255,255,0.06)' : hexA(accent, alphaFor[lvl - 1])
                  return (
                    <span
                      key={d}
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{
                        background: bg,
                        opacity: inView || reduce ? 1 : 0,
                        transform: inView || reduce ? 'scale(1)' : 'scale(0.3)',
                        transition: reduce ? 'none' : 'opacity 0.3s ease, transform 0.3s ease',
                        transitionDelay: reduce ? '0ms' : `${(w * DAYS + d) * 1.4}ms`,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
