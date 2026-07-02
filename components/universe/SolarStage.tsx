'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { PLANETS, positionFor } from '@/lib/ephemeris'
import { PLANET_NAV, type PlanetNav } from '@/lib/universe-nav'
import { useUniverse } from '@/lib/hooks/useUniverse'

const TWO_PI = Math.PI * 2
const aMin = Math.min(...PLANETS.map((p) => p.el[0]))

// Orbit radii are spaced EVENLY by planet rank (sun-outward) so every orbit is
// clearly separated — physical distances are wildly uneven (Venus & Earth would
// overlap), and the radii were never to scale anyway. Real angles are kept.
const ORBIT_FRAC = PLANETS.map((_, i) => 0.18 + 0.8 * (i / (PLANETS.length - 1)))

// Synthetic orbital speed (rad/sec). We keep each planet's REAL starting angle
// from the ephemeris, but give it a *visible* angular velocity so the whole
// system is alive — inner planets faster than outer (Kepler-like), but the
// range is compressed so even Neptune visibly drifts instead of looking frozen.
const INNER_PERIOD_SEC = 16 // innermost planet completes an orbit in ~16s
const omegaFor = (a: number) => TWO_PI / (INNER_PERIOD_SEC * Math.pow(a / aMin, 0.55))

// Deterministic starfield (identical on server & client → no hydration mismatch).
function makeStars(seed: number, count: number) {
  let s = seed
  const r = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  return Array.from({ length: count }, () => ({
    x: r() * 100,
    y: r() * 100,
    size: r() * 1.8 + 0.4,
    op: r() * 0.6 + 0.2,
    delay: r() * 4,
    tint: r(),
  }))
}
// Real stars aren't all white — spectral tints from hot blue-white to cool orange.
const STAR_TINTS = ['#ffffff', '#dbe7ff', '#eef3ff', '#fff4d6', '#ffddb0']
const starTint = (t: number) => STAR_TINTS[Math.floor(t * STAR_TINTS.length) % STAR_TINTS.length]
const STARS = makeStars(20260626, 170)
// A second, FAR starfield layer. It lives outside the camera and follows only a
// fraction of its motion (parallax), which is what sells the depth on fly-ins.
const STARS_FAR = makeStars(19910704, 130)

// Seeded shooting-star passes (CSS-animated, compositor-only).
const SHOOTING = [
  { top: '14%', left: '4%', dur: '9s', delay: '2.2s', angle: '-28deg' },
  { top: '34%', left: '48%', dur: '13s', delay: '7.5s', angle: '-38deg' },
  { top: '7%', left: '62%', dur: '11s', delay: '12s', angle: '-20deg' },
]

// ── Pseudo-3D projection ──────────────────────────────────────────────────
// The orbital plane is TILTED toward the viewer, the way solar-system apps
// frame it: screen-y is foreshortened (orbits become ellipses), planets on the
// NEAR side of the plane render larger, brighter and in front of the sun; the
// FAR side smaller, dimmer and behind it.
const COS_T = 0.55 // DEFAULT cos(tilt) ≈ 57° tilt — dragging up/down changes it
const TILT_MIN = 0.42 // low sweep — never fully edge-on (a flat line of dots reads broken)
const TILT_MAX = 0.92 // nearly top-down
const DEPTH_SCALE = 0.42 // sprite scale swing between far and near side
const DEPTH_BRIGHT = 0.34 // brightness swing between far and near side
// Drag sensitivity: horizontal = rotate the system (azimuth), vertical = tilt.
const AZ_PER_PX = 0.005
const TILT_PER_PX = 0.0022

// Free camera (drag / pinch / wheel) — like handling the system in a space app.
const MIN_S = 0.8
const MAX_S = 6.5
// Zooming this deep while centred on a "world" planet lands you in its page.
const LAND_S = 4.5
const NEAR_S = 2.1

// Moons (level-of-detail): appear once the camera is close, each on its own
// little tilted orbit. r/size are relative to the parent planet's sprite.
const MOONS: Record<string, { r: number; size: number; period: number; color: string }[]> = {
  Earth: [{ r: 1.9, size: 0.28, period: 9, color: '#cfcfd4' }],
  Mars: [{ r: 1.75, size: 0.18, period: 7, color: '#b9a08a' }],
  Jupiter: [
    { r: 1.55, size: 0.16, period: 6, color: '#d9c9a8' },
    { r: 1.95, size: 0.2, period: 9.5, color: '#cdb790' },
    { r: 2.35, size: 0.26, period: 14, color: '#b9a58a' },
  ],
  Saturn: [{ r: 2.35, size: 0.24, period: 12, color: '#d8c9a5' }],
  Uranus: [{ r: 1.8, size: 0.2, period: 8, color: '#bcd8dd' }],
  Neptune: [{ r: 1.85, size: 0.22, period: 10, color: '#a9bce8' }],
}

// REAL planet surfaces — equirectangular texture maps (2:1), CC BY 4.0 from
// solarsystemscope.com/textures. Each sphere slowly scrolls its texture, so
// you can watch the surface rotate like in NASA's Eyes.
const TEXTURE: Record<string, string> = {
  Mercury: '/textures/1k_mercury.jpg',
  Venus: '/textures/1k_venus_atmosphere.jpg',
  Earth: '/textures/1k_earth_daymap.jpg',
  Mars: '/textures/1k_mars.jpg',
  Jupiter: '/textures/1k_jupiter.jpg',
  Saturn: '/textures/1k_saturn.jpg',
  Uranus: '/textures/1k_uranus.jpg',
  Neptune: '/textures/1k_neptune.jpg',
}

