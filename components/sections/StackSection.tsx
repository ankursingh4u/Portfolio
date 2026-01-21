'use client'

import { techStack } from '@/lib/site-config'

export function StackSection() {
  const stackCategories = [
    { key: 'languages', label: 'Languages', icon: '>' },
    { key: 'frontend', label: 'Frontend', icon: '◇' },
    { key: 'backend', label: 'Backend', icon: '◆' },
    { key: 'tools', label: 'Tools', icon: '⚙' },
    { key: 'learning', label: 'Learning', icon: '↗' },
  ] as const

  return (
    <section id="stack" className="section bg-terminal-surface/30">
      <div className="container-narrow mx-auto">
        {/* Section header */}
        <div className="section-header">
          <h2 className="section-title">stack</h2>
          <span className="text-xs text-terminal-dim font-mono">
            // technical capabilities
          </span>
        </div>

        {/* Stack grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {stackCategories.map((category) => (
            <StackCategory
              key={category.key}
              label={category.label}
              icon={category.icon}
              items={techStack[category.key]}
              isLearning={category.key === 'learning'}
            />
          ))}
        </div>

        {/* Command representation */}
        <div className="mt-8 p-4 bg-terminal-bg border border-terminal-border rounded-lg font-mono text-sm">
          <div className="text-terminal-dim">
            <span className="text-terminal-muted">$</span>
            <span className="ml-2">cat tech_stack.json | jq '.primary'</span>
          </div>
          <div className="mt-2 text-terminal-accent">
            {'{'}
            <div className="ml-4 text-terminal-text">
              "core": ["TypeScript","Next.js", "Node.js, React"]
            </div>
            {'}'}
          </div>
        </div>
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
    <div className="space-y-3">
      {/* Category header */}
      <div className="flex items-center gap-2">
        <span className="text-terminal-accent">{icon}</span>
        <span className="text-sm font-medium text-terminal-text">{label}</span>
        {isLearning && (
          <span className="text-2xs text-terminal-dim">(in progress)</span>
        )}
      </div>

      {/* Items */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`tag ${
              isLearning
                ? 'border-dashed border-terminal-muted text-terminal-muted'
                : ''
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
