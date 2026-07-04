'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

export interface TimelineNode {
  label: string
  title?: string
  text: string
}

/**
 * Venus's signature module: the story as a spine that draws itself.
 *
 * A vertical track whose glowing fill grows with scroll progress, a comet-head
 * marker riding the leading edge, and chapter nodes that rise in as they cross
 * the viewport. Under reduced motion the spine is simply full and static.
 */
export function StoryTimeline({
  nodes,
  accent,
}: {
  nodes: TimelineNode[]
  accent: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 75%', 'end 65%'],
  })
  const fillScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  const headTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div ref={ref} className="relative">
      {/* faint full-length track */}
      <div
        aria-hidden
        className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-white/10"
      />
      {/* glowing fill that grows with scroll */}
      <motion.div
        aria-hidden
        className="absolute bottom-2 left-5 top-2 w-[2px] -translate-x-1/2 origin-top rounded-full"
        style={{
          scaleY: reduce ? 1 : fillScale,
          background: `linear-gradient(180deg, ${accent}, ${accent}55)`,
          boxShadow: `0 0 12px ${accent}`,
        }}
      />
      {/* comet head riding the leading edge */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute left-5 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            top: headTop,
            background: '#fff',
            boxShadow: `0 0 16px 4px ${accent}, 0 0 4px 1px #fff`,
          }}
        />
      )}

      <ol className="space-y-0">
        {nodes.map((n, i) => (
          <motion.li
            key={n.label}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative pb-12 pl-14 last:pb-0 md:pl-16"
          >
            {/* node marker sitting on the spine */}
            <span className="absolute left-5 top-1 grid -translate-x-1/2 place-items-center">
              <span
                className="absolute h-6 w-6 rounded-full"
                style={{ border: `1px solid ${accent}55` }}
              />
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
              />
            </span>
            <p
              className="font-mono text-[11px] uppercase tracking-widest"
              style={{ color: accent }}
            >
              {n.label}
            </p>
            {n.title && (
              <h3 className="mt-1.5 text-lg font-bold text-white md:text-xl">{n.title}</h3>
            )}
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">{n.text}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
