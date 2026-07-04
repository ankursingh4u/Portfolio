'use client'

import { siteConfig } from '@/lib/site-config'
import type { PlanetNav } from '@/lib/universe-nav'
import { PlanetWorld, GlassCard, WorldSection, type WorldStat } from '../PlanetWorld'
import { SatelliteOrbit } from './SatelliteOrbit'

const stats: WorldStat[] = [
  { value: '24', label: 'hr reply time' },
  { value: '5', label: 'ways to reach me' },
  { value: '100%', label: 'yours to build' },
]

const channels = [
  { label: 'Email', value: siteConfig.email, href: `mailto:${siteConfig.email}`, icon: '✉️' },
  { label: 'GitHub', value: '@ankursingh4u', href: siteConfig.social.github, icon: '🐙' },
  { label: 'LinkedIn', value: 'ankursingh4u', href: siteConfig.social.linkedin, icon: '💼' },
  { label: 'X', value: '@ankursingh_18', href: siteConfig.social.X, icon: '𝕏' },
  { label: 'Instagram', value: '@ankursingh4u', href: siteConfig.social.instagram, icon: '📸' },
]

export function ContactWorld({ nav }: { nav: PlanetNav }) {
  return (
    <PlanetWorld
      nav={nav}
      eyebrow="Neptune · contact"
      title="Let’s build something real"
      intro={`I'm ${siteConfig.status}. Tell me what you're building — I'll scope it, estimate it, and ship it.`}
      stats={stats}
    >
      {/* ── Signature: the satellites in orbit ── */}
      <WorldSection
        kicker="my satellites"
        title="Everything orbits here"
        subtitle="The deepest world is where journeys land. Lock onto a channel to hail me."
        accent={nav.accent}
      >
        <SatelliteOrbit
          accent={nav.accent}
          email={siteConfig.email}
          satellites={channels.filter((c) => c.label !== 'Email')}
        />
      </WorldSection>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {/* Primary CTA */}
        <GlassCard accent={nav.accent} className="flex flex-col justify-center">
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: nav.accent }}>
            the fastest way
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-3 break-all text-2xl font-bold text-white underline-offset-4 hover:underline"
          >
            {siteConfig.email}
          </a>
          <p className="mt-3 text-sm text-slate-400">
            Drop a line about your project, timeline, and rough budget — I usually reply within a day.
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[#05070f]"
            style={{ background: nav.accent }}
          >
            Start the conversation →
          </a>
        </GlassCard>

        {/* Channels */}
        <div className="grid gap-3">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition-colors hover:border-white/25 hover:bg-white/[0.07]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-lg" aria-hidden>
                {c.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{c.label}</div>
                <div className="truncate font-mono text-xs text-slate-400">{c.value}</div>
              </div>
              <span className="ml-auto text-slate-500">↗</span>
            </a>
          ))}
        </div>
      </div>

      <p className="mt-10 text-center font-mono text-xs text-slate-600">
        based in {siteConfig.location} · working with clients worldwide
      </p>
    </PlanetWorld>
  )
}
