'use client'

import { MouseTrail } from './MouseTrail'
import { CRTEffect } from './CRTEffect'
import { ProgressBar } from './ProgressBar'
import { SystemAlerts } from './SystemAlerts'
import { KonamiCode } from './KonamiCode'
import { TerminalEasterEgg } from './TerminalEasterEgg'

interface CyberEffectsProviderProps {
  children: React.ReactNode
}

export function CyberEffectsProvider({ children }: CyberEffectsProviderProps) {
  return (
    <>
      {/* Global background effects */}
      <CRTEffect />
      <MouseTrail />
      <ProgressBar />

      {/* Interactive easter eggs */}
      <KonamiCode />
      <TerminalEasterEgg />

      {/* Random system alerts - adds atmosphere */}
      <SystemAlerts />

      {/* Main content */}
      {children}
    </>
  )
}
