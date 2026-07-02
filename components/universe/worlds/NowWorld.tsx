'use client'

import { aboutContent, companyConfig, currentWork, siteConfig } from '@/lib/site-config'
import { navByDest, type PlanetNav } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'
import { PlanetWorld, GlassCard } from '../PlanetWorld'

export function NowWorld({ nav }: { nav: PlanetNav }) {
  const { enterWorld } = useUniverse()
  const contact = navByDest('contact')
  const flagships = navByDest('flagships')

  return (
    <PlanetWorld
      nav={nav}
      eyebrow="Mercury · now"
      title="In motion, right now"
      intro="The fastest orbit carries the freshest news — what I'm building, shipping and learning this month."
    >
      {/* status banner */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] px-5 py-4"
        style={{ boxShadow: 'inset 0 1px 0 0 rgba(52,211,153,0.2)' }}
      >
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
        <p className="font-mono text-sm text-emerald-200">{siteConfig.status}</p>
        <button
          type="button"
          onClick={() => contact && enterWorld(contact)}
          className="ml-auto rounded-full bg-emerald-400/90 px-4 py-1.5 text-sm font-semibold text-[#05070f] transition-transform hover:scale-[1.03]"
        >
          Start a conversation →
        </button>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {/* shipping at work */}
        <GlassCard accent={nav.accent}>
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: nav.accent }}>
            shipping · {companyConfig.name}
          </p>
          <h2 className="mt-2 text-lg font-bold text-white">{currentWork.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{currentWork.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {currentWork.tech.map((t) => (
              <span key={t} className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-slate-500">{currentWork.year}</p>
        </GlassCard>

        {/* building for myself */}
        <GlassCard accent={nav.accent}>
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: nav.accent }}>
            building · the flagships
          </p>
          <h2 className="mt-2 text-lg font-bold text-white">SEO4AI · DemandRadar · Palm Insights</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Growing my own products in parallel — AI share-of-voice tracking, Shopify demand
            intelligence, and clean analytics. All live.
          </p>
          <button
            type="button"
            onClick={() => flagships && enterWorld(flagships)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Fly to Earth → flagships
          </button>
        </GlassCard>

        {/* learning */}
        <GlassCard accent={nav.accent} className="md:col-span-2">
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: nav.accent }}>
            sharpening
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{aboutContent.current}</p>
        </GlassCard>
      </div>
    </PlanetWorld>
  )
}
