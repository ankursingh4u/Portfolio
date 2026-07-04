'use client'

import { AnimatePresence } from 'framer-motion'
import { useUniverse } from '@/lib/hooks/useUniverse'
import { SunWorld } from './worlds/SunWorld'
import { NowWorld } from './worlds/NowWorld'
import { StoryWorld } from './worlds/StoryWorld'
import { FlagshipsWorld } from './worlds/FlagshipsWorld'
import { ClientsWorld } from './worlds/ClientsWorld'
import { OpenSourceWorld } from './worlds/OpenSourceWorld'
import { StackWorld } from './worlds/StackWorld'
import { PricingWorld } from './worlds/PricingWorld'
import { ContactWorld } from './worlds/ContactWorld'

export function WorldLayer() {
  const { phase, active } = useUniverse()
  const show = phase === 'world' && active?.kind === 'world'

  return (
    <AnimatePresence>
      {show && active && <Render key={active.destId} destId={active.destId!} />}
    </AnimatePresence>
  )
}

function Render({ destId }: { destId: string }) {
  const { active } = useUniverse()
  if (!active) return null
  switch (destId) {
    case 'origin':
      return <SunWorld nav={active} />
    case 'now':
      return <NowWorld nav={active} />
    case 'story':
      return <StoryWorld nav={active} />
    case 'flagships':
      return <FlagshipsWorld nav={active} />
    case 'clients':
      return <ClientsWorld nav={active} />
    case 'opensource':
      return <OpenSourceWorld nav={active} />
    case 'stack':
      return <StackWorld nav={active} />
    case 'pricing':
      return <PricingWorld nav={active} />
    case 'contact':
      return <ContactWorld nav={active} />
    default:
      return null
  }
}