// Richer planet surfaces (static multi-gradient CSS — zero per-frame cost).
// The directional day/night shading is a separate live overlay, so these stay
// soft and centre-lit.
const SKIN: Record<string, string> = {
  Mercury:
    'radial-gradient(circle at 60% 55%, rgba(58,58,62,0.6) 0%, rgba(58,58,62,0.35) 3%, rgba(58,58,62,0) 7%), radial-gradient(circle at 34% 64%, rgba(70,70,76,0.55) 0%, rgba(70,70,76,0) 5%), radial-gradient(circle at 52% 30%, rgba(64,64,70,0.45) 0%, rgba(64,64,70,0) 4%), radial-gradient(circle at 45% 40%, rgba(255,255,255,0.5), #b8b2a8 55%, #6f6b64 100%)',
  Venus:
    'radial-gradient(circle at 45% 40%, rgba(255,255,255,0.55), rgba(255,255,255,0) 42%), repeating-linear-gradient(-14deg, rgba(244,224,184,0.5) 0px 2px, rgba(222,197,152,0.5) 2px 5px, rgba(236,214,172,0.5) 5px 7px), radial-gradient(circle at 50% 50%, #e8cda2 0%, #a08554 100%)',
  Earth:
    'radial-gradient(circle at 45% 40%, rgba(255,255,255,0.5), rgba(255,255,255,0) 36%), radial-gradient(circle at 64% 58%, rgba(52,168,102,0.95) 0%, rgba(52,168,102,0) 22%), radial-gradient(circle at 28% 64%, rgba(45,150,90,0.9) 0%, rgba(45,150,90,0) 18%), radial-gradient(ellipse 30% 12% at 42% 26%, rgba(255,255,255,0.75), rgba(255,255,255,0) 100%), radial-gradient(ellipse 26% 10% at 66% 74%, rgba(255,255,255,0.6), rgba(255,255,255,0) 100%), radial-gradient(circle at 50% 50%, #5b8def 0%, #1d3c74 100%)',
  Mars:
    'radial-gradient(circle at 62% 60%, rgba(140,62,32,0.9) 0%, rgba(140,62,32,0) 20%), radial-gradient(circle at 34% 56%, rgba(116,50,26,0.8) 0%, rgba(116,50,26,0) 15%), radial-gradient(ellipse 40% 14% at 50% 12%, rgba(240,230,220,0.55), rgba(240,230,220,0) 100%), radial-gradient(circle at 45% 40%, rgba(255,255,255,0.4), #d96f43 55%, #6e3418 100%)',
  Jupiter:
    'radial-gradient(circle at 63% 62%, rgba(196,88,54,0.95) 0%, rgba(196,88,54,0.6) 3.5%, rgba(196,88,54,0) 8%), radial-gradient(circle at 45% 40%, rgba(255,255,255,0.35), rgba(255,255,255,0) 42%), repeating-linear-gradient(-6deg, rgba(230,193,147,0.85) 0px 2px, rgba(201,154,107,0.85) 2px 3.5px, rgba(220,174,125,0.85) 3.5px 6px, rgba(176,128,90,0.85) 6px 7px, rgba(224,185,138,0.85) 7px 10px), radial-gradient(circle at 50% 50%, #d8a772 0%, #64432a 100%)',
  Saturn:
    'radial-gradient(circle at 45% 40%, rgba(255,255,255,0.4), rgba(255,255,255,0) 42%), repeating-linear-gradient(-4deg, rgba(236,220,174,0.75) 0px 2.5px, rgba(210,189,142,0.75) 2.5px 5px, rgba(226,208,160,0.75) 5px 8px), radial-gradient(circle at 50% 50%, #e3d2a0 0%, #7d6a40 100%)',
  Uranus:
    'radial-gradient(circle at 45% 40%, rgba(255,255,255,0.5), rgba(255,255,255,0) 44%), linear-gradient(-12deg, rgba(150,215,222,0.4) 0%, rgba(150,215,222,0) 55%), radial-gradient(circle at 50% 50%, #a8e0e6 0%, #45828c 100%)',
  Neptune:
    'radial-gradient(circle at 58% 52%, rgba(34,52,128,0.7) 0%, rgba(34,52,128,0.4) 3%, rgba(34,52,128,0) 7%), radial-gradient(circle at 45% 40%, rgba(255,255,255,0.45), rgba(255,255,255,0) 40%), radial-gradient(ellipse 34% 10% at 46% 68%, rgba(230,240,255,0.4), rgba(230,240,255,0) 100%), radial-gradient(circle at 50% 50%, #6f8ff0 0%, #1d2f7c 100%)',
}
const sphereBg = (p: { name: string; color: string }) =>
  SKIN[p.name] ??
  `radial-gradient(circle at 45% 40%, rgba(255,255,255,0.6), ${p.color} 52%, rgba(0,0,0,0.4) 100%)`

// Milky-way band stars (clustered along the band's midline).
const BAND_STARS = makeStars(31415926, 130).map((s) => ({
  ...s,
  y: 30 + s.y * 0.4, // squeeze into the band
}))

