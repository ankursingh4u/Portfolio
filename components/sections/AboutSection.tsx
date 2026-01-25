'use client'

import { motion } from 'framer-motion'
import { aboutContent, siteConfig } from '@/lib/site-config'
import { TerminalWindow, CommentLine } from '../terminal'
import { GlitchOnScroll, NeonPulse, FloatingCode } from '../effects'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export function AboutSection() {
  return (
    <section id="about" className="section bg-terminal-surface/30 relative overflow-hidden">
      {/* Floating code snippets background - subtle */}
      <FloatingCode />

      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-terminal-accent/[0.02] to-transparent pointer-events-none" />

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
              <NeonPulse color="#22c55e">about</NeonPulse>
            </h2>
            <span className="text-xs text-terminal-dim font-mono">
              // who I am
            </span>
          </motion.div>
        </GlitchOnScroll>

        {/* Terminal window */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <TerminalWindow title={`cat about_${siteConfig.username}.md`}>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Intro */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <CommentLine>Introduction</CommentLine>
                <p className="text-sm md:text-base text-terminal-text leading-relaxed">
                  {aboutContent.intro}
                </p>
              </motion.div>

              {/* Journey */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <CommentLine>The Journey</CommentLine>
                <p className="text-sm md:text-base text-terminal-dim leading-relaxed">
                  {aboutContent.journey}
                </p>
              </motion.div>

              {/* Approach */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <CommentLine>Engineering Approach</CommentLine>
                <p className="text-sm md:text-base text-terminal-dim leading-relaxed">
                  {aboutContent.approach}
                </p>
              </motion.div>

              {/* Current focus */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <CommentLine>Current Focus</CommentLine>
                <p className="text-sm md:text-base text-terminal-dim leading-relaxed">
                  {aboutContent.current}
                </p>
              </motion.div>

              {/* Beyond code */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <CommentLine>Beyond Code</CommentLine>
                <p className="text-sm md:text-base text-terminal-dim leading-relaxed">
                  {aboutContent.beyond}
                </p>
              </motion.div>

              {/* Values */}
              <motion.div
                variants={fadeInUp}
                className="pt-4 border-t border-terminal-border"
              >
                <div className="flex flex-wrap gap-2">
                  {['ownership', 'clarity', 'reliability', 'continuous learning'].map(
                    (value, index) => (
                      <motion.span
                        key={value}
                        className="tag hover:border-terminal-accent hover:text-terminal-accent transition-all duration-200"
                        whileHover={{ scale: 1.05, y: -2 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * index }}
                      >
                        {value}
                      </motion.span>
                    )
                  )}
                </div>
              </motion.div>
            </motion.div>
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}
