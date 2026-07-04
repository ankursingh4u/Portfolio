'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

export type Currency = 'USD' | 'INR'

export interface QuotePlan {
  id: string
  name: string
  usd: number
  inr: number
  fromPrice?: boolean
}
export interface QuoteAddon {
  label: string
  usd: number
  inr: number
}

const fmt = (n: number, c: Currency) =>
  c === 'USD' ? `$${n.toLocaleString()}` : `₹${n.toLocaleString()}`

/**
 * Uranus's signature module: build-your-estimate. Pick a base tier, toggle the
 * add-ons you need, and watch the total tick up live — turning a static price
 * table into a hands-on tool. The number springs whenever it changes.
 */
export function QuoteBuilder({
  plans,
  addons,
  currency,
  accent,
  onStart,
}: {
  plans: QuotePlan[]
  addons: QuoteAddon[]
  currency: Currency
  accent: string
  onStart: () => void
}) {
  const [planId, setPlanId] = useState(plans[1]?.id ?? plans[0]?.id)
  const [picked, setPicked] = useState<Record<string, boolean>>({})

  const total = useMemo(() => {
    const plan = plans.find((p) => p.id === planId) ?? plans[0]
    let sum = currency === 'USD' ? plan.usd : plan.inr
    for (const a of addons) {
      if (picked[a.label]) sum += currency === 'USD' ? a.usd : a.inr
    }
    return sum
  }, [planId, picked, currency, plans, addons])

  const activePlan = plans.find((p) => p.id === planId) ?? plans[0]

  return (
    <div
      className="grid gap-6 rounded-3xl border border-white/10 bg-[#0a101f]/85 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8"
      style={{ boxShadow: `inset 0 1px 0 0 ${accent}33` }}
    >
      {/* choices */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: accent }}>
          1 · base tier
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {plans.map((p) => {
            const on = p.id === planId
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
                aria-pressed={on}
                className="rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                style={{
                  borderColor: on ? accent : 'rgba(255,255,255,0.14)',
                  background: on ? `${accent}22` : 'transparent',
                  color: on ? '#fff' : 'rgb(203,213,225)',
                }}
              >
                {p.name}
                <span className="ml-2 font-mono text-[11px] text-white/55">
                  {fmt(currency === 'USD' ? p.usd : p.inr, currency)}
                </span>
              </button>
            )
          })}
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest" style={{ color: accent }}>
          2 · add-ons
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {addons.map((a) => {
            const on = !!picked[a.label]
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => setPicked((prev) => ({ ...prev, [a.label]: !prev[a.label] }))}
                aria-pressed={on}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                style={{
                  borderColor: on ? `${accent}88` : 'rgba(255,255,255,0.08)',
                  background: on ? `${accent}14` : 'rgba(255,255,255,0.03)',
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="grid h-4 w-4 place-items-center rounded border text-[10px]"
                    style={{
                      borderColor: on ? accent : 'rgba(255,255,255,0.25)',
                      background: on ? accent : 'transparent',
                      color: '#05070f',
                    }}
                  >
                    {on ? '✓' : ''}
                  </span>
                  <span className="font-mono text-xs text-slate-200">{a.label}</span>
                </span>
                <span className="font-mono text-xs text-white/55">
                  +{fmt(currency === 'USD' ? a.usd : a.inr, currency)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* live total */}
      <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/55">
            your estimate
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {activePlan.name}
            {Object.values(picked).filter(Boolean).length > 0 &&
              ` + ${Object.values(picked).filter(Boolean).length} add-on${
                Object.values(picked).filter(Boolean).length > 1 ? 's' : ''
              }`}
          </p>
          <motion.div
            key={total}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="mt-3 text-4xl font-bold text-white"
          >
            {activePlan.fromPrice ? 'from ' : ''}
            {fmt(total, currency)}
          </motion.div>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="mt-6 rounded-full px-5 py-3 text-sm font-semibold text-[#05070f] transition-transform hover:scale-[1.03]"
          style={{ background: accent, boxShadow: `0 10px 30px -12px ${accent}` }}
        >
          Start this project →
        </button>
        <p className="mt-3 text-center font-mono text-[10px] text-white/45">
          estimate only · exact quote after a discovery call
        </p>
      </div>
    </div>
  )
}
