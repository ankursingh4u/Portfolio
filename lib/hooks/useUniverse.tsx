'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { PLANET_NAV, TOUR_ORDER, type PlanetNav } from '@/lib/universe-nav'

/** The single source of truth for the camera transform the SolarStage renders. */
export interface Camera {
  scale: number
  x: number
  y: number
  opacity: number
  blur: number
}

const HOME_CAMERA: Camera = { scale: 1, x: 0, y: 0, opacity: 1, blur: 0 }

export type Phase = 'home' | 'warping-in' | 'world' | 'warping-out'

/** Tour steps: the Sun intro, then every planet, then a finale. */
export type TourStep =
  | { kind: 'sun' }
  | { kind: 'planet'; nav: PlanetNav }
  | { kind: 'finale' }

interface UniverseCtx {
  phase: Phase
  active: PlanetNav | null
  camera: Camera
  warping: boolean
  // tour
  tourActive: boolean
  tourStep: TourStep | null
  tourIndex: number // 0 = sun, 1..8 = planets, 9 = finale
  tourCount: number // number of planet steps
  // sun bio panel
  bioOpen: boolean
  openBio: () => void
  closeBio: () => void
  // planet registry — SolarStage reports each planet's camera-independent
  // orbit offset (px from the viewport centre) every frame.
  registerPlanet: (name: string, x: number, y: number) => void
  // live SCREEN position of the spotlighted (tour-followed) planet, so the Tour
  // caption can anchor a leader line to it. null when nothing is spotlighted.
  setSpotlight: (v: { x: number; y: number; r: number } | null) => void
  getSpotlight: () => { x: number; y: number; r: number } | null
  frozen: boolean
  // actions
  enterWorld: (nav: PlanetNav, anchor?: string) => void
  /** Consume-once '#anchor' a moon requested — the world scrolls to it on mount. */
  takeAnchor: () => string | null
  exitWorld: () => void
  startTour: () => void
  endTour: () => void
  tourNext: () => void
  tourPrev: () => void
  tourGoTo: (index: number) => void
}

const Ctx = createContext<UniverseCtx | null>(null)

export function useUniverse() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUniverse must be used inside <UniverseProvider>')
  return ctx
}

const TOUR_PLANETS = TOUR_ORDER.map((n) => PLANET_NAV[n]).filter(Boolean)
const WARP_IN_MS = 850
const WARP_OUT_MS = 700
// How long each tour card lingers before auto-advancing. Slowed so there's time
// to actually read it — the real "world" planets (the substance) hold longest.
const TOUR_DWELL_MS = 5700 // every card: base reading time (+1.5s)
const TOUR_DWELL_IMPORTANT_MS = 6200 // world planets: +2s to take it in