// Seconds-scale time constant for a planet gliding to a stop (spotlight/hover)
// and back up to speed. Frame-rate independent (see the exp() ease below).
const EASE_TAU = 0.4
// Tour camera: one SCRIPTED fly-to per step — a single deterministic tween
// (ease-in-out) from wherever the camera is to the planet's known rest position,
// with a zoom dip mid-flight (pull out → glide over → push in, in one motion).
// No springs, no chasing a moving target — this is the Google-Earth fly-to.
const FLY_MS = 1600
const easeInOutCubic = (u: number) =>
  u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function SolarStage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const planetRefs = useRef<(HTMLDivElement | null)[]>([])
  // Comet-trail nodes — rotated along each planet's velocity every frame.
  const trailRefs = useRef<(HTMLSpanElement | null)[]>([])
  // Moon nodes, keyed `${planetIndex}-${moonIndex}` — placed every frame.
  const moonRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  // Orbit-ring nodes — their ellipse height follows the live tilt.
  const ringRefs = useRef<(HTMLDivElement | null)[]>([])
  // Day/night shade overlays — rotated per frame so the dark limb of every
  // planet always faces AWAY from the sun. This is what makes them read as lit
  // spheres in space instead of flat sprites.
  const shadeRefs = useRef<(HTMLSpanElement | null)[]>([])
  // The user's 3D view of the system: azimuth (spin around the sun) + tilt.
  // Dragging rotates THE WORLD, not the camera — like handling a globe.
  // Drag writes TARGETS; the rAF eases the actual values toward them, which is
  // what makes the rotation feel fluid instead of raw pointer jitter.
  const viewRef = useRef({ az: 0, cosT: COS_T, targetAz: 0, targetCosT: COS_T, vAz: 0 })
  // Hover highlight for the orbit ring (state is fine: changes on enter/leave only).
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [R, setR] = useState(0)
  const [mounted, setMounted] = useState(false)
  const reduce = useReducedMotion()

  const { camera, frozen, enterWorld, registerPlanet, setSpotlight, tourActive, tourIndex, openBio } =
    useUniverse()

  // ── Free camera (grab the cosmos: drag pan, pinch/wheel zoom) ─────────────
  const rootRef = useRef<HTMLDivElement>(null)
  const freeRef = useRef({
    on: false, // user has taken control of the camera
    s: 1,
    cx: 0,
    cy: 0, // look-at (world px from the stage centre)
    vx: 0,
    vy: 0, // inertia velocity (world px/s)
    dragging: false,
    mode: 'rotate' as 'rotate' | 'pan',
    moved: 0,
    px: 0,
    py: 0,
    lastT: 0,
    pinchD: 0,
    pinchS: 1,
    midX: 0,
    midY: 0,
  })
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const suppressClickRef = useRef(0)
  // "Keep zooming to enter …" — state changes only when the nearest world flips.
  const [nearWorld, setNearWorld] = useState<PlanetNav | null>(null)
  const nearNameRef = useRef<string | null>(null)
  const [hintOff, setHintOff] = useState(false)
  const canFreeRef = useRef(false)
  const enterWorldRef = useRef(enterWorld)
  useEffect(() => {
    enterWorldRef.current = enterWorld
  }, [enterWorld])
  useEffect(() => {
    canFreeRef.current = !frozen && !tourActive
    if (frozen || tourActive) {
      // Tour/worlds/bio own the camera — release the user's grip cleanly.
      freeRef.current.on = false
      freeRef.current.dragging = false
      pointersRef.current.clear()
      nearNameRef.current = null
      setNearWorld(null)
    }
  }, [frozen, tourActive])

  const stars = useMemo(() => STARS, [])

  // Phones zoom in just as hard but on a tiny viewport, so the camera ends up
  // chasing a fast inner planet across a heavily-magnified view — nauseating.
  // Detect a small screen once and soften the whole tour: gentler spring, less
  // zoom, slower orbits. Desktop is left exactly as-is.
  const [isSmall] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )

  // ── Camera as springs so it can smoothly FOLLOW a moving planet ──────────
  // Mobile stays a touch softer than desktop (less nausea on a small viewport),
  // but firm enough to visibly ARRIVE within a card's dwell — too limp reads as
  // "nothing happened".
  const camSpring = isSmall
    ? { stiffness: 52, damping: 26, mass: 1 }
    : { stiffness: 60, damping: 18, mass: 1 }
  const scaleMV = useSpring(1, camSpring)
  const xMV = useSpring(0, camSpring)
  const yMV = useSpring(0, camSpring)
  const opacityMV = useSpring(1, { stiffness: 120, damping: 26 })
  const blurMV = useSpring(0, { stiffness: 120, damping: 26 })
  const filterMV = useTransform(blurMV, (b) => `blur(${b}px)`)

  // ── Cursor parallax: moving the mouse nudges the CAMERA ANGLE (azimuth +
  // tilt), never the system's position. The sun stays pinned dead-centre —
  // planets wheel slightly around it and the sky pans, exactly like orbiting
  // the view in NASA's Eyes.
  const parTargetRef = useRef({ nx: 0, ny: 0 })

  // WRAPAROUND star dome: one full drag-rotation = one full sky revolution.
  // The offset wraps modulo one viewport-width over three identical tiles, so
  // the sky wheels continuously in ONE direction forever — you can genuinely
  // go around the back of the system, like the skybox in NASA's Eyes.
  const azMV = useMotionValue(0)
  const tiltMV = useMotionValue(COS_T)
  const skyX = useTransform([xMV, azMV] as const, (v: number[]) => {
    const W = typeof window === 'undefined' ? 1200 : window.innerWidth
    const raw = (-v[1] / TWO_PI) * W + v[0] * 0.08
    return -(((raw % W) + W) % W)
  })
  const skyY = useTransform(
    [yMV, tiltMV] as const,
    (v: number[]) => v[0] * 0.08 + (v[1] - COS_T) * 160,
  )
  const farScale = useTransform(scaleMV, (s) => 1 + (s - 1) * 0.06)

  // The sun's corona (rays + outer halo) is gorgeous at home scale, but at tour
  // zoom it magnifies into a screen-filling beige wash that drowns the
  // spotlighted planet. Fade it out as the camera pushes past ~1.6×.
  const coronaFade = useTransform(scaleMV, (s) =>
    Math.max(0, Math.min(1, 1 - (s - 1.6) / 1.2)),
  )

  // ── Free-camera gesture handlers (all state lives in refs — no re-renders) ─
  const syncFree = () => {
    const f = freeRef.current
    if (!f.on) {
      const s = scaleMV.get()
      f.s = s
      f.cx = -xMV.get() / s
      f.cy = -yMV.get() / s
      f.vx = 0
      f.vy = 0
      f.on = true
      setHintOff(true)
    }
  }
  /** Zoom keeping the world point under the given screen position fixed. */
  const zoomAt = (sx: number, sy: number, ns: number) => {
    const f = freeRef.current
    const vw = window.innerWidth
    const vh = window.innerHeight
    const wx = (sx - vw / 2) / f.s + f.cx
    const wy = (sy - vh / 2) / f.s + f.cy
    f.s = ns
    f.cx = wx - (sx - vw / 2) / ns
    f.cy = wy - (sy - vh / 2) / ns
  }
  const onStagePointerDown = (e: React.PointerEvent) => {
    if (!canFreeRef.current) return
    const pts = pointersRef.current
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const f = freeRef.current
    if (pts.size === 1) {
      f.dragging = true
      // Left/touch drag ROTATES the system; right-button drag PANS the camera.
      f.mode = e.button === 2 ? 'pan' : 'rotate'
      if (f.mode === 'pan') syncFree()
      f.moved = 0
      f.px = e.clientX
      f.py = e.clientY
      f.lastT = e.timeStamp
      f.vx = 0
      f.vy = 0
      viewRef.current.vAz = 0 // grabbing stops any residual spin
      setHintOff(true)
    } else if (pts.size === 2) {
      const vals = Array.from(pts.values()); const a = vals[0]; const b = vals[1]
      f.pinchD = Math.hypot(a.x - b.x, a.y - b.y)
      f.pinchS = f.s
      f.midX = (a.x + b.x) / 2
      f.midY = (a.y + b.y) / 2
      f.dragging = false
      syncFree()
    }
  }
  const onStagePointerMove = (e: React.PointerEvent) => {
    const pts = pointersRef.current
    // Plain mouse HOVER (nothing pressed) → update the camera-parallax target.
    if (e.pointerType === 'mouse' && pts.size === 0) {
      parTargetRef.current.nx = (e.clientX / window.innerWidth) * 2 - 1
      parTargetRef.current.ny = (e.clientY / window.innerHeight) * 2 - 1
    }
    if (!pts.has(e.pointerId) || !canFreeRef.current) return
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const f = freeRef.current
    if (pts.size === 2) {
      const vals = Array.from(pts.values()); const a = vals[0]; const b = vals[1]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (f.pinchD > 0) {
        f.moved += 8 // a pinch is never a click
        const midX = (a.x + b.x) / 2
        const midY = (a.y + b.y) / 2
        // Two fingers: pinch zooms AND the midpoint drags the system around.
        f.cx -= (midX - f.midX) / f.s
        f.cy -= (midY - f.midY) / f.s
        f.midX = midX
        f.midY = midY
        zoomAt(midX, midY, clamp(f.pinchS * (d / f.pinchD), MIN_S, MAX_S))
      }
    } else if (f.dragging && pts.size === 1) {
      const dx = e.clientX - f.px
      const dy = e.clientY - f.py
      f.px = e.clientX
      f.py = e.clientY
      const dtms = Math.max(1, e.timeStamp - f.lastT)
      f.lastT = e.timeStamp
      f.moved += Math.abs(dx) + Math.abs(dy)
      if (f.mode === 'pan') {
        // Right-drag: move the whole system across the screen.
        f.cx -= dx / f.s
        f.cy -= dy / f.s
        f.vx = (-dx / f.s) * (1000 / dtms) * 0.85 + f.vx * 0.15
        f.vy = (-dy / f.s) * (1000 / dtms) * 0.85 + f.vy * 0.15
      } else {
        // Left-drag ROTATES the system (horizontal = spin, vertical = tilt).
        // Targets only — the rAF eases toward them for a fluid feel.
        const view = viewRef.current
        view.targetAz += dx * AZ_PER_PX
        view.targetCosT = clamp(view.targetCosT + dy * TILT_PER_PX, TILT_MIN, TILT_MAX)
        view.vAz = dx * AZ_PER_PX * (1000 / dtms) * 0.85 + view.vAz * 0.15
      }
    }
  }
  const onStagePointerUp = (e: React.PointerEvent) => {
    const pts = pointersRef.current
    pts.delete(e.pointerId)
    const f = freeRef.current
    if (pts.size === 1) {
      // Pinch ended with one finger still down → continue as a drag.
      const a = Array.from(pts.values())[0]
      f.dragging = true
      f.px = a.x
      f.py = a.y
      f.lastT = e.timeStamp
    } else if (pts.size === 0) {
      if (f.moved > 6) suppressClickRef.current = e.timeStamp
      f.dragging = false // inertia carries on in the rAF loop
    }
  }
  // Wheel zoom must be a NATIVE non-passive listener (React's synthetic wheel
  // can't preventDefault), zooming toward the cursor like a map.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!canFreeRef.current) return
      e.preventDefault()
      syncFree()
      const f = freeRef.current
      zoomAt(e.clientX, e.clientY, clamp(f.s * Math.exp(-e.deltaY * 0.0016), MIN_S, MAX_S))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Is the tour currently flying alongside a planet? (sun/finale use camera state)
  const followingName =
    tourActive && tourIndex >= 1 && tourIndex <= PLANETS.length
      ? (['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'] as const)[
          tourIndex - 1
        ]
      : null
  const spotlightName = followingName
  const followNav = followingName ? PLANET_NAV[followingName] : null

  // The rAF loop reads tour state through a ref so the loop closure stays stable
  // (re-running the effect would teleport the planets to fresh ephemeris angles).
  const followRef = useRef<string | null>(null)
  useEffect(() => {
    followRef.current = followingName
    // No planet under the spotlight (sun / finale / home / reduced motion) →
    // drop the leader-line anchor so the Tour caption re-centres cleanly.
    if (!followingName) setSpotlight(null)
  }, [followingName, setSpotlight])

  // When NOT following a planet (home / warp / world / sun / finale / bio),
  // drive the springs from the declarative camera state.
  useEffect(() => {
    if (followingName) return
    scaleMV.set(camera.scale)
    xMV.set(camera.x)
    yMV.set(camera.y)
    opacityMV.set(camera.opacity)
    blurMV.set(camera.blur)
  }, [camera, followingName, scaleMV, xMV, yMV, opacityMV, blurMV])

  // Measure container so orbits scale with the viewport.
  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current
      if (!el) return
      const next = Math.min(el.clientWidth, el.clientHeight) / 2
      // Ignore a 0/partial reading — on some mobile browsers the fixed layer
      // reports no height on the very first frame, which would leave R=0 and
      // freeze the whole system until a resize. A ResizeObserver (below) fires
      // again once real dimensions land.
      if (next > 0) setR(next)
    }
    measure()
    setMounted(true)
    window.addEventListener('resize', measure)
    // Re-measure once the container has a settled box (covers the "dead on first
    // load, refresh fixes it" race where the initial read was 0 or partial).
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (ro && wrapRef.current) ro.observe(wrapRef.current)
    return () => {
      window.removeEventListener('resize', measure)
      ro?.disconnect()
    }
  }, [])

  // Orbital animation loop. Each planet keeps its REAL starting angle (from the
  // ephemeris) and then advances at a synthetic, visible angular velocity.
  useEffect(() => {
    if (!R) return
    // Real starting longitude per planet + its synthetic angular speed.
    const now = new Date()
    // Calm the whole system down on phones so the followed planet drifts gently
    // instead of racing under the zoomed-in tour camera.
    const speed = isSmall ? 0.6 : 1
    const base = PLANETS.map((p, i) => ({
      angle0: positionFor(p, now).longitude,
      omega: omegaFor(p.el[0]) * speed,
      orbR: ORBIT_FRAC[i] * R,
    }))
    let raf = 0
    let prevPerf = performance.now()
    // PER-PLANET accumulated orbit time. Every planet ALWAYS advances on its own
    // clock — nothing is ever hard-paused. The spotlighted planet is instead
    // gently eased OFF its free orbit into the fixed hero slot (and eased back on
    // release), so it settles perfectly still under the camera without any
    // position "snap" when the spotlight arrives or lifts.
    const pt = PLANETS.map(() => 0)
    // Per-planet speed multiplier — hovering "catches" a planet near-stopped;
    // releasing glides it back up to orbital speed. The system NEVER stops:
    // during the tour the camera flies alongside the still-moving planet.
    const spd = PLANETS.map(() => 1)
    // Global clock for the moons (they never pause, even when a planet does).
    let tGlob = 0
    // Shared moon fade (level-of-detail) + per-planet style caches so we only
    // touch the DOM when a value meaningfully changes.
    let moonOp = 0
    let lastMoonOp = 0
    const lastZ = PLANETS.map(() => -999)
    const lastB = PLANETS.map(() => -999)
    const pxArr = PLANETS.map((p) => Math.max(10, Math.round((p.size * 3.2 + 5) * 1.85)))
    // Projected screen-space (pre-camera) positions this frame — used by the
    // free camera's zoom-to-land targeting.
    const projX = PLANETS.map(() => 0)
    const projY = PLANETS.map(() => 0)

    // Scripted tour fly-to. One deterministic tween from wherever the camera is
    // onto the LIVE planet (the look-at target tracks it as it orbits); once the
    // tween lands, the camera stays pixel-locked to the planet every frame via
    // .jump() — exact, no spring, so the planet holds perfectly steady in frame
    // while the rest of the cosmos glides past behind it.
    let fly: {
      t0: number
      cx0: number
      cy0: number
      s0: number
      s1: number
      vOffset: number
      dip: number
    } | null = null
    let lastFollow: string | null = null

    let lastCosT = -1
    const dArr = ORBIT_FRAC.map((f) => f * R * 2)
    // Eased cursor-parallax state (camera drift, not system motion).
    let pNX = 0
    let pNY = 0

    const place = (dt: number) => {
      const follow = followRef.current
      const nowMs = performance.now()
      const view = viewRef.current

      // Spin inertia (released fling keeps the system turning, then decays).
      if (!freeRef.current.dragging && canFreeRef.current && dt > 0 && Math.abs(view.vAz) > 0.002) {
        view.targetAz += view.vAz * dt
        view.vAz *= Math.exp(-dt / 0.7)
      }
      // Ease the actual view toward the drag targets — fluid, never jittery.
      if (dt > 0) {
        const kv = 1 - Math.exp(-dt / 0.09)
        view.az += (view.targetAz - view.az) * kv
        view.cosT += (view.targetCosT - view.cosT) * kv
      } else {
        view.az = view.targetAz
        view.cosT = view.targetCosT
      }

      // Cursor parallax — a slow, floaty CAMERA-ANGLE drift toward where you
      // look. The system's position never changes; only the viewing angle.
      // Suspended (eased back to centre) while dragging, touring, or warping.
      {
        const active = canFreeRef.current && !freeRef.current.dragging && !follow
        const tx = active ? parTargetRef.current.nx : 0
        const ty = active ? parTargetRef.current.ny : 0
        const pk = dt > 0 ? 1 - Math.exp(-dt / 0.28) : 1
        pNX += (tx - pNX) * pk
        pNY += (ty - pNY) * pk
      }
      // Effective camera angle = user's view + the gentle hover nudge.
      const azEff = view.az + pNX * 0.1
      const cosT = clamp(view.cosT - pNY * 0.055, TILT_MIN, TILT_MAX)
      // Tilt changed → update the orbit-ring ellipses (and the sky parallax).
      if (Math.abs(cosT - lastCosT) > 0.0008) {
        lastCosT = cosT
        for (let i = 0; i < PLANETS.length; i++) {
          const ring = ringRefs.current[i]
          if (ring) ring.style.height = `${dArr[i] * cosT}px`
        }
        tiltMV.set(cosT)
      }
      azMV.set(azEff)

      // ── Step change → plan the fly-to (zoom depends only on the orbit) ─────
      if (follow !== lastFollow) {
        lastFollow = follow
        fly = null
        const i = follow ? PLANETS.findIndex((p) => p.name === follow) : -1
        if (i >= 0) {
          const b = base[i]
          const vw = window.innerWidth
          const vh = window.innerHeight
          const vmin = Math.min(vw, vh)
          // Zoom scales inversely with orbit radius; floor keeps the outer
          // worlds getting a real fly-in, ceiling keeps inner ones sane.
          const factor = isSmall ? 0.42 : 0.55
          const fallback = isSmall ? 3.0 : 4.2
          let S = b.orbR > 4 ? (vmin * factor) / b.orbR : fallback
          S = isSmall
            ? Math.max(2.4, Math.min(3.4, S))
            : Math.max(3.2, Math.min(5.5, S))
          const vOffset = vh * 0.12
          const s0 = scaleMV.get()
          fly = {
            t0: nowMs,
            cx0: -xMV.get() / s0,
            cy0: -yMV.get() / s0,
            s0,
            s1: S,
            vOffset,
            // Zoom dips mid-flight (pull out → glide → push in, one motion).
            // Deep dip when hopping planet→planet at high zoom; shallow when
            // coming from the sun/home view.
            dip: s0 > 2 ? 0.5 : 0.12,
          }
          // The camera keeps the planet here — publish once per step. Use the
          // NEAR-side depth scale so the caption always clears the sprite even
          // as the planet swings toward the viewer mid-step.
          const px = Math.max(10, Math.round((PLANETS[i].size * 3.2 + 5) * 1.85))
          setSpotlight({
            x: vw / 2,
            y: vh / 2 - vOffset,
            r: (px / 2) * S * (1 + DEPTH_SCALE),
          })
        }
      }

      // Frame-rate-independent ease toward each planet's target speed. dt=0 (the
      // reduced-motion / frozen static placement) settles instantly.
      const k = dt > 0 ? 1 - Math.exp(-dt / EASE_TAU) : 1
      tGlob += dt
      // Moons fade in when the camera is close (LOD) or a planet is spotlighted.
      const camS = scaleMV.get()
      const moonTarget = camS > 1.7 || follow ? 1 : 0
      moonOp += (moonTarget - moonOp) * k
      // Live position of the followed planet this frame (for the camera).
      let fxNow = 0
      let fyNow = 0
      for (let i = 0; i < PLANETS.length; i++) {
        const b = base[i]
        // Planets NEVER slow down — hover feedback is visual only (glow, ring,
        // label). Slowing one planet while the system rotates read as "it's
        // moving in reverse".
        spd[i] += (1 - spd[i]) * k
        pt[i] += dt * spd[i]

        // The user's azimuth spin adds to the orbital angle (rotating the world
        // about the plane normal leaves the circular orbits unchanged).
        const angle = b.angle0 + pt[i] * b.omega + azEff
        const cosA = Math.cos(angle)
        const sinA = Math.sin(angle)
        // Tilted-plane projection: foreshorten y; sinA is the near/far depth
        // (+1 = closest to the viewer, −1 = farthest behind the sun).
        const x = b.orbR * cosA
        const y = b.orbR * sinA * cosT
        const dN = sinA
        const sc = 1 + dN * DEPTH_SCALE
        projX[i] = x
        projY[i] = y
        if (follow && PLANETS[i].name === follow) {
          fxNow = x
          fyNow = y
        }
        const node = planetRefs.current[i]
        if (node) {
          // The wrapper anchor sits at the stage centre; translate it to the
          // orbit point and apply the depth scale. The sphere inside re-centres
          // on the anchor via -50%.
          node.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${sc.toFixed(3)})`
          // Near-side planets pass IN FRONT of the sun (z 50), far side behind.
          const z = 50 + Math.round(dN * 30)
          if (z !== lastZ[i]) {
            lastZ[i] = z
            node.style.zIndex = String(z)
          }
          // Depth lighting — nearer is brighter. Only touch the style when it
          // meaningfully changes.
          const br = 1 + dN * DEPTH_BRIGHT
          if (Math.abs(br - lastB[i]) > 0.02) {
            lastB[i] = br
            node.style.filter = `brightness(${br.toFixed(2)})`
          }
        }
        registerPlanet(PLANETS[i].name, x, y)

        // Rotate the day/night terminator so the lit side faces the sun.
        const shade = shadeRefs.current[i]
        if (shade) {
          const lightDeg = (Math.atan2(y, x) * 180) / Math.PI
          shade.style.transform = `rotate(${lightDeg.toFixed(1)}deg)`
        }

        // Comet trail: a gradient streak pointing opposite the PROJECTED
        // orbital velocity. Fades with speed — a caught planet has no trail.
        const trail = trailRefs.current[i]
        if (trail) {
          const deg = (Math.atan2(-cosA * cosT, sinA) * 180) / Math.PI
          trail.style.transform = `translateY(-50%) rotate(${deg.toFixed(1)}deg)`
          const o = 0.38 * spd[i]
          trail.style.opacity = o < 0.03 ? '0' : o.toFixed(2)
        }

        // Moons — tiny tilted orbits around the planet anchor (LOD-gated).
        const moons = MOONS[PLANETS[i].name]
        if (moons && moonOp > 0.01) {
          for (let j = 0; j < moons.length; j++) {
            const el = moonRefs.current[`${i}-${j}`]
            if (!el) continue
            const m = moons[j]
            const ma = tGlob * (TWO_PI / m.period) + j * 2.4 + i * 1.7
            const mr = pxArr[i] * m.r
            const mx = mr * Math.cos(ma)
            const my = mr * Math.sin(ma) * cosT
            el.style.transform = `translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px)`
            el.style.zIndex = my > 0 ? '2' : '0'
            el.style.opacity = moonOp.toFixed(2)
          }
        } else if (moons && moonOp <= 0.01 && lastMoonOp > 0.01) {
          for (let j = 0; j < moons.length; j++) {
            const el = moonRefs.current[`${i}-${j}`]
            if (el) el.style.opacity = '0'
          }
        }
      }
      lastMoonOp = moonOp

      // ── Drive the camera: fly-to tween, then exact lock-on (no springs) ────
      if (follow && fly) {
        const u = Math.min(1, (nowMs - fly.t0) / FLY_MS)
        const e = easeInOutCubic(u)
        // Look-at target is the planet's LIVE position — the tween converges
        // onto it, then (u=1) tracks it exactly, frame for frame.
        const tx = fxNow
        const ty = fyNow + fly.vOffset / fly.s1
        // Zoom dip: multiplying by (1 − dip·sin(πe)) pulls the camera out over
        // the first half of the flight and pushes it back in over the second.
        const S = lerp(fly.s0, fly.s1, e) * (1 - fly.dip * Math.sin(Math.PI * e))
        const cx = lerp(fly.cx0, tx, e)
        const cy = lerp(fly.cy0, ty, e)
        scaleMV.jump(S)
        xMV.jump(-cx * S)
        yMV.jump(-cy * S)
        opacityMV.jump(1)
        blurMV.jump(0)
      } else if (!follow && freeRef.current.on && canFreeRef.current) {
        // ── User-held camera: apply drag/pinch state + release inertia ───────
        const f = freeRef.current
        if (!f.dragging && dt > 0 && (Math.abs(f.vx) > 2 || Math.abs(f.vy) > 2)) {
          f.cx += f.vx * dt
          f.cy += f.vy * dt
          const decay = Math.exp(-dt / 0.55)
          f.vx *= decay
          f.vy *= decay
        }
        scaleMV.jump(f.s)
        xMV.jump(-f.cx * f.s)
        yMV.jump(-f.cy * f.s)

        // Zoom-to-land: when the camera is close to a WORLD planet, hint it;
        // zoom past the threshold and the warp takes you into its page.
        let bestNav: PlanetNav | null = null
        let bestD = Infinity
        for (let i = 0; i < PLANETS.length; i++) {
          const nav = PLANET_NAV[PLANETS[i].name]
          if (!nav || nav.kind !== 'world') continue
          const d = Math.hypot(projX[i] - f.cx, projY[i] - f.cy)
          if (d < bestD) {
            bestD = d
            bestNav = nav
          }
        }
        const vmin = Math.min(window.innerWidth, window.innerHeight)
        const near =
          bestNav && f.s > NEAR_S && bestD < (vmin / (2 * f.s)) * 0.6 ? bestNav : null
        if ((near?.name ?? null) !== nearNameRef.current) {
          nearNameRef.current = near?.name ?? null
          setNearWorld(near)
        }
        if (near && f.s >= LAND_S) {
          f.on = false
          nearNameRef.current = null
          setNearWorld(null)
          enterWorldRef.current(near)
        }
      }
    }

    // Reduced motion OR frozen (warping / in a world) → place once, stop.
    if (reduce || frozen) {
      place(0)
      return
    }

    const tick = () => {
      const nowPerf = performance.now()
      // Clamp dt so returning to a backgrounded tab doesn't teleport every planet
      // (and slam the camera) with one giant accumulated step.
      const dt = Math.min(0.05, (nowPerf - prevPerf) / 1000)
      prevPerf = nowPerf
      place(dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [R, reduce, frozen, registerPlanet])

  const sunSize = 78

  return (
    <div
      ref={rootRef}
      className={`fixed inset-0 touch-none select-none overflow-hidden bg-[#02030a] ${
        !frozen && !tourActive ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      onPointerDown={onStagePointerDown}
      onPointerMove={onStagePointerMove}
      onPointerUp={onStagePointerUp}
      onPointerCancel={onStagePointerUp}
      onContextMenu={(e) => e.preventDefault()} // right-drag = pan, no menu
      onClickCapture={(e) => {
        // A drag is not a click — don't fire planet navigation on release.
        if (e.timeStamp - suppressClickRef.current < 400) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      {/* Deep-space backdrop — near-black like the real sky (NASA Eyes). */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, #0b0f1d 0%, #060810 55%, #02030a 100%)',
        }}
      />

      {/* WRAPAROUND STAR DOME — three identical viewport-width tiles; skyX
          wraps modulo one tile, so dragging wheels the sky continuously in one
          direction forever (you can go around the back of the system). */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-[-12%] left-[-100%] w-[300%]"
        style={{ x: skyX, y: skyY, scale: farScale, willChange: 'transform' }}
      >
        {[0, 1, 2].map((tile) => (
          <div
            key={`sky-${tile}`}
            className="absolute inset-y-0"
            style={{ left: `${(tile * 100) / 3}%`, width: `${100 / 3}%` }}
          >
            <span
              className="nebula"
              style={{
                left: '8%',
                top: '10%',
                width: '46vmax',
                height: '46vmax',
                background:
                  'radial-gradient(circle at 42% 42%, rgba(99,102,241,0.09), transparent 62%)',
                ['--n-dur' as string]: '90s',
              }}
            />
            <span
              className="nebula"
              style={{
                right: '4%',
                bottom: '4%',
                width: '40vmax',
                height: '40vmax',
                background:
                  'radial-gradient(circle at 55% 50%, rgba(245,158,11,0.05), transparent 60%)',
                ['--n-dur' as string]: '120s',
              }}
            />
            {/* Milky-way band — horizontal so the tiles join seamlessly. */}
            <div className="milky-way">
              {BAND_STARS.map((st, i) => (
                <span
                  key={`band-${i}`}
                  className="twinkle-star absolute rounded-full bg-white"
                  style={
                    {
                      left: `${st.x}%`,
                      top: `${st.y}%`,
                      width: st.size * 0.7,
                      height: st.size * 0.7,
                      opacity: st.op * 0.6,
                      '--tw-dur': `${5 + (i % 5)}s`,
                      '--tw-delay': `${st.delay}s`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
            {STARS_FAR.map((st, i) => (
              <span
                key={`far-${i}`}
                className="twinkle-star absolute rounded-full"
                style={
                  {
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                    width: st.size * 0.8,
                    height: st.size * 0.8,
                    opacity: st.op * 0.5,
                    background: starTint(st.tint),
                    '--tw-dur': `${5 + (i % 6)}s`,
                    '--tw-delay': `${st.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
            {tile === 1 &&
              SHOOTING.map((s, i) => (
                <span
                  key={`ss-${i}`}
                  className="shooting-star"
                  style={
                    {
                      top: s.top,
                      left: s.left,
                      '--ss-dur': s.dur,
                      '--ss-delay': s.delay,
                      '--ss-angle': s.angle,
                    } as React.CSSProperties
                  }
                />
              ))}
          </div>
        ))}
      </motion.div>

      {/* Camera — the whole system zooms/pans through this layer. */}
      <motion.div
        ref={wrapRef}
        className="absolute inset-0 h-full w-full"
        style={{
          transformOrigin: 'center center',
          willChange: 'transform',
          scale: scaleMV,
          x: xMV,
          y: yMV,
          opacity: opacityMV,
          filter: filterMV,
        }}
      >
        {/* Starfield — spectral tints; the brightest get a soft glow halo. */}
        {stars.map((st, i) => {
          const tint = starTint(st.tint)
          return (
            <span
              key={i}
              aria-hidden="true"
              className="twinkle-star absolute rounded-full"
              style={
                {
                  left: `${st.x}%`,
                  top: `${st.y}%`,
                  width: st.size,
                  height: st.size,
                  opacity: st.op,
                  background: tint,
                  boxShadow:
                    st.size > 1.6
                      ? `0 0 ${Math.round(st.size * 3)}px ${Math.round(st.size * 0.6)}px ${tint}44`
                      : undefined,
                  '--tw-dur': `${4 + (i % 5)}s`,
                  '--tw-delay': `${st.delay}s`,
                } as React.CSSProperties
              }
            />
          )
        })}

        {/* Orbit rings */}
        {mounted &&
          R > 0 &&
          PLANETS.map((p, i) => {
            const d = ORBIT_FRAC[i] * R * 2
            // Hovering (or spotlighting) a planet lights ITS orbit up in its
            // accent colour, so the lane you're on is always obvious.
            const lit = hoveredName === p.name || spotlightName === p.name
            return (
              <div
                key={`ring-${p.name}`}
                ref={(el) => {
                  ringRefs.current[i] = el
                }}
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 border"
                style={{
                  width: d,
                  // Tilted plane → orbits are ellipses (live height follows tilt).
                  height: d * COS_T,
                  // 50%, NOT rounded-full: border-radius 9999px on a non-square
                  // box draws a pill, whose edge bulges outside the true ellipse
                  // the planets actually travel — they looked off their orbits.
                  borderRadius: '50%',
                  // Depth cue: the FAR side of the orbit fades away.
                  WebkitMaskImage:
                    'linear-gradient(to bottom, rgba(0,0,0,0.4), #000 65%)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), #000 65%)',
                  transform: 'translate(-50%, -50%)',
                  // Clearly readable orbit lines at overview zoom (NASA-Eyes
                  // style) — soft blue on the near-black sky.
                  borderColor: lit ? `${p.color}88` : 'rgba(148,163,216,0.28)',
                  boxShadow: lit
                    ? `0 0 24px -8px ${p.color}55, inset 0 0 24px -8px ${p.color}33`
                    : undefined,
                  transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                }}
              />
            )
          })}

        {/* The Sun — click for the full bio */}
        <button
          type="button"
          onClick={openBio}
          data-cursor-visit
          aria-label="About Ankur Singh — the centre of the cosmos"
          className="group absolute left-1/2 top-1/2 z-[50] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-none pointer-events-auto focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          {/* Corona (rays + soft halo). Fades out under camera zoom — at 5×
              these would otherwise magnify into a screen-filling wash. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2"
            style={{ opacity: coronaFade }}
          >
            <span
              className="sun-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: sunSize * 5, height: sunSize * 5 }}
            />
            <span
              className="sun-rays absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 transition-opacity duration-500 group-hover:opacity-90"
              style={{ width: sunSize * 3.4, height: sunSize * 3.4 }}
            />
          </motion.span>
          <div
            className="sun-core relative transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110"
            style={{ width: sunSize, height: sunSize }}
          />
          <span className="pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-slate-900 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="font-mono">Ankur Singh</span>
            <span className="ml-1.5 text-slate-400">· who I am</span>
          </span>
        </button>

        {/* Planets — interactive destinations */}
        {PLANETS.map((p, i) => {
          const px = Math.max(10, Math.round((p.size * 3.2 + 5) * 1.85))
          const nav = PLANET_NAV[p.name]
          const isLink = nav?.kind === 'link'
          const spotlighted = spotlightName === p.name
          const ariaLabel = nav
            ? isLink
              ? `Open ${nav.label.replace(' ↗', '')} in a new tab`
              : `Fly to the ${nav.label} world`
            : p.name

          const sphere = (
            <span
              className={`relative block overflow-hidden rounded-full ring-1 ring-black/40 transition-[transform,filter] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.55] group-hover:brightness-125 group-focus-visible:scale-[1.55] ${
                reduce ? '' : 'planet-in'
              }`}
              style={{
                width: px,
                height: px,
                background: sphereBg(p), // paints instantly while the texture loads
                boxShadow: `0 0 ${Math.round(px * 0.9)}px ${p.color}66`,
                animationDelay: `${0.15 + i * 0.09}s`,
              }}
            >
              {/* Rotating REAL surface (equirectangular map scrolling). */}
              <span
                aria-hidden="true"
                className="planet-tex absolute inset-0"
                style={
                  {
                    backgroundImage: `url(${TEXTURE[p.name]})`,
                    backgroundSize: 'auto 100%',
                    backgroundRepeat: 'repeat-x',
                    '--tex-w': `${px * 2}px`,
                    animationDuration: `${46 + i * 14}s`,
                  } as React.CSSProperties
                }
              />
              {/* Sphere shading: soft key light + limb darkening. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 42% 38%, rgba(255,255,255,0.26), rgba(255,255,255,0) 46%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.34) 80%, rgba(0,0,0,0.72) 100%)',
                }}
              />
              {/* Day/night terminator — rotated every frame so the dark limb
                  faces away from the sun. Turns the sprite into a lit sphere. */}
              <span
                ref={(el) => {
                  shadeRefs.current[i] = el
                }}
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(2,3,10,0) 42%, rgba(2,3,10,0.32) 64%, rgba(2,3,10,0.78) 94%)',
                  willChange: 'transform',
                }}
              />
            </span>
          )

          const ringGlow = spotlighted && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 rounded-full blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.12, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: px * 3.4,
                height: px * 3.4,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${p.color}66 0%, ${p.color}22 42%, transparent 70%)`,
              }}
            />
          )

          const label = (
            <span className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-900 opacity-0 shadow-lg transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <span className="font-mono">{nav ? nav.label : p.name}</span>
              {nav && <span className="ml-1.5 text-slate-400">· {nav.tag}</span>}
            </span>
          )

          const saturnRing = p.name === 'Saturn' && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 border"
              style={{
                width: px * 2.1,
                height: px * 0.7,
                borderRadius: '50%', // true ellipse, not a pill
                borderColor: 'rgba(227,210,160,0.6)',
                boxShadow: '0 0 6px rgba(227,210,160,0.35)',
                transform: 'translate(-50%, -50%) rotate(-18deg)',
              }}
            />
          )

          // p-2.5 pads the hit target well past 44px on the small inner planets
          // without changing the visual size.
          const innerClass =
            'group relative z-[1] grid -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full p-2.5 outline-none pointer-events-auto focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

          // Hover feedback is visual only (ring highlight, glow, label) —
          // mouse-only, since touch "enters" on tap and never leaves.
          const hoverProps = {
            onPointerEnter: (e: React.PointerEvent) => {
              if (e.pointerType !== 'mouse') return
              setHoveredName(p.name)
            },
            onPointerLeave: () => {
              setHoveredName((n) => (n === p.name ? null : n))
            },
          }

          return (
            <div
              key={p.name}
              ref={(el) => {
                planetRefs.current[i] = el
              }}
              className="absolute left-1/2 top-1/2 z-10"
              style={{
                opacity: mounted ? 1 : 0,
                transition: 'opacity 1s ease',
                // Depth scale must grow AROUND the orbit anchor — the default
                // (box centre) shifted big planets visibly off their orbit line.
                transformOrigin: '0 0',
              }}
            >
              {/* Comet trail — rotated along the orbital velocity every frame;
                  fades out when the planet is caught (hover) or spotlighted. */}
              <span
                ref={(el) => {
                  trailRefs.current[i] = el
                }}
                aria-hidden="true"
                className="planet-trail pointer-events-none absolute left-0 top-0 origin-left rounded-full"
                style={{
                  width: 26 + i * 5,
                  height: 2.5,
                  opacity: 0,
                  background: `linear-gradient(90deg, ${p.color}cc, transparent)`,
                  willChange: 'transform, opacity',
                }}
              />
              {/* Moons — appear when the camera gets close (LOD). Positioned
                  every frame by the rAF loop; z flips front/behind the planet. */}
              {(MOONS[p.name] ?? []).map((m, j) => {
                const ms = Math.max(4, px * m.size)
                return (
                  <span
                    key={`moon-${j}`}
                    ref={(el) => {
                      moonRefs.current[`${i}-${j}`] = el
                    }}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 rounded-full"
                    style={{
                      width: ms,
                      height: ms,
                      marginLeft: -ms / 2,
                      marginTop: -ms / 2,
                      opacity: 0,
                      background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), ${m.color} 55%, rgba(0,0,0,0.5) 100%)`,
                      boxShadow: `0 0 ${Math.round(ms * 0.6)}px ${m.color}66`,
                      willChange: 'transform, opacity',
                    }}
                  />
                )
              })}
              {nav && isLink ? (
                <a
                  href={nav.target}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ariaLabel}
                  data-cursor-visit
                  className={innerClass}
                  {...hoverProps}
                >
                  {ringGlow}
                  {sphere}
                  {label}
                </a>
              ) : (
                <button
                  type="button"
                  aria-label={ariaLabel}
                  data-cursor-visit
                  onClick={() => nav && enterWorld(nav)}
                  className={innerClass}
                  {...hoverProps}
                >
                  {ringGlow}
                  {saturnRing}
                  {sphere}
                  {label}
                </button>
              )}
            </div>
          )
        })}
      </motion.div>

      {/* Zoom-to-land hint — you're hovering near a world; keep zooming. */}
      <AnimatePresence>
        {nearWorld && (
          <motion.div
            key={`near-${nearWorld.name}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-x-0 bottom-24 z-40 flex justify-center"
          >
            <span
              className="flex items-center gap-2 rounded-full border bg-black/75 px-4 py-2 font-mono text-xs text-white shadow-lg"
              style={{ borderColor: `${nearWorld.accent}66` }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: nearWorld.accent }} />
              keep zooming → {nearWorld.label.replace(' ↗', '')}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* One-time explore hint. */}
      {!hintOff && !tourActive && mounted && (
        <div className="pointer-events-none absolute bottom-6 left-6 z-40 font-mono text-[11px] tracking-wide text-white/40">
          {isSmall
            ? 'drag to rotate · two fingers to move & zoom'
            : 'drag to rotate · right-drag to move · scroll to zoom'}
        </div>
      )}

      {/* Tour spotlight vignette — dims the whole cosmos except a window around
          the spotlighted planet, so there is zero doubt which planet the card is
          talking about. Fades in as the fly-to lands. */}
      <AnimatePresence>
        {followNav && (
          <motion.div
            key={`spot-${followNav.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, delay: 0.55, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background:
                'radial-gradient(circle at 50% 38%, transparent 0%, transparent 13%, rgba(5,7,15,0.45) 42%, rgba(5,7,15,0.7) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Tour: name tag pinned over the spotlighted planet (which the camera
          keeps centred). Lives outside the camera so it stays crisp at any zoom. */}
      {followNav && (
        <motion.div
          key={followNav.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none fixed left-1/2 top-[30%] z-30 -translate-x-1/2 -translate-y-1/2"
        >
          <span
            className="flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold text-white shadow-lg"
            style={{ borderColor: `${followNav.accent}66`, background: 'rgba(11,19,39,0.85)' }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: followNav.accent }} />
            {followNav.label.replace(' ↗', '')}
          </span>
        </motion.div>
      )}

      <style jsx>{`
        .sun-core {
          border-radius: 9999px;
          background: radial-gradient(circle at 50% 50%, #fff7d6 0%, #ffd34d 38%, #f59e0b 70%, #ea7a0b 100%);
          /* Tight glow only — the wide halo lives on .sun-halo so it can fade
             out under camera zoom instead of washing the whole viewport. */
          box-shadow: 0 0 32px 10px rgba(245, 158, 11, 0.55);
          animation: sunPulse 4s ease-in-out infinite;
        }
        .sun-halo {
          border-radius: 9999px;
          background: radial-gradient(
            circle,
            rgba(245, 158, 11, 0.32) 0%,
            rgba(245, 158, 11, 0.14) 34%,
            transparent 62%
          );
        }
        .twinkle-star {
          animation: twinkle var(--tw-dur, 3s) ease-in-out var(--tw-delay, 0s) infinite;
        }
        .sun-rays {
          border-radius: 9999px;
          background: repeating-conic-gradient(
            rgba(255, 211, 77, 0.14) 0deg 5deg,
            transparent 5deg 17deg
          );
          -webkit-mask-image: radial-gradient(circle, black 18%, transparent 64%);
          mask-image: radial-gradient(circle, black 18%, transparent 64%);
          animation: raysSpin 48s linear infinite;
          will-change: transform;
        }
        .nebula {
          position: absolute;
          border-radius: 9999px;
          will-change: transform;
          animation: nebulaDrift var(--n-dur, 90s) ease-in-out infinite alternate;
        }
        .milky-way {
          /* Horizontal river of light — uniform along x so the wraparound sky
             tiles join without a visible seam. */
          position: absolute;
          left: 0;
          right: 0;
          top: 28%;
          height: 30%;
          background:
            linear-gradient(
              to bottom,
              transparent 0%,
              rgba(148, 163, 216, 0.05) 22%,
              rgba(199, 210, 254, 0.1) 46%,
              rgba(224, 231, 255, 0.13) 52%,
              rgba(199, 210, 254, 0.1) 58%,
              rgba(148, 163, 216, 0.05) 80%,
              transparent 100%
            ),
            radial-gradient(ellipse 55% 42% at 38% 50%, rgba(199, 185, 255, 0.1), transparent 70%),
            radial-gradient(ellipse 40% 36% at 72% 48%, rgba(255, 226, 189, 0.07), transparent 70%);
        }
        .shooting-star {
          position: absolute;
          width: 110px;
          height: 2px;
          border-radius: 9999px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), transparent);
          opacity: 0;
          will-change: transform, opacity;
          animation: shoot var(--ss-dur, 9s) linear var(--ss-delay, 0s) infinite;
        }
        .planet-in {
          animation: planetIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .planet-tex {
          animation-name: planetSpin;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes planetSpin {
          from { background-position-x: 0; }
          to { background-position-x: var(--tex-w, 200px); }
        }
        @keyframes sunPulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.18); }
        }
        @keyframes twinkle {
          /* Real stars shimmer — they don't blink on and off. */
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.95; }
        }
        @keyframes raysSpin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes nebulaDrift {
          from { transform: translate3d(-3%, -2%, 0) scale(1); }
          to { transform: translate3d(3%, 3%, 0) scale(1.1); }
        }
        @keyframes shoot {
          0%, 86% { opacity: 0; transform: rotate(var(--ss-angle, -30deg)) translateX(0); }
          90% { opacity: 0.9; }
          100% { opacity: 0; transform: rotate(var(--ss-angle, -30deg)) translateX(44vw); }
        }
        @keyframes planetIn {
          from { transform: scale(0); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sun-core { animation: none; }
          .twinkle-star { animation: none; }
          .sun-rays { animation: none; }
          .nebula { animation: none; }
          .milky-way { animation: none; }
          .shooting-star { display: none; }
          .planet-trail { display: none; }
          .planet-in { animation: none; }
          .planet-tex { animation: none; }
        }
      `}</style>
    </div>
  )
}
