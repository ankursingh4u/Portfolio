'use client'

import { useReducedMotion } from 'framer-motion'
import { UniverseProvider } from '@/lib/hooks/useUniverse'
import { SolarStage3D } from './SolarStage3D'
import { HeroOverlay } from './HeroOverlay'
import { SpaceNav } from './SpaceNav'
import { WarpField } from './WarpField'
import { WorldLayer } from './WorldLayer'
import { Tour } from './Tour'
import { SunBio } from './SunBio'
import { AstronautChat } from './AstronautChat'

export function Universe() {
  const reduce = useReducedMotion() ?? false

  return (
    <UniverseProvider reduce={reduce}>
      <main className="relative h-screen w-screen overflow-hidden">
        <SolarStage3D />
        <SpaceNav />
        <HeroOverlay />
        <Tour />
        <SunBio />
        <WarpField />
        <WorldLayer />
        <AstronautChat />
      </main>
    </UniverseProvider>
  )
}
