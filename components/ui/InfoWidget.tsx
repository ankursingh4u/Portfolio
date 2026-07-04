'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function InfoWidget() {
  const [now, setNow] = useState<Date | null>(null)

  // Live clock — no location lookups (a geolocation prompt felt intrusive).
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now
    ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--'
  const day = now ? now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }) : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
      <div className="leading-tight">
        <span className="font-mono text-xs font-semibold tabular-nums text-white/90">{time}</span>
        <span className="ml-1.5 font-mono text-[10px] text-white/40">{day}</span>
      </div>
    </motion.div>
  )
}
