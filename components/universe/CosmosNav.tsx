'use client'

import { SUN_NAV, WORLDS } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'

/**
 * The accessible spine of the universe.
 *
 * The 3D scene is a <canvas> — invisible to screen readers and unreachable by
 * keyboard. This is the real, semantic list of every destination: a skip-nav
 * that is visually hidden until focused (Tab on page load reveals it), giving
 * keyboard + assistive-tech users — and crawlers — a first-class way in.
 */
export function CosmosNav() {
  const { enterWorld, phase, tourActive } = useUniverse()

  // Only the home view owns this entry point; open worlds trap their own focus.
  if (phase !== 'home' || tourActive) return null

  const destinations = [SUN_NAV, ...WORLDS]

  return (
    <nav
      aria-label="Jump to a world"
      className="sr-only z-[80] focus-within:not-sr-only focus-within:fixed focus-within:left-3 focus-within:top-3 focus-within:w-72 focus-within:rounded-2xl focus-within:border focus-within:border-white/15 focus-within:bg-[#070d1c]/95 focus-within:p-2 focus-within:shadow-2xl focus-within:backdrop-blur-xl"
    >
      <p className="px-2 pb-1 pt-1 font-mono text-[11px] uppercase tracking-widest text-white/70">
        Jump to a world
      </p>
      <ul>
        {destinations.map((w) => (
          <li key={w.destId}>
            <button
              type="button"
              onClick={() => enterWorld(w)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.07] focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: w.accent, boxShadow: `0 0 8px ${w.accent}` }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">{w.label}</span>
                <span className="block truncate font-mono text-[10px] text-white/55">
                  {w.name} · {w.tag}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
