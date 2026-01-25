'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { siteConfig } from '@/lib/site-config'
import { generateGmailLink, generateMailtoLink } from '@/lib/utils'
import { TerminalWindow, CommandLine } from '../terminal'
import { GlitchOnScroll, NeonPulse, AnimatedBorder } from '../effects'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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
    <section id="contact" className="section relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-terminal-accent/[0.02] to-transparent pointer-events-none" />

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
              <NeonPulse color="#22c55e">contact</NeonPulse>
            </h2>
            <span className="text-xs text-terminal-dim font-mono">
              // get in touch
            </span>
          </motion.div>
        </GlitchOnScroll>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 lg:grid-cols-2"
        >
          {/* Left side - Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <TerminalWindow title="contact_info.sh">
              <div className="space-y-4">
                <CommandLine prefix="$" command="echo $EMAIL" />
                <motion.div
                  className="pl-4 text-terminal-accent"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {siteConfig.email}
                </motion.div>

                <CommandLine prefix="$" command="echo $LOCATION" />
                <div className="pl-4 text-terminal-text">
                  {siteConfig.location}
                </div>

                <CommandLine prefix="$" command="echo $STATUS" />
                <motion.div
                  className="pl-4 text-terminal-accent"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {siteConfig.status}
                </motion.div>
              </div>
            </TerminalWindow>

            {/* Quick actions */}
            <motion.div variants={itemVariants} className="space-y-3">
              <p className="text-sm text-terminal-dim">
                Prefer email? Click below to open your email client directly.
              </p>
              <motion.button
                onClick={handleDirectEmail}
                className="terminal-btn w-full justify-center"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-terminal-muted">[</span>
                <span>open_mail_client</span>
                <span className="text-terminal-muted">]</span>
              </motion.button>
            </motion.div>

            {/* Social links */}
            <motion.div
              variants={itemVariants}
              className="pt-4 border-t border-terminal-border"
            >
              <p className="text-xs text-terminal-dim mb-3">
                // connect elsewhere
              </p>
              <div className="flex gap-4">
                {[
                  { name: 'github', url: siteConfig.social.github },
                  { name: 'linkedin', url: siteConfig.social.linkedin },
                  { name: 'twitter', url: siteConfig.social.X },
                ].map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="terminal-btn"
                    whileHover={{
                      scale: 1.05,
                      borderColor: '#22c55e',
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.name}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div variants={itemVariants}>
            <AnimatedBorder color="#22c55e">
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
                  <motion.input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    className="terminal-input focus-glow"
                    whileFocus={{
                      boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
                    }}
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
                  <motion.input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className="terminal-input focus-glow"
                    whileFocus={{
                      boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
                    }}
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
                  <motion.textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Your message..."
                    className="terminal-textarea focus-glow"
                    whileFocus={{
                      boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
                    }}
                  />
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="terminal-btn terminal-btn-primary w-full justify-center"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        sending...
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <span className="text-terminal-bg/80">[</span>
                      <span>send_via_gmail</span>
                      <span className="text-terminal-bg/80">]</span>
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-terminal-dim text-center">
                  This will open Gmail in a new tab with your message
                </p>
              </form>
            </TerminalWindow>
            </AnimatedBorder>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
