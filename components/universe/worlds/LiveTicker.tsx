'use client'

import { useReducedMotion } from 'framer-motion'

export interface TickerItem {
  text: string
  tag?: string
}

/**
 * Mercury's signature module: the fastest planet, in motion. A continuously
 * scrolling ticker of what's happening right now — pauses on hover so you can
 * read one. Under reduced motion it simply wraps into a static chip cloud.
 */
export function LiveTicker({ items, accent }: { items: TickerItem[]; accent: string }) {
  const reduce = useReducedMotion()
  const row = [...items, ...items] // duplicated for a seamless loop

  const Chip = ({ item, i }: { item: TickerItem; i: number }) => (
    <span
      key={i}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#0a101f]/80 px-4 py-2"
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
      />
      <span className="whitespace-nowrap text-sm text-slate-200">{item.text}</span>
      {item.tag && (
        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-white/45">
          {item.tag}
        </span>
      )}
    </span>
  )

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] py-3"
      style={{ boxShadow: `inset 0 1px 0 0 ${accent}22` }}
    >
      {/* LIVE badge */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 flex h-full items-center bg-gradient-to-r from-[#04060e] via-[#04060e]/90 to-transparent pl-4 pr-8">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest" style={{ color: accent }}>
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: accent }} />
          live
        </span>
      </div>
      {/* right fade */}
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-[#04060e] to-transparent" />

      {reduce ? (
        <div className="flex flex-wrap gap-2 px-4 pl-20">
          {items.map((item, i) => (
            <Chip key={i} item={item} i={i} />
          ))}
        </div>
      ) : (
        <div className="ticker-track flex w-max gap-3 pl-20">
          {row.map((item, i) => (
            <Chip key={i} item={item} i={i} />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .ticker-track {
          animation: ticker-scroll 34s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
