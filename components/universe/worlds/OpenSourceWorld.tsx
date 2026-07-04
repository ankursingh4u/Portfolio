'use client'

import { useEffect, useState } from 'react'
import { aboutContent, personalProjects, siteConfig } from '@/lib/site-config'
import type { PlanetNav } from '@/lib/universe-nav'
import { PlanetWorld, GlassCard, WorldSection, type WorldStat } from '../PlanetWorld'
import { ContributionHeatmap } from './ContributionHeatmap'

const stats: WorldStat[] = [
  { value: '200+', label: 'web3 projects' },
  { value: '12', label: 'live repos' },
  { value: '5', label: 'years shipping OSS' },
]

interface Repo {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
}

const web3 = personalProjects.find((p) => p.id === 'web3-exploration')

export function OpenSourceWorld({ nav }: { nav: PlanetNav }) {
  const [repos, setRepos] = useState<Repo[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/github')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        const list: Repo[] = Array.isArray(data) ? data : data.repos ?? []
        setRepos(list.slice(0, 12))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <PlanetWorld
      nav={nav}
      eyebrow="Jupiter · the giant"
      title="The largest mass of code"
      intro="Open source, experiments, and the era that forged the systems thinking — 200+ Web3 projects deep. The biggest planet holds the most gravity."
      stats={stats}
    >
      {/* ── Signature: a year of contributions ── */}
      <WorldSection
        kicker="the mass of code"
        title="A year in the giant's gravity"
        subtitle="Every square is a day of shipping — the biggest planet holds the most."
        accent={nav.accent}
      >
        <ContributionHeatmap accent={nav.accent} />
      </WorldSection>

      {/* ── Live from GitHub ── */}
      <div className="mt-16 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Live from GitHub</h2>
          <p className="mt-1 text-sm text-slate-400">
            Pulled straight from the source — sorted by last push.
          </p>
        </div>
        <a
          href={siteConfig.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-mono text-xs text-white transition-colors hover:bg-white/10"
        >
          @ankursingh4u ↗
        </a>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {repos.length > 0
          ? repos.map((r) => (
              <a
                key={r.name}
                href={r.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-white/10 bg-[#0a101f]/85 p-4 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
              >
                <div className="flex items-center justify-between">
                  <h3 className="truncate font-mono text-sm font-bold text-white">{r.name}</h3>
                  {r.stargazers_count > 0 && (
                    <span className="font-mono text-[11px] text-amber-300">★ {r.stargazers_count}</span>
                  )}
                </div>
                {r.description && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">
                    {r.description}
                  </p>
                )}
                {r.language && (
                  <p className="mt-3 font-mono text-[11px] text-slate-500">{r.language}</p>
                )}
              </a>
            ))
          : Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"
              />
            ))}
      </div>

      {/* ── The Web3 era ── */}
      <section id="web3" className="mt-14 scroll-mt-24">
        <div
          className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a101f]/85 p-6 backdrop-blur-xl md:p-8"
          style={{ boxShadow: `inset 0 1px 0 0 ${nav.accent}33` }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-white">The Web3 era</h2>
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-slate-400">
              {web3?.year ?? '2018–2023'} · 200+ projects
            </span>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
            {web3?.description ?? aboutContent.journey}
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
            {aboutContent.journey}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(web3?.tech ?? ['NFTs', 'Ethereum', 'DeFi', 'Research']).map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Case-study slots — filled as they're written */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {['Systems thinking at scale', 'Experimentation discipline', 'Decentralised ecosystems'].map((t, i) => (
                <GlassCard key={t} accent={nav.accent} index={i}>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    case study
                  </p>
                  <h3 className="mt-2 text-sm font-bold text-white">{t}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Deep-dive being written — landing in this orbit soon.
                  </p>
                </GlassCard>
              ),
            )}
          </div>
        </div>
      </section>
    </PlanetWorld>
  )
}
