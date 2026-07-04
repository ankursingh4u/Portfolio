'use client'

import { useReducedMotion } from 'framer-motion'
import { UniverseProvider } from '@/lib/hooks/useUniverse'
import { SolarStage3D } from './SolarStage3D'
import { CosmosNav } from './CosmosNav'
import { HeroOverlay } from './HeroOverlay'
import { FirstTouchHint } from './FirstTouchHint'
import { SpaceControls } from './SpaceControls'
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
        {/* First tab stop: the accessible way into every world. */}
        <CosmosNav />
        <SolarStage3D />
        <SpaceNav />
        <HeroOverlay />
        <FirstTouchHint />
        <SpaceControls />
        <Tour />
        <SunBio />
        <WarpField />
        <WorldLayer />
        <AstronautChat />
      </main>
    </UniverseProvider>
  )
}
