import { siteConfig } from '@/lib/site-config'

/**
 * The "Solar System OS" navigation model — v2.
 *
 * Every planet is a REAL destination now (socials are demoted to satellites of
 * Neptune + the nav). Rule of the universe, sun-outward:
 *
 *   ☿ Mercury  — Now            (fastest planet = what's moving this month)
 *   ♀ Venus    — The Story      (the journey + life beyond code)
 *   🌍 Earth    — Flagships      (home world = my own products, my life's work)
 *   ♂ Mars     — Client Systems (battle-tested, shipped for real businesses)
 *   ♃ Jupiter  — Open Source    (biggest planet = the largest mass of code)
 *   ♄ Saturn   — The Stack      (the rings = the toolbelt + how I work)
 *   ⛢ Uranus   — Pricing        (clear, transparent engagement tiers)
 *   ♆ Neptune  — Contact        (the deepest orbit — where journeys land)
 *
 * Moons are SUB-DESTINATIONS: '#anchor' targets scroll inside the parent
 * world after landing; full URLs open externally.
 */
export type DestId =
  | 'now'
  | 'story'
  | 'flagships'
  | 'clients'
  | 'opensource'
  | 'stack'
  | 'pricing'
  | 'contact'

export interface MoonNav {
  id: string
  /** Shown on hover + used for the moon's aria-label. */
  label: string
  /** '#section-id' inside the parent world, or an external URL. */
  target: string
  tag?: string
  /** Tint — makes multiple moons read as distinct, intentional satellites. */
  color?: string
}

export interface PlanetNav {
  /** Must match the `name` in lib/ephemeris.ts PLANETS. */
  name: string
  /** Human-facing label shown on hover / in the tour. */
  label: string
  kind: 'world' | 'link'
  /** Set when kind === 'world'. */
  destId?: DestId
  /** Full URL when kind === 'link'. */
  target?: string
  /** Accent colour (matches the planet) used across the world UI. */
  accent: string
  /** Short, punchy tour caption. */
  blurb: string
  /** Tiny tagline shown on the hover label. */
  tag: string
  /** Sub-destinations orbiting this planet. */
  moons?: MoonNav[]
}

export const PLANET_NAV: Record<string, PlanetNav> = {
  Mercury: {
    name: 'Mercury',
    label: 'Now',
    kind: 'world',
    destId: 'now',
    accent: '#b8b2a8',
    tag: 'this month · in motion',
    blurb:
      'The fastest planet — what I’m building, shipping and learning right now, updated as I move.',
  },
  Venus: {
    name: 'Venus',
    label: 'The Story',
    kind: 'world',
    destId: 'story',
    accent: '#e8cda2',
    tag: 'the journey · beyond code',
    blurb:
      'From 200+ Web3 projects to building real products — the journey, the discipline, and the life around the code.',
    moons: [
      { id: 'books', label: 'The Shelf', target: '#books', tag: 'reading' , color: '#e8cda2' },
      { id: 'discipline', label: 'Discipline', target: '#discipline', tag: 'calisthenics' , color: '#9be3c0' },
    ],
  },
  Earth: {
    name: 'Earth',
    label: 'Flagships',
    kind: 'world',
    destId: 'flagships',
    accent: '#5b8def',
    tag: 'my products · the life’s work',
    blurb:
      'Home world. The products I own end-to-end — SEO4AI, DemandRadar and Palm Insights — live and growing.',
    moons: [
      { id: 'seo4ai', label: 'SEO4AI', target: '#seo4ai', tag: 'AI share-of-voice' , color: '#5b8def' },
      { id: 'demandradar', label: 'DemandRadar', target: '#demandradar', tag: 'Shopify app' , color: '#a855f7' },
      { id: 'palm', label: 'Palm Insights', target: '#palm', tag: 'analytics' , color: '#34d399' },
    ],
  },
  Mars: {
    name: 'Mars',
    label: 'Client Systems',
    kind: 'world',
    destId: 'clients',
    accent: '#d96f43',
    tag: 'real businesses · in production',
    blurb:
      'Battle-tested ground — paid systems for real businesses, every one live in production right now.',
    moons: [
      { id: 'saltys', label: "Salty's Seafood", target: '#saltys', tag: 'Australia' , color: '#f59e0b' },
      { id: 'steelline', label: 'Steel Line Logistics', target: '#steelline', tag: 'India' , color: '#22d3ee' },
      { id: 'draftinvitations', label: 'DraftInvitations', target: '#draftinvitations', tag: 'India' , color: '#ec4899' },
    ],
  },
  Jupiter: {
    name: 'Jupiter',
    label: 'Open Source',
    kind: 'world',
    destId: 'opensource',
    accent: '#d8a772',
    tag: 'github · experiments · web3',
    blurb:
      'The giant — the largest mass of code. Live GitHub repos, experiments, and the Web3 research era.',
    moons: [
      { id: 'github', label: 'GitHub', target: siteConfig.social.github, tag: '@ankursingh4u' },
      { id: 'web3', label: 'Web3 Era', target: '#web3', tag: '200+ projects' , color: '#d8a772' },
    ],
  },
  Saturn: {
    name: 'Saturn',
    label: 'The Stack',
    kind: 'world',
    destId: 'stack',
    accent: '#e3d2a0',
    tag: 'skills · how I work',
    blurb:
      'The ringed one — the toolbelt. Languages, frameworks, and the principles every build runs on.',
  },
  Uranus: {
    name: 'Uranus',
    label: 'Pricing',
    kind: 'world',
    destId: 'pricing',
    accent: '#a8e0e6',
    tag: 'transparent & fair',
    blurb: 'Clear engagement tiers — from a one-page launch to a full-stack platform.',
  },
  Neptune: {
    name: 'Neptune',
    label: 'Contact',
    kind: 'world',
    destId: 'contact',
    accent: '#6f8ff0',
    tag: 'let’s build something',
    blurb:
      'The farthest world, and the most important — this is where we start working together. My satellites orbit here.',
    moons: [
      { id: 'github-sat', label: 'GitHub ↗', target: siteConfig.social.github, tag: 'satellite' },
      { id: 'linkedin-sat', label: 'LinkedIn ↗', target: siteConfig.social.linkedin, tag: 'satellite' },
      { id: 'x-sat', label: 'X ↗', target: siteConfig.social.X, tag: 'satellite' },
      { id: 'insta-sat', label: 'Instagram ↗', target: siteConfig.social.instagram, tag: 'satellite' },
    ],
  },
}

/** Tour visits the system sun-outward, the way the eye already follows the orbits. */
export const TOUR_ORDER = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
] as const

/** Quick lookups. */
export const WORLDS = Object.values(PLANET_NAV).filter((n) => n.kind === 'world')
export const navByDest = (id: DestId) => WORLDS.find((w) => w.destId === id)
