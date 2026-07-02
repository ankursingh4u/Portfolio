'use client'

import { aboutContent } from '@/lib/site-config'
import { aboutMe } from '@/lib/about-me'
import type { PlanetNav } from '@/lib/universe-nav'
import { PlanetWorld, GlassCard } from '../PlanetWorld'

export function StoryWorld({ nav }: { nav: PlanetNav }) {
  return (
    <PlanetWorld
      nav={nav}
      eyebrow="Venus · the story"
      title="The road to here"
      intro={aboutContent.intro}
    >
      {/* ── The narrative arc ── */}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          { label: 'chapter i · 200+ web3 projects', text: aboutContent.journey },
          { label: 'chapter ii · building for real', text: aboutContent.approach },
          { label: 'chapter iii · right now', text: aboutContent.current },
        ].map((b) => (
          <GlassCard key={b.label} accent={nav.accent}>
            <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: nav.accent }}>
              {b.label}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{b.text}</p>
          </GlassCard>
        ))}
      </div>

      {/* ── What drives it ── */}
      <h2 className="mt-12 text-xl font-bold text-white">What drives it</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <GlassCard accent={nav.accent}>
          <p className="text-sm italic leading-relaxed text-slate-300">{aboutMe.identity}</p>
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
        <GlassCard accent={nav.accent}>
          <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">the after</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{aboutMe.ambitionLine}</p>
        </GlassCard>
      </div>

      {/* ── 📚 The Shelf (moon i) ── */}
      <section id="books" className="mt-14 scroll-mt-24">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">📚 The Shelf</h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            moon of venus
          </span>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <GlassCard accent={nav.accent}>
            <p className="text-sm leading-relaxed text-slate-300">
              Reading is how I sharpen the thinking between builds — systems, product, and the
              occasional story that has nothing to do with software (those matter most).
            </p>
          </GlassCard>
          <GlassCard accent={nav.accent}>
            <p className="font-mono text-[11px] uppercase tracking-widest text-slate-400">
              currently on the shelf
            </p>
            <p className="mt-2 text-sm italic leading-relaxed text-slate-400">
              The full list is being catalogued — this orbit fills up soon.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ── 💪 Discipline (moon ii) ── */}
      <section id="discipline" className="mt-12 scroll-mt-24">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">💪 Discipline</h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            moon of venus
          </span>
        </div>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <GlassCard accent={nav.accent}>
            <p className="text-sm leading-relaxed text-slate-300">
              Calisthenics — strength built with nothing but bodyweight and consistency. The same
              muscle that ships products daily: show up, progress a little, repeat.
            </p>
          </GlassCard>
          <GlassCard accent={nav.accent}>
            <p className="text-sm leading-relaxed text-slate-300">{aboutContent.beyond}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['📚 reading', '✈️ traveling', '💪 calisthenics', '🎬 films'].map((t) => (
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
      </section>
    </PlanetWorld>
  )
}
