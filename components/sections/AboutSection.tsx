'use client'

import { aboutContent, siteConfig } from '@/lib/site-config'
import { TerminalWindow, CommentLine } from '../terminal'

export function AboutSection() {
  return (
    <section id="about" className="section bg-terminal-surface/30">
      <div className="container-narrow mx-auto">
        {/* Section header */}
        <div className="section-header">
          <h2 className="section-title">about</h2>
          <span className="text-xs text-terminal-dim font-mono">
            // engineer profile
          </span>
        </div>

        {/* Terminal window */}
        <TerminalWindow title={`cat about_${siteConfig.username}.md`}>
          <div className="space-y-6">
            {/* Intro */}
            <div className="space-y-3">
              <CommentLine>Introduction</CommentLine>
              <p className="text-sm md:text-base text-terminal-text leading-relaxed">
                {aboutContent.intro}
              </p>
            </div>

            {/* Journey */}
            <div className="space-y-3">
              <CommentLine>The Journey</CommentLine>
              <p className="text-sm md:text-base text-terminal-dim leading-relaxed">
                {aboutContent.journey}
              </p>
            </div>

            {/* Approach */}
            <div className="space-y-3">
              <CommentLine>Engineering Approach</CommentLine>
              <p className="text-sm md:text-base text-terminal-dim leading-relaxed">
                {aboutContent.approach}
              </p>
            </div>

            {/* Current focus */}
            <div className="space-y-3">
              <CommentLine>Current Focus</CommentLine>
              <p className="text-sm md:text-base text-terminal-dim leading-relaxed">
                {aboutContent.current}
              </p>
            </div>

            {/* Beyond code */}
            <div className="space-y-3">
              <CommentLine>Beyond Code</CommentLine>
              <p className="text-sm md:text-base text-terminal-dim leading-relaxed">
                {aboutContent.beyond}
              </p>
            </div>

            {/* Values */}
            <div className="pt-4 border-t border-terminal-border">
              <div className="flex flex-wrap gap-2">
                {['ownership', 'clarity', 'reliability', 'continuous learning'].map(
                  (value) => (
                    <span key={value} className="tag">
                      {value}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </section>
  )
}
