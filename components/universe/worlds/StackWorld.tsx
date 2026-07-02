'use client'

import { techStack } from '@/lib/site-config'
import { aboutMe } from '@/lib/about-me'
import type { PlanetNav } from '@/lib/universe-nav'
import { PlanetWorld, GlassCard } from '../PlanetWorld'

const stackGroups: { label: string; items: string[] }[] = [
  { label: 'languages', items: techStack.languages },
  { label: 'frontend', items: techStack.frontend },
  { label: 'backend', items: techStack.backend },
  { label: 'tools', items: techStack.tools },
  { label: 'learning', items: techStack.learning },
]

export function StackWorld({ nav }: { nav: PlanetNav }) {
  return (
    <PlanetWorld
      nav={nav}
      eyebrow="Saturn · the rings"
      title="The toolbelt & the operating system"
      intro="Saturn's rings are made of a thousand small pieces moving in formation — same as a stack. These are the tools, and the principles they run on."
    >
      {/* ── The stack ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stackGroups.map((g) => (
          <GlassCard key={g.label} accent={nav.accent}>
            <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: nav.accent }}>
              {g.label}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.items.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── How I'm wired ── */}
      <h2 className="mt-12 text-xl font-bold text-white">How I’m wired</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <GlassCard accent={nav.accent}>
          <div className="flex flex-wrap gap-2">
            {aboutMe.strengths.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
              >
                <span aria-hidden>{s.icon}</span> {s.label}
              </span>
            ))}
          </div>
          <ul className="mt-5 space-y-2">
            {aboutMe.principles.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-slate-300">
                <span style={{ color: nav.accent }}>›</span> {p}
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard accent={nav.accent}>
          <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">core loop</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {aboutMe.corePattern.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-md bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-200">
                  {step}
                </span>
                {i < aboutMe.corePattern.length - 1 && <span style={{ color: nav.accent }}>→</span>}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>
    </PlanetWorld>
  )
}
