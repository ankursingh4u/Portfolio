'use client'

import { companyProjects } from '@/lib/site-config'
import type { PlanetNav } from '@/lib/universe-nav'
import { PlanetWorld, GlassCard } from '../PlanetWorld'
import { LivePreview } from './LivePreview'

// ── Paid client work, live in production — each one a moon of Mars ──────────
const clientWork = [
  {
    id: 'saltys',
    name: "Salty's Seafood",
    sub: 'Seafood takeaway · Australia',
    desc: 'Full online ordering system — browse the menu, place orders, owner dashboard to manage them. Replaced a paper + call-only flow.',
    url: 'https://www.saltysseafood.com/',
    video: '/saltys-seafood.mp4',
    meta: 'delivered in 2 weeks',
    accent: '#f59e0b',
  },
  {
    id: 'steelline',
    name: 'Steel Line Logistics',
    sub: 'Truck cargo shipping · India',
    desc: 'Client truck-booking + an admin panel to manage bookings, drivers and trips from a single dashboard.',
    url: 'https://www.steellinelogistics.in/',
    video: '/steelline-logistics.mp4',
    meta: 'delivered in 3 weeks',
    accent: '#22d3ee',
  },
  {
    id: 'draftinvitations',
    name: 'DraftInvitations',
    sub: 'Digital invitations · India',
    desc: 'Create and share beautiful digital invitations in minutes — wedding, birthday & event cards with RSVP-ready links.',
    url: 'https://draftinvitations.in',
    video: null as string | null,
    meta: 'live product',
    accent: '#ec4899',
  },
]

export function ClientsWorld({ nav }: { nav: PlanetNav }) {
  return (
    <PlanetWorld
      nav={nav}
      eyebrow="Mars · client systems"
      title="Shipped for real businesses"
      intro="Paid systems running in production right now — ordering, logistics, invitations. Real merchants, real money, real uptime. Every one of these is a moon of Mars."
    >
      <div className="space-y-10">
        {clientWork.map((c) => (
          <section
            key={c.id}
            id={c.id}
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-[#0a101f]/85 backdrop-blur-xl"
            style={{ boxShadow: `inset 0 1px 0 0 ${c.accent}33` }}
          >
            <div className="grid md:grid-cols-2">
              <LivePreview url={c.url} video={c.video} name={c.name} />
              <div className="flex flex-col justify-center p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white">{c.name}</h2>
                <p className="mt-0.5 font-mono text-[11px] text-slate-500">{c.sub}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{c.desc}</p>
                <p className="mt-4 font-mono text-[11px]" style={{ color: c.accent }}>
                  ⚡ {c.meta}
                </p>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Visit the live site ↗
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── Production Shopify apps built at CodersHive ── */}
      <h2 className="mt-14 text-xl font-bold text-white">Production Shopify apps</h2>
      <p className="mt-1 text-sm text-slate-400">
        Built at CodersHive — used by real merchants every day.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companyProjects.map((p) => (
          <GlassCard key={p.id} accent={nav.accent}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{p.name}</h3>
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase text-slate-400">
                {('status' in p ? p.status : '').toString().replace('-', ' ')}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
              {'description' in p ? p.description : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {('tech' in p ? p.tech : []).slice(0, 4).map((t) => (
                <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </PlanetWorld>
  )
}
