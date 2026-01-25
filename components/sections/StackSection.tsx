'use client'

import { motion } from 'framer-motion'
import { techStack } from '@/lib/site-config'
import { GlitchOnScroll, NeonPulse, TypedCommand } from '../effects'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const stackCategories = [
  { key: 'languages', label: 'Languages', icon: '>' },
  { key: 'frontend', label: 'Frontend', icon: '' },
  { key: 'backend', label: 'Backend', icon: '' },
  { key: 'tools', label: 'Tools', icon: '' },
  { key: 'learning', label: 'Learning', icon: '' },
] as const

export function StackSection() {
  return (
    <section id="stack" className="section bg-terminal-surface/30 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="container-narrow mx-auto relative z-10">
        {/* Section header */}
        <GlitchOnScroll>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="section-header"
          >
            <h2 className="section-title">
              <NeonPulse color="#22c55e">stack</NeonPulse>
            </h2>
            <span className="text-xs text-terminal-dim font-mono">
              // technical capabilities
            </span>
          </motion.div>
        </GlitchOnScroll>

        {/* Stack grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2"
        >
          {stackCategories.map((category) => (
            <StackCategory
              key={category.key}
              label={category.label}
              icon={category.icon}
              items={techStack[category.key]}
              isLearning={category.key === 'learning'}
            />
          ))}
        </motion.div>

        {/* Command representation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <motion.div
            className="p-4 bg-terminal-bg border border-terminal-border rounded-lg font-mono text-sm hover:border-terminal-accent/50 transition-colors"
            whileHover={{
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)',
            }}
          >
            <TypedCommand command="cat tech_stack.json | jq '.primary'" delay={500} />
            <motion.div
              className="mt-2 text-terminal-accent"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 2 }}
            >
              {'{'}
              <div className="ml-4 text-terminal-text">
                "core": ["TypeScript", "Next.js", "Node.js", "React"]
              </div>
              {'}'}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

interface StackCategoryProps {
  label: string
  icon: string
  items: string[]
  isLearning?: boolean
}

function StackCategory({ label, icon, items, isLearning }: StackCategoryProps) {
  return (
    <motion.div variants={itemVariants} className="space-y-3">
      {/* Category header */}
      <div className="flex items-center gap-2">
        <motion.span
          className="text-terminal-accent"
          animate={isLearning ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isLearning ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : label === 'Languages' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          ) : label === 'Frontend' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ) : label === 'Backend' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </motion.span>
        <span className="text-sm font-medium text-terminal-text">{label}</span>
        {isLearning && (
          <span className="text-2xs text-terminal-dim">(in progress)</span>
        )}
      </div>

      {/* Items */}
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <motion.span
            key={item}
            className={`tag transition-all duration-200 ${
              isLearning
                ? 'border-dashed border-terminal-muted text-terminal-muted hover:border-terminal-accent hover:text-terminal-accent'
                : 'hover:border-terminal-accent hover:text-terminal-accent'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * index }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.2)',
            }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}
