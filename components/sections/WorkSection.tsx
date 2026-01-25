'use client'

import { motion } from 'framer-motion'
import { currentWork, companyProjects, personalProjects } from '@/lib/site-config'
import { TiltCard, GlitchOnScroll, NeonPulse } from '../effects'

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

const colorStyles: Record<string, { border: string; glow: string; dot: string }> = {
  blue: {
    border: 'border-cyber-blue/50 hover:border-cyber-blue',
    glow: 'hover:shadow-glow-blue',
    dot: 'bg-cyber-blue',
  },
  amber: {
    border: 'border-cyber-amber/50 hover:border-cyber-amber',
    glow: 'hover:shadow-glow-amber',
    dot: 'bg-cyber-amber',
  },
  red: {
    border: 'border-cyber-red/50 hover:border-cyber-red',
    glow: 'hover:shadow-glow-red',
    dot: 'bg-cyber-red',
  },
}

export function WorkSection() {
  return (
    <section id="work" className="section">
      <div className="container-wide mx-auto">
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
              <NeonPulse color="#22c55e">work</NeonPulse>
            </h2>
            <span className="text-xs text-terminal-dim font-mono">
              // project portfolio
            </span>
          </motion.div>
        </GlitchOnScroll>

        {/* Current Work */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-terminal-accent">{'>'}</span>
              <span className="text-terminal-text">current_focus</span>
              <span className="text-terminal-dim">// what I&apos;m building now</span>
            </div>
          </motion.div>

          <motion.article
            variants={itemVariants}
            className="group terminal-window border-terminal-accent/30 hover:border-terminal-accent transition-all duration-300 hover-glow"
            whileHover={{ scale: 1.005 }}
          >
            <div className="p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-terminal-accent"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <h3 className="text-lg font-medium text-terminal-accent">
                    {currentWork.name}
                  </h3>
                  <span className="text-xs text-terminal-accent bg-terminal-accent/10 px-2 py-0.5 rounded">
                    active
                  </span>
                </div>
                <span className="text-xs text-terminal-dim font-mono">
                  {currentWork.year}
                </span>
              </div>

              <p className="text-xs text-terminal-dim mb-2">
                @ {currentWork.company}
              </p>

              <p className="text-sm text-terminal-dim leading-relaxed mb-4">
                {currentWork.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {currentWork.tech.map((tech) => (
                  <span
                    key={tech}
                    className="tag border-terminal-accent/30 text-terminal-accent/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        </motion.div>

        {/* Company Projects */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-cyber-blue">{'>'}</span>
              <span className="text-terminal-text">company_projects</span>
              <span className="text-terminal-dim">// Shopify apps @ Sabai Innovations</span>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {companyProjects.map((project, index) => {
              const styles = colorStyles[project.color] || colorStyles.blue
              return (
                <TiltCard key={project.id} className="h-full">
                  <motion.article
                    variants={itemVariants}
                    className={`group terminal-window ${styles.border} ${styles.glow} transition-all duration-300 h-full`}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <motion.span
                          className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}
                          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        />
                        <h3 className="text-base font-medium text-terminal-text group-hover:text-terminal-accent transition-colors">
                          {project.name}
                        </h3>
                      </div>

                      <p className="text-xs text-terminal-dim leading-relaxed mb-3">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.tech.slice(0, 3).map((tech) => (
                          <span key={tech} className="text-2xs px-1.5 py-0.5 bg-terminal-bg border border-terminal-border rounded text-terminal-dim">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-terminal-dim">{project.year}</span>
                        <span className="text-terminal-accent">completed</span>
                      </div>
                    </div>
                  </motion.article>
                </TiltCard>
              )
            })}
          </div>
        </motion.div>

        {/* Personal Projects */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="mb-4">
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-cyber-purple">{'>'}</span>
              <span className="text-terminal-text">personal_projects</span>
              <span className="text-terminal-dim">// self-initiated work</span>
            </div>
          </motion.div>

          <div className="space-y-4">
            {personalProjects.map((project, index) => (
              <PersonalProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-sm text-terminal-dim font-mono"
        >
          <span className="text-terminal-muted">{'>'}</span>
          <span className="ml-2">
            More projects available on{' '}
            <a
              href="https://github.com/ankursingh4u"
              target="_blank"
              rel="noopener noreferrer"
              className="terminal-link"
            >
              GitHub
            </a>
          </span>
        </motion.div>
      </div>
    </section>
  )
}

interface PersonalProjectCardProps {
  project: typeof personalProjects[0]
  index: number
}

function PersonalProjectCard({ project, index }: PersonalProjectCardProps) {
  return (
    <TiltCard glareEnabled={true}>
      <motion.article
        variants={itemVariants}
        className="group terminal-window hover:border-terminal-muted transition-all duration-300 hover-glow"
      >
        <div className="p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <motion.span
                className="text-xs text-terminal-dim font-mono"
                whileHover={{ color: '#22c55e' }}
              >
                [{String(index).padStart(2, '0')}]
              </motion.span>

              <h3 className="text-lg font-medium text-terminal-text group-hover:text-terminal-accent transition-colors">
                {project.name}
              </h3>

              <span className="flex items-center gap-1.5">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-terminal-accent"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-terminal-dim">{project.status}</span>
              </span>
            </div>

            <span className="text-xs text-terminal-dim font-mono">
              {project.year}
            </span>
          </div>

          <p className="text-sm text-terminal-dim leading-relaxed mb-4">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.tech.map((tech, techIndex) => (
              <motion.span
                key={tech}
                className="tag hover:border-terminal-accent hover:text-terminal-accent transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * techIndex }}
                whileHover={{ scale: 1.05 }}
              >
                {tech}
              </motion.span>
            ))}
          </div>

          {(project.link || project.github) && (
            <div className="flex items-center gap-4 pt-4 border-t border-terminal-border/50">
              {project.link && (
                <motion.a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-terminal-dim hover:text-terminal-accent transition-colors font-mono"
                  whileHover={{ x: 3 }}
                >
                  <span className="text-terminal-muted">[</span>
                  live
                  <span className="text-terminal-muted">]</span>
                </motion.a>
              )}
              {project.github && (
                <motion.a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-terminal-dim hover:text-terminal-accent transition-colors font-mono"
                  whileHover={{ x: 3 }}
                >
                  <span className="text-terminal-muted">[</span>
                  source
                  <span className="text-terminal-muted">]</span>
                </motion.a>
              )}
            </div>
          )}
        </div>
      </motion.article>
    </TiltCard>
  )
}