export function UniverseProvider({
  children,
  reduce,
}: {
  children: ReactNode
  reduce: boolean
}) {
  const [phase, setPhase] = useState<Phase>('home')
  const [active, setActive] = useState<PlanetNav | null>(null)
  const [camera, setCamera] = useState<Camera>(HOME_CAMERA)
  const [frozen, setFrozen] = useState(false)

  const [tourActive, setTourActive] = useState(false)
  const [tourIndex, setTourIndex] = useState(0)
  const [bioOpen, setBioOpen] = useState(false)

  const nodes = useRef<Record<string, { x: number; y: number }>>({})
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const after = (ms: number, fn: () => void) => {
    const id = setTimeout(fn, reduce ? 0 : ms)
    timers.current.push(id)
  }

  const registerPlanet = useCallback((name: string, x: number, y: number) => {
    nodes.current[name] = { x, y }
  }, [])

  // Live screen position of the spotlighted planet (read by the Tour caption).
  const spotlight = useRef<{ x: number; y: number; r: number } | null>(null)
  const setSpotlight = useCallback(
    (v: { x: number; y: number; r: number } | null) => {
      spotlight.current = v
    },
    [],
  )
  const getSpotlight = useCallback(() => spotlight.current, [])

  /** Camera-independent screen-offset of a planet from the viewport centre. */
  const offsetOf = useCallback((name: string): { x: number; y: number } => {
    return nodes.current[name] ?? { x: 0, y: 0 }
  }, [])

  // ── World navigation ──────────────────────────────────────────────────
  // A moon can request a '#section' inside the world it belongs to; the world
  // consumes it (takeAnchor) once mounted and scrolls there.
  const pendingAnchorRef = useRef<string | null>(null)
  const takeAnchor = useCallback(() => {
    const a = pendingAnchorRef.current
    pendingAnchorRef.current = null
    return a
  }, [])

  const enterWorld = useCallback(
    (nav: PlanetNav, anchor?: string) => {
      if (nav.kind !== 'world') return
      clearTimers()
      pendingAnchorRef.current = anchor ?? null
      const { x, y } = offsetOf(nav.name)
      const S = 9
      setActive(nav)
      setPhase('warping-in')
      setCamera({ scale: S, x: -x * S, y: -y * S, opacity: 0, blur: 7 })
      after(WARP_IN_MS, () => setPhase('world'))
    },
    [offsetOf, reduce],
  )

  const exitWorld = useCallback(() => {
    clearTimers()
    setPhase('warping-out')
    setCamera(HOME_CAMERA)
    after(WARP_OUT_MS, () => {
      setPhase('home')
      setActive(null)
    })
  }, [reduce])

  // ── Tour ──────────────────────────────────────────────────────────────
  const applyTourCamera = useCallback(
    (index: number) => {
      if (index <= 0) {
        // The Sun — gentle push toward the centre; system keeps orbiting.
        setCamera({ scale: reduce ? 1 : 1.4, x: 0, y: 0, opacity: 1, blur: 0 })
        return
      }
      const nav = TOUR_PLANETS[index - 1]
      if (!nav) {
        setCamera(HOME_CAMERA)
        return
      }
      // Planet steps: the SolarStage camera springs fly ALONGSIDE the live,
      // still-orbiting planet (see SolarStage). Reduced motion keeps the system
      // still — the caption + spotlight glow convey the focus instead.
    },
    [reduce],
  )

  const startTour = useCallback(() => {
    clearTimers()
    setBioOpen(false)
    // Keep the system ALIVE during the tour — do not freeze.
    setTourActive(true)
    setTourIndex(0)
    applyTourCamera(0)
  }, [applyTourCamera])

  const endTour = useCallback(() => {
    clearTimers()
    setTourActive(false)
    setTourIndex(0)
    setCamera(HOME_CAMERA)
  }, [])

  // ── Sun bio panel ───────────────────────────────────────────────────────
  const openBio = useCallback(() => {
    clearTimers()
    setBioOpen(true)
    setFrozen(true)
    setCamera({ scale: reduce ? 1 : 1.5, x: 0, y: 0, opacity: 1, blur: 0 })
  }, [reduce])

  const closeBio = useCallback(() => {
    setBioOpen(false)
    setFrozen(false)
    setCamera(HOME_CAMERA)
  }, [])

  const tourCount = TOUR_PLANETS.length
  const lastIndex = tourCount + 1 // finale

  const tourGoTo = useCallback(
    (index: number) => {
      clearTimers()
      const clamped = Math.max(0, Math.min(lastIndex, index))
      setTourIndex(clamped)
      if (clamped >= lastIndex) {
        setCamera({ scale: reduce ? 1 : 1.15, x: 0, y: 0, opacity: 1, blur: 0 })
      } else {
        applyTourCamera(clamped)
      }
    },
    [applyTourCamera, lastIndex, reduce],
  )

  const tourNext = useCallback(() => tourGoTo(tourIndex + 1), [tourGoTo, tourIndex])
  const tourPrev = useCallback(() => tourGoTo(tourIndex - 1), [tourGoTo, tourIndex])

  // Auto-advance through the tour while it's running (stops at the finale).
  useEffect(() => {
    if (!tourActive || reduce) return
    if (tourIndex >= lastIndex) return
    // World planets (the substantive ones) linger a beat longer than socials.
    const current = TOUR_PLANETS[tourIndex - 1]
    const dwell =
      tourIndex >= 1 && tourIndex <= tourCount && current?.kind === 'world'
        ? TOUR_DWELL_IMPORTANT_MS
        : TOUR_DWELL_MS
    const id = setTimeout(() => {
      const next = Math.min(lastIndex, tourIndex + 1)
      setTourIndex(next)
      // Drive the camera as a top-level effect — NOT inside the setState updater
      // (React drops side-effects there, which froze the camera mid-tour).
      if (next >= lastIndex) {
        setCamera({ scale: reduce ? 1 : 1.15, x: 0, y: 0, opacity: 1, blur: 0 })
      } else {
        applyTourCamera(next)
      }
    }, dwell)
    return () => clearTimeout(id)
  }, [tourActive, tourIndex, lastIndex, tourCount, applyTourCamera, reduce])

  // Cleanup on unmount.
  useEffect(() => () => clearTimers(), [])

  // Keyboard: Esc closes world or tour; arrows drive the tour.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (bioOpen) closeBio()
        else if (tourActive) endTour()
        else if (phase === 'world' || phase === 'warping-in') exitWorld()
      } else if (tourActive) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') tourNext()
        else if (e.key === 'ArrowLeft') tourPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tourActive, phase, bioOpen, endTour, exitWorld, closeBio, tourNext, tourPrev])

  const tourStep: TourStep | null = useMemo(() => {
    if (!tourActive) return null
    if (tourIndex <= 0) return { kind: 'sun' }
    if (tourIndex >= lastIndex) return { kind: 'finale' }
    const nav = TOUR_PLANETS[tourIndex - 1]
    return nav ? { kind: 'planet', nav } : { kind: 'finale' }
  }, [tourActive, tourIndex, lastIndex])

  const value: UniverseCtx = {
    phase,
    active,
    camera,
    warping: phase === 'warping-in' || phase === 'warping-out',
    tourActive,
    tourStep,
    tourIndex,
    tourCount,
    bioOpen,
    openBio,
    closeBio,
    registerPlanet,
    setSpotlight,
    getSpotlight,
    frozen: frozen || phase !== 'home',
    enterWorld,
    takeAnchor,
    exitWorld,
    startTour,
    endTour,
    tourNext,
    tourPrev,
    tourGoTo,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
