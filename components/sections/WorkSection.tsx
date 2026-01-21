'use client'

import { projects } from '@/lib/site-config'

export function WorkSection() {
  return (
    <section id="work" className="section">
      <div className="container-wide mx-auto">
        {/* Section header */}
        <div className="section-header">
          <h2 className="section-title">work</h2>
          <span className="text-xs text-terminal-dim font-mono">
        
          </span>
        </div>

        {/* Projects grid */}
        <div className="space-y-4">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-sm text-terminal-dim font-mono">
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
        </div>
      </div>
    </section>
  )
}

interface ProjectCardProps {
  project: (typeof projects)[0]
  index: number
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const statusColors = {
    completed: 'bg-terminal-accent',
    active: 'bg-blue-400',
    archived: 'bg-terminal-dim',
  }

  return (
    <article className="group terminal-window hover:border-terminal-muted transition-colors">
      <div className="p-4 md:p-6">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Index number */}
            <span className="text-xs text-terminal-dim font-mono">
              [{String(index).padStart(2, '0')}]
            </span>

            {/* Project name */}
            <h3 className="text-lg font-medium text-terminal-text group-hover:text-terminal-accent transition-colors">
              {project.name}
            </h3>

            {/* Status indicator */}
            <span className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  statusColors[project.status as keyof typeof statusColors]
                }`}
              />
              <span className="text-xs text-terminal-dim">{project.status}</span>
            </span>
          </div>

          {/* Year */}
          <span className="text-xs text-terminal-dim font-mono">
            {project.year}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-terminal-dim leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech.map((tech) => (
            <span key={tech} className="tag">
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        {(project.link || project.github) && (
          <div className="flex items-center gap-4 pt-4 border-t border-terminal-border/50">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-terminal-dim hover:text-terminal-accent transition-colors font-mono"
              >
                <span className="text-terminal-muted">[</span>
                live
                <span className="text-terminal-muted">]</span>
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-terminal-dim hover:text-terminal-accent transition-colors font-mono"
              >
                <span className="text-terminal-muted">[</span>
                source
                <span className="text-terminal-muted">]</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
