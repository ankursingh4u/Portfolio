'use client'

import { aboutContent, siteConfig } from '@/lib/site-config'
import { aboutMe } from '@/lib/about-me'
import { navByDest, type PlanetNav } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'
import { PlanetWorld, GlassCard, type WorldStat } from '../PlanetWorld'

const stats: WorldStat[] = [
  { value: '200+', label: 'web3 projects' },
  { value: '5', label: 'years building' },
  { value: '3', label: 'live products' },
]

const beyond = ['📚 reading', '✈️ traveling', '💪 calisthenics', '🎬 films']

export function SunWorld({ nav }: { nav: PlanetNav }) {
  const { enterWorld, startTour } = useUniverse()
  const contact = navByDest('contact')

  return (
    <PlanetWorld
      nav={nav}
      eyebrow="Sol · the centre"
      title={`I'm ${siteConfig.name}`}
      intro={aboutContent.intro}
      stats={stats}
    >
      {/* who I am */}
      <div className="grid gap-5 md:grid-cols-2">
        <GlassCard accent={nav.accent} index={0}>
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: nav.accent }}>
            who I am
          </p>
          <p className="mt-3 text-sm italic leading-relaxed text-slate-200">{aboutMe.identity}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {aboutMe.ambition.map((a) => (
              <span
                key={a}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-200"
              >
                {a}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard accent={nav.accent} index={1}>
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: nav.accent }}>
            the road here
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Started deep in <strong className="text-amber-200">200+ Web3 projects</strong> — systems
            thinking and experimentation discipline — then moved to building practical products
            people use every day.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{aboutMe.ambitionLine}</p>
        </GlassCard>
      </div>

      {/* life beyond the code */}
      <div className="mt-5">
        <GlassCard accent={nav.accent} index={0}>
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: nav.accent }}>
            beyond the code
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{aboutContent.beyond}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {beyond.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startTour}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#05070f] transition-transform hover:scale-[1.03]"
          style={{ background: nav.accent, boxShadow: `0 10px 30px -10px ${nav.accent}` }}
        >
          🚀 Take the guided flight
        </button>
        <button
          type="button"
          onClick={() => contact && enterWorld(contact)}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Work with me →
        </button>
      </div>
    </PlanetWorld>
  )
}
