'use client'

import { useState, FormEvent } from 'react'
import { siteConfig } from '@/lib/site-config'
import { generateGmailLink, generateMailtoLink } from '@/lib/utils'
import { TerminalWindow, CommandLine } from '../terminal'

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Generate email content
    const subject = `Contact from ${formData.name} via Portfolio`
    const body = `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`

    // Open Gmail compose window
    const gmailLink = generateGmailLink(siteConfig.email, subject, body)
    window.open(gmailLink, '_blank')

    // Reset form
    setFormData({ name: '', email: '', message: '' })
  }

  const handleDirectEmail = () => {
    const mailtoLink = generateMailtoLink(
      siteConfig.email,
      'Contact from Portfolio',
      'Hi Ankur,\n\n'
    )
    window.location.href = mailtoLink
  }

  return (
    <section id="contact" className="section">
      <div className="container-narrow mx-auto">
        {/* Section header */}
        <div className="section-header">
          <h2 className="section-title">contact</h2>
          <span className="text-xs text-terminal-dim font-mono">
            // get in touch
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left side - Info */}
          <div className="space-y-6">
            <TerminalWindow title="contact_info.sh">
              <div className="space-y-4">
                <CommandLine prefix="$" command="echo $EMAIL" />
                <div className="pl-4 text-terminal-accent">
                  {siteConfig.email}
                </div>

                <CommandLine prefix="$" command="echo $LOCATION" />
                <div className="pl-4 text-terminal-text">
                  {siteConfig.location}
                </div>

                <CommandLine prefix="$" command="echo $STATUS" />
                <div className="pl-4 text-terminal-accent">
                  {siteConfig.status}
                </div>
              </div>
            </TerminalWindow>

            {/* Quick actions */}
            <div className="space-y-3">
              <p className="text-sm text-terminal-dim">
                Prefer email? Click below to open your email client directly.
              </p>
              <button
                onClick={handleDirectEmail}
                className="terminal-btn w-full justify-center"
              >
                <span className="text-terminal-muted">[</span>
                <span>open_mail_client</span>
                <span className="text-terminal-muted">]</span>
              </button>
            </div>

            {/* Social links */}
            <div className="pt-4 border-t border-terminal-border">
              <p className="text-xs text-terminal-dim mb-3">
                // connect elsewhere
              </p>
              <div className="flex gap-4">
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terminal-btn"
                >
                  github
                </a>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terminal-btn"
                >
                  linkedin
                </a>
                <a
                  href={siteConfig.social.X}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terminal-btn"
                >
                  twitter
                </a>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div>
            <TerminalWindow title="compose_message.sh">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm text-terminal-dim font-mono"
                  >
                    <span className="text-terminal-muted">$</span> NAME
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    className="terminal-input"
                  />
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm text-terminal-dim font-mono"
                  >
                    <span className="text-terminal-muted">$</span> EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className="terminal-input"
                  />
                </div>

                {/* Message field */}
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block text-sm text-terminal-dim font-mono"
                  >
                    <span className="text-terminal-muted">$</span> MESSAGE
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Your message..."
                    className="terminal-textarea"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="terminal-btn terminal-btn-primary w-full justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-pulse">sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-terminal-bg/80">[</span>
                      <span>send_via_gmail</span>
                      <span className="text-terminal-bg/80">]</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-terminal-dim text-center">
                  This will open Gmail in a new tab with your message
                </p>
              </form>
            </TerminalWindow>
          </div>
        </div>
      </div>
    </section>
  )
}
