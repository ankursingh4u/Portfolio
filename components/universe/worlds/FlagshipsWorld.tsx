'use client'

import { personalProjects, coolestProjects } from '@/lib/site-config'
import type { PlanetNav } from '@/lib/universe-nav'
import { PlanetWorld, GlassCard } from '../PlanetWorld'
import { LivePreview } from './LivePreview'

// ── My own SaaS products — the life's work, each one a moon of Earth ────────
const flagships = [
  {
    id: 'seo4ai',
    name: 'SEO4AI',
    tagline: 'Track & grow your brand inside AI answers',
    desc: 'Measures whether ChatGPT, Gemini, Perplexity & Claude recommend you — and how to grow your AI share-of-voice.',
    url: 'https://seo4ai.app',
    tech: ['Next.js', 'TypeScript', 'OpenAI', 'Gemini', 'PostgreSQL'],
    accent: '#5b8def',
    moon: '🛰 moon i',
  },
  {
    id: 'demandradar',
    name: 'DemandRadar',
    tagline: 'Turn missed searches into your next products',
    desc: 'A Shopify app that catches what shoppers search for but the store doesn’t sell — surfacing that hidden demand so merchants know exactly which products to add next and stop losing sales to zero-result searches.',
    url: 'https://apps.shopify.com/demandradar',
    tech: ['Next.js', 'TypeScript', 'Shopify API', 'PostgreSQL', 'Polaris'],
    accent: '#a855f7',
    moon: '🛰 moon ii',
  },
  {
    id: 'palm',
    name: 'Palm Insights',
    tagline: 'Turns raw data into clear insights',
    desc: 'A clean analytics layer that turns messy raw data into decisions you can actually act on.',
    url: 'https://palm-drab.vercel.app',
    tech: ['Next.js', 'TypeScript', 'Vercel'],
    accent: '#34d399',
    moon: '🛰 moon iii',
  },
]

export function FlagshipsWorld({ nav }: { nav: PlanetNav }) {
  return (
    <PlanetWorld
      nav={nav}
      eyebrow="Earth · home world"
      title="The flagships"
      intro="The products I own end-to-end — idea, architecture, code, launch, growth. Each one orbits Earth as its own moon. This is the life's work."
    >
      {/* ── Flagship products — full-width, one per moon ── */}
      <div className="space-y-10">
        {flagships.map((p, i) => (
          <section
            key={p.id}
            id={p.id}
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-[#0a101f]/85 backdrop-blur-xl"
            style={{ boxShadow: `inset 0 1px 0 0 ${p.accent}33, 0 20px 60px -30px ${p.accent}44` }}
          >
            <div className={`grid md:grid-cols-2 ${i % 2 ? 'md:[direction:rtl]' : ''}`}>
              <div className="md:[direction:ltr]">
                <LivePreview url={p.url} name={p.name} />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-8 md:[direction:ltr]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    {p.moon}
                  </span>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-300">
                    live
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">{p.name}</h2>
                <p className="mt-1 text-sm font-semibold" style={{ color: p.accent }}>
                  {p.tagline}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{p.desc}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-[#05070f] transition-transform hover:scale-[1.03]"
                  style={{ background: p.accent }}
                >
                  Visit {p.name} ↗
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── More from the workshop ── */}
      <h2 className="mt-14 text-xl font-bold text-white">More from the workshop</h2>
      <p className="mt-1 text-sm text-slate-400">
        Products that came before — each one taught the flagships something.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ...coolestProjects.filter((p) => p.id === 'agromind' || p.id === 'smart-search'),
          ...personalProjects.filter((p) => p.id === 'farmer-assistant' || p.id === 'drive-clone'),
        ].map((p) => (
          <GlassCard key={p.id}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{p.name}</h3>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase text-slate-400">
                {('status' in p ? p.status : '').toString().replace('-', ' ')}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
              {'tagline' in p ? p.tagline : 'description' in p ? p.description : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {('tech' in p ? p.tech : []).slice(0, 4).map((t) => (
                <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                  {t}
                </span>
              ))}
            </div>
            {'link' in p && p.link && (
              <a
                href={p.link as string}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-mono text-[11px] text-white/70 underline-offset-2 hover:underline"
              >
                open ↗
              </a>
            )}
          </GlassCard>
        ))}
      </div>
    </PlanetWorld>
  )
}
