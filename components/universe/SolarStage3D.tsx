'use client'

/**
 * SolarStage3D — a REAL Three.js solar system.
 *
 * The physics the 2.5D stage could only fake are structural here:
 *  • The solar system never moves — planets orbit the sun at the world origin.
 *  • Mouse input drives ONLY the camera (OrbitControls, target locked to the
 *    sun). Drag = orbit the view, wheel/pinch = dolly. NASA-Eyes feel.
 *  • The starfield is a 5000-point BufferGeometry attached to the SCENE (not
 *    the camera), so the sky holds still in world space and wheels past
 *    naturally as you orbit.
 *
 * Planet surface textures: CC BY 4.0 — solarsystemscope.com/textures.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useReducedMotion } from 'framer-motion'
import { PLANETS, positionFor } from '@/lib/ephemeris'
import { PLANET_NAV, SUN_NAV, type PlanetNav } from '@/lib/universe-nav'
import { PLANET_TEXTURE_1K, PLANET_TEXTURE_2K } from '@/lib/planet-textures'
import { useUniverse } from '@/lib/hooks/useUniverse'

const TWO_PI = Math.PI * 2

// Synthetic-but-Keplerian orbital speeds (inner fast, outer slow), driven by
// elapsed time only — mouse input never touches these.
const aMin = Math.min(...PLANETS.map((p) => p.el[0]))
const INNER_PERIOD_SEC = 22
const omegaFor = (a: number) => TWO_PI / (INNER_PERIOD_SEC * Math.pow(a / aMin, 0.55))

const easeInOutCubic = (u: number) =>
  u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2
const easeOutCubic = (u: number) => 1 - Math.pow(1 - u, 3)
const easeInCubic = (u: number) => u * u * u
// One tour hop: rise OVER the system in an arc, sweep sideways, descend onto
// the next planet. Scripted (deterministic), so it can never wobble.
const TOUR_FLY_MS = 1900
// Click-to-enter: fly one full lap around the body, then spiral in. A touch
// longer than WARP_IN_MS so the final descent lands under the page's fade-in.
const DIVE_MS = 1750

// Evenly-spaced orbit radii (world units) — readable, never overlapping.
const ORBIT_A = PLANETS.map((_, i) => 26 + i * 13)
// Planet sphere radii.
const RADII = PLANETS.map((p) => 1.15 + p.size * 0.42)

// NATURAL moons are REALISTIC — right counts, grey rock, decorative (hover
// shows their real name). Earth has exactly one Moon.
// Your content orbits as MAN-MADE SATELLITES instead (see PLANET_NAV moons):
// small tinted spacecraft in fast low orbit — you launched them.
const NATURAL_MOONS: Record<string, { name: string; r: number; size: number; period: number }[]> = {
  Earth: [{ name: 'The Moon', r: 2.7, size: 0.27, period: 11 }],
  Mars: [
    { name: 'Phobos', r: 1.9, size: 0.12, period: 5 },
    { name: 'Deimos', r: 2.5, size: 0.1, period: 8 },
  ],
  Jupiter: [
    { name: 'Io', r: 1.8, size: 0.14, period: 4 },
    { name: 'Europa', r: 2.2, size: 0.13, period: 6 },
    { name: 'Ganymede', r: 2.7, size: 0.2, period: 9 },
    { name: 'Callisto', r: 3.3, size: 0.18, period: 13 },
  ],
  Saturn: [{ name: 'Titan', r: 3.2, size: 0.2, period: 12 }],
  Uranus: [{ name: 'Miranda', r: 2.0, size: 0.12, period: 7 }],
  Neptune: [{ name: 'Triton', r: 2.2, size: 0.16, period: 9 }],
}

/** 80% white / 15% blue / 5% yellow star cloud on a big sphere shell. */
function makeStarfield(count: number, rMin: number, rMax: number, size: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // Uniform direction, radius biased outward (shell-ish).
    const u = Math.random() * 2 - 1
    const phi = Math.random() * TWO_PI
    const s = Math.sqrt(1 - u * u)
    const r = rMin + (rMax - rMin) * Math.cbrt(Math.random())
    positions[i * 3] = s * Math.cos(phi) * r
    positions[i * 3 + 1] = u * r
    positions[i * 3 + 2] = s * Math.sin(phi) * r
    const roll = Math.random()
    let cr = 1
    let cg = 1
    let cb = 1
    if (roll > 0.95) {
      cr = 1
      cg = 0.9
      cb = 0.72 // yellow-tinted
    } else if (roll > 0.8) {
      cr = 0.72
      cg = 0.82
      cb = 1 // blue-tinted
    }
    const dim = 0.55 + Math.random() * 0.45
    colors[i * 3] = cr * dim
    colors[i * 3 + 1] = cg * dim
    colors[i * 3 + 2] = cb * dim
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false,
  })
  return new THREE.Points(geo, mat)
}

/** Dense milky-way band: points clustered around a tilted great circle. */
function makeMilkyWay(count: number, radius: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const gauss = () => (Math.random() + Math.random() + Math.random()) / 3 - 0.5
  for (let i = 0; i < count; i++) {
    const phi = Math.random() * TWO_PI
    const spread = gauss() * 0.5
    const v = new THREE.Vector3(
      Math.cos(phi) * radius,
      spread * radius * 0.55,
      Math.sin(phi) * radius,
    )
    v.applyEuler(new THREE.Euler(1.05, 0, 0.35))
    positions[i * 3] = v.x
    positions[i * 3 + 1] = v.y
    positions[i * 3 + 2] = v.z
    const dim = 0.16 + Math.random() * 0.3
    colors[i * 3] = 0.78 * dim
    colors[i * 3 + 1] = 0.82 * dim
    colors[i * 3 + 2] = 1 * dim
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size: 1.6,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  return new THREE.Points(geo, mat)
}

/** Soft radial glow sprite (canvas-generated — no image assets). */
function makeGlowSprite(color: string, size: number, inner = 0.12) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 256 * inner * 0.5, 128, 128, 128)
  g.addColorStop(0, color)
  g.addColorStop(0.4, color.replace(/[\d.]+\)$/, '0.35)'))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.setScalar(size)
  return sprite
}

export function SolarStage3D() {
  const hostRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const {
    enterWorld,
    registerPlanet,
    setSpotlight,
    tourActive,
    tourIndex,
    frozen,
    phase,
    active,
    paused,
    recenterKey,
  } = useUniverse()

  // The render loop reads live state through refs (never re-creates the scene).
  const tourRef = useRef({ active: false, index: 0 })
  const frozenRef = useRef(false)
  const reduceRef = useRef(false)
  const pausedRef = useRef(false)
  const recenterRef = useRef(false)
  const enterWorldRef = useRef(enterWorld)
  useEffect(() => {
    tourRef.current = { active: tourActive, index: tourIndex }
  }, [tourActive, tourIndex])
  useEffect(() => {
    frozenRef.current = frozen
  }, [frozen])
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])
  // Each recenter tap flags the loop to glide back to the sun overview.
  useEffect(() => {
    if (recenterKey > 0) recenterRef.current = true
  }, [recenterKey])
  // Warp choreography: entering a world DIVES the camera into that planet in
  // sync with the warp overlay; exiting restores a comfortable distance.
  const warpRef = useRef<{ diving: string | null; restore: boolean }>({
    diving: null,
    restore: false,
  })
  // Pause the heavy main render while an (opaque) world page covers the scene —
  // the page has its own hero planet canvas. State keeps advancing so the
  // system is alive the instant you return.
  const worldOpenRef = useRef(false)
  useEffect(() => {
    if (phase === 'world') {
      // Keep rendering through the page's fade-in so the planet stays alive
      // behind it (a live crossfade, not a freeze), THEN pause to save GPU.
      const id = setTimeout(() => {
        worldOpenRef.current = true
      }, 900)
      return () => clearTimeout(id)
    }
    worldOpenRef.current = false
  }, [phase])
  useEffect(() => {
    if (phase === 'warping-in' && active) {
      warpRef.current.diving = active.name
    } else if (phase === 'warping-out' || phase === 'home') {
      if (warpRef.current.diving) warpRef.current.restore = true
      warpRef.current.diving = null
    }
  }, [phase, active])
  useEffect(() => {
    reduceRef.current = !!reduce
  }, [reduce])
  useEffect(() => {
    enterWorldRef.current = enterWorld
  }, [enterWorld])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    // ── Renderer / scene / camera ────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x02030a)

    const camera = new THREE.PerspectiveCamera(
      55,
      host.clientWidth / host.clientHeight,
      0.1,
      5000,
    )
    camera.position.set(0, 62, 135)

    // ── OrbitControls — free exploration (orbit · zoom-to-cursor · pan) ───
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0) // starts on the sun; the user can move it
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enableZoom = true
    controls.zoomToCursor = true // zoom toward the cursor / pinch point, NOT the sun
    controls.zoomSpeed = 0.9
    controls.rotateSpeed = 0.45
    // Wide-open limits → no invisible wall. Get right onto a planet, or pull
    // way out past the whole system. (Camera far plane is 5000.)
    controls.minDistance = 2
    controls.maxDistance = 3000
    controls.enablePan = true
    controls.screenSpacePanning = true
    controls.panSpeed = 0.7
    // Right-drag pans on desktop (mouseButtons default RIGHT = PAN).
    // Touch: one finger orbits, two fingers pinch-zoom + pan (true free-fly).
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }

    // ── Static universe: starfield + milky way live on the SCENE ─────────
    const stars = makeStarfield(5000, 900, 2000, 0.7 * 3) // size in world units
    scene.add(stars)
    const starMat = stars.material as THREE.PointsMaterial
    const STAR_SIZE = starMat.size
    const milky = makeMilkyWay(2600, 1500)
    scene.add(milky)

    // ── Lights ───────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x8090b8, 0.32))
    const sunLight = new THREE.PointLight(0xfff0d0, 2.6, 0, 0)
    scene.add(sunLight)

    // ── The Sun ──────────────────────────────────────────────────────────
    const sunGroup = new THREE.Group()
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(8, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd34d }),
    )
    sunMesh.userData.kind = 'sun'
    sunGroup.add(sunMesh)
    sunGroup.add(makeGlowSprite('rgba(255,190,80,0.9)', 46))
    sunGroup.add(makeGlowSprite('rgba(255,150,40,0.5)', 110))
    scene.add(sunGroup)

    // ── Planets, orbit lines, moons ──────────────────────────────────────
    const texLoader = new THREE.TextureLoader()
    const maxAniso = renderer.capabilities.getMaxAnisotropy()
    const disposables: { dispose: () => void }[] = []
    const planetGroups: THREE.Group[] = []
    const planetMeshes: THREE.Mesh[] = []
    const moonMeshes: THREE.Mesh[] = []
    const ringMats: THREE.LineBasicMaterial[] = []
    const moonPivots: { pivot: THREE.Group; period: number }[] = []
    const angle0 = PLANETS.map((p) => positionFor(p, new Date()).longitude)
    const omega = PLANETS.map((p) => omegaFor(p.el[0]))

    // Lazy quality bump: the moment a planet is focused/toured, its 1K map is
    // swapped for the 2K one — close-ups stay crisp without a heavy first load.
    const upgraded = PLANETS.map(() => false)
    const upgradeTexture = (i: number) => {
      if (upgraded[i]) return
      upgraded[i] = true
      texLoader.load(PLANET_TEXTURE_2K[PLANETS[i].name], (t2) => {
        t2.colorSpace = THREE.SRGBColorSpace
        t2.anisotropy = maxAniso
        const m = planetMeshes[i].material as THREE.MeshStandardMaterial
        const old = m.map
        m.map = t2
        m.needsUpdate = true
        old?.dispose()
        disposables.push(t2)
      })
    }

    PLANETS.forEach((p, i) => {
      const r = RADII[i]
      const group = new THREE.Group()

      const tex = texLoader.load(PLANET_TEXTURE_1K[p.name])
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = maxAniso
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 })
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 64), mat)
      mesh.userData = { kind: 'planet', name: p.name, index: i }
      group.add(mesh)
      disposables.push(mesh.geometry, mat, tex)

      // Saturn's ring.
      if (p.name === 'Saturn') {
        const ringGeo = new THREE.RingGeometry(r * 1.45, r * 2.3, 64)
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xe3d2a0,
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide,
        })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = -Math.PI / 2 + 0.32
        group.add(ring)
        disposables.push(ringGeo, ringMat)
      }

      // NATURAL moons — realistic counts, grey rock, hover shows the real name.
      for (const nm of NATURAL_MOONS[p.name] ?? []) {
        const pivot = new THREE.Group()
        const nmGeo = new THREE.SphereGeometry(Math.max(0.35, r * nm.size), 18, 18)
        const nmMat = new THREE.MeshStandardMaterial({ color: 0xa8a8b0, roughness: 1 })
        const moon = new THREE.Mesh(nmGeo, nmMat)
        moon.position.set(r * nm.r, 0, 0)
        moon.userData = { kind: 'nmoon', label: nm.name }
        pivot.rotation.x = 0.1
        pivot.rotation.y = nm.r * 2.3
        pivot.add(moon)
        group.add(pivot)
        moonPivots.push({ pivot, period: nm.period })
        moonMeshes.push(moon)
        disposables.push(nmGeo, nmMat)
      }

      // (Content sub-destinations live inside the worlds — the sky stays a
      // clean, realistic system. PLANET_NAV moons still power the sections.)

      scene.add(group)
      planetGroups.push(group)
      planetMeshes.push(mesh)

      // Orbit line (a true circle in the ecliptic plane).
      const pts = new THREE.EllipseCurve(0, 0, ORBIT_A[i], ORBIT_A[i]).getPoints(160)
      const lineGeo = new THREE.BufferGeometry().setFromPoints(
        pts.map((q) => new THREE.Vector3(q.x, 0, q.y)),
      )
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x8ca3d8,
        transparent: true,
        opacity: 0.3,
      })
      const line = new THREE.LineLoop(lineGeo, lineMat)
      scene.add(line)
      ringMats.push(lineMat)
      disposables.push(lineGeo, lineMat)
    })

    // ── Interaction: hover label + click-to-travel (never moves the world) ─
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let hovered: THREE.Mesh | null = null
    let downX = 0
    let downY = 0

    const pickAt = (clientX: number, clientY: number): THREE.Mesh | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObjects([sunMesh, ...planetMeshes, ...moonMeshes], false)
      return (hits[0]?.object as THREE.Mesh) ?? null
    }
    const pick = (e: PointerEvent) => pickAt(e.clientX, e.clientY)

    // Free exploration: zoom-to-cursor + pan let the user approach any planet
    // directly — no wheel-only focus hack (which never fired on touch anyway).

    const onPointerMove = (e: PointerEvent) => {
      const hit = pick(e)
      if (hit !== hovered) {
        hovered = hit
        // Natural moons are lore, not links — no pointer cursor for them.
        renderer.domElement.style.cursor =
          hit && hit.userData.kind !== 'nmoon' ? 'pointer' : 'grab'
        ringMats.forEach((m, i) => {
          const isHover = hovered?.userData.index === i
          m.opacity = isHover ? 0.9 : 0.3
          m.color.set(isHover ? PLANETS[i].color : '#8ca3d8')
        })
        const label = labelRef.current
        if (label) label.style.opacity = hit ? '1' : '0'
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX
      downY = e.clientY
    }
    // Right-drag pans the whole system — suppress the browser context menu so
    // the gesture isn't interrupted by a popup.
    const onContextMenu = (e: Event) => e.preventDefault()
    const onPointerUp = (e: PointerEvent) => {
      // Only the LEFT button travels; right/middle are camera controls (pan/dolly).
      if (e.button !== 0) return
      // A real click, not the tail end of an orbit drag.
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return
      const hit = pick(e)
      if (!hit) return
      if (hit.userData.kind === 'sun') {
        enterWorldRef.current(SUN_NAV) // the Sun is a world too → warp + land
        return
      }
      if (hit.userData.kind === 'nmoon') return // real moons: look, don't click
      if (hit.userData.kind === 'moon') {
        // Moons are sub-destinations: '#anchor' lands on the parent world and
        // scrolls to that section; URLs are satellites → open externally.
        const mn = hit.userData.moon as { target: string }
        const parent = PLANET_NAV[hit.userData.planetName as string]
        if (mn.target.startsWith('#')) {
          if (parent) enterWorldRef.current(parent, mn.target)
        } else {
          window.open(mn.target, '_blank', 'noopener,noreferrer')
        }
        return
      }
      const nav = PLANET_NAV[hit.userData.name as string]
      if (!nav) return
      if (nav.kind === 'world') enterWorldRef.current(nav)
      else if (nav.target) window.open(nav.target, '_blank', 'noopener,noreferrer')
    }
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('contextmenu', onContextMenu)
    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.style.touchAction = 'none'

    // ── Resize ───────────────────────────────────────────────────────────
    const onResize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ───────────────────────────────────────────────────
    // Orbits advance on ELAPSED TIME only. Tour flies the camera; free mode
    // hands the camera to OrbitControls. The world itself never reacts to
    // the mouse.
    let raf = 0
    let t = 0
    let prev = performance.now()
    const v3 = new THREE.Vector3()
    const desiredTarget = new THREE.Vector3()
    const camDir = new THREE.Vector3()
    const UP = new THREE.Vector3(0, 1, 0)
    const SUN_ORIGIN = new THREE.Vector3(0, 0, 0)
    // Scripted tour-flight state (captured at each step change).
    let flyKey = -999
    let flyT0 = 0
    let flyLen0 = 1
    const flyDir0 = new THREE.Vector3(0, 0.5, 1)
    const flyTarget0 = new THREE.Vector3()
    const tmpTarget = new THREE.Vector3()
    // Scripted click-to-enter dive state (captured when a dive begins).
    let diveKey: string | null = null
    let diveT0 = 0
    let diveLen0 = 1
    let diveAz0 = 0
    let diveElev0 = 0

    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now

      // Motion advances unless reduced-motion OR the user paused rotation.
      // (It keeps running behind an open world page so the pages stay alive.)
      const advancing = !reduceRef.current && !pausedRef.current
      if (advancing) t += dt
      const spinDt = advancing ? dt : 0

      // Planets orbit the sun; surfaces spin on their own axes.
      for (let i = 0; i < planetGroups.length; i++) {
        const th = angle0[i] + t * omega[i]
        planetGroups[i].position.set(
          ORBIT_A[i] * Math.cos(th),
          0,
          ORBIT_A[i] * Math.sin(th),
        )
        planetMeshes[i].rotation.y += spinDt * (0.12 + i * 0.015)

        // Publish projected screen offsets (used by warp/tour overlays).
        v3.copy(planetGroups[i].position).project(camera)
        registerPlanet(
          PLANETS[i].name,
          (v3.x * 0.5) * host.clientWidth,
          (-v3.y * 0.5) * host.clientHeight,
        )
      }
      for (const m of moonPivots) m.pivot.rotation.y = t * (TWO_PI / m.period)

      // ── Camera choreography ────────────────────────────────────────────
      const tour = tourRef.current
      const warp = warpRef.current
      controls.enabled = !tour.active && !frozenRef.current && !warp.diving
      const k = 1 - Math.exp(-dt / 0.45)
      if (warp.diving) {
        // Entering a world: fly ONE smooth lap around the body, spiralling in,
        // then swoop onto it. Scripted + time-parameterised (deterministic), so
        // it never wobbles or stutters — and it tracks the still-orbiting planet.
        const idx = PLANETS.findIndex((p) => p.name === warp.diving)
        // The Sun sits at the origin (radius ~8); planets ride their live orbits.
        const planetPos = idx >= 0 ? planetGroups[idx].position : SUN_ORIGIN
        const bodyR = idx >= 0 ? RADII[idx] : 8
        // Let the camera get right up on the body — controls.update() clamps to
        // minDistance every frame (even while disabled), so lower it for the dive.
        controls.minDistance = 0.4

        // New dive → capture the current camera offset as the lap's start pose.
        if (warp.diving !== diveKey) {
          diveKey = warp.diving
          diveT0 = now
          if (idx >= 0) upgradeTexture(idx) // crisp surface for the close pass
          camDir.copy(camera.position).sub(planetPos)
          diveLen0 = camDir.length() || 1
          diveAz0 = Math.atan2(camDir.z, camDir.x)
          diveElev0 = Math.asin(THREE.MathUtils.clamp(camDir.y / diveLen0, -1, 1))
        }

        if (reduceRef.current) {
          // Reduced motion: no orbit — settle straight onto the body.
          controls.target.copy(planetPos)
          camDir.copy(camera.position).sub(planetPos)
          camDir.normalize()
          camera.position.copy(planetPos).addScaledVector(camDir, bodyR * 2.2)
        } else {
          const u = Math.min(1, (now - diveT0) / DIVE_MS)
          // One full lap, eased: starts gently, sweeps around, settles.
          const az = diveAz0 + easeInOutCubic(u) * TWO_PI
          // Rise toward a slight top-down as we come around.
          const elev = THREE.MathUtils.lerp(diveElev0, 0.3, easeOutCubic(u))
          // Radius: ease out to an inspection ring, orbit, then swoop in at the end.
          const inspectR = bodyR * 4.2
          const closeR = bodyR * 1.9
          const radius =
            u < 0.62
              ? THREE.MathUtils.lerp(diveLen0, inspectR, easeOutCubic(u / 0.62))
              : THREE.MathUtils.lerp(inspectR, closeR, easeInCubic((u - 0.62) / 0.38))
          const ce = Math.cos(elev)
          controls.target.copy(planetPos)
          camera.position
            .copy(planetPos)
            .addScaledVector(
              camDir.set(ce * Math.cos(az), Math.sin(elev), ce * Math.sin(az)),
              radius,
            )
          // Gentle lens punch on the final swoop for a sense of speed.
          const fov = 55 + (u > 0.62 ? ((u - 0.62) / 0.38) * 10 : 0)
          if (Math.abs(camera.fov - fov) > 0.05) {
            camera.fov = fov
            camera.updateProjectionMatrix()
          }
        }
      } else if (tour.active) {
        let dist: number | null = null
        if (tour.index <= 0) {
          desiredTarget.set(0, 0, 0)
          dist = 58
        } else if (tour.index <= PLANETS.length) {
          const gi = tour.index - 1
          upgradeTexture(gi) // crisp close-up for the spotlight
          desiredTarget.copy(planetGroups[gi].position)
          dist = RADII[gi] * 9 + 8
        } else {
          desiredTarget.set(0, 0, 0)
          dist = 190
        }

        // New step → capture the flight's starting pose.
        if (tour.index !== flyKey) {
          flyKey = tour.index
          flyT0 = now
          flyTarget0.copy(controls.target)
          flyDir0.copy(camera.position).sub(controls.target)
          flyLen0 = flyDir0.length() || 1
          flyDir0.multiplyScalar(1 / flyLen0)
        }
        // Scripted arc: rise over the system, sweep sideways, descend onto the
        // (still-moving) planet. Deterministic — can't wobble or overshoot.
        const u = Math.min(1, (now - flyT0) / TOUR_FLY_MS)
        const e = easeInOutCubic(u)
        const arc = Math.sin(Math.PI * e)
        tmpTarget.lerpVectors(flyTarget0, desiredTarget, e)
        controls.target.copy(tmpTarget)
        camDir.copy(flyDir0).applyAxisAngle(UP, arc * 0.5) // sideways sweep
        camDir.y = THREE.MathUtils.lerp(flyDir0.y, 0.42, e) + arc * 0.35 // rise
        camDir.normalize()
        const len = THREE.MathUtils.lerp(flyLen0, dist!, e) * (1 + arc * 0.45)
        camera.position.copy(controls.target).addScaledVector(camDir, len)
        // Speed cues mid-hop: the lens widens (FOV punch) and the stars swell —
        // both settle to normal exactly as the camera arrives.
        const fov = 55 + arc * 13
        if (Math.abs(camera.fov - fov) > 0.05) {
          camera.fov = fov
          camera.updateProjectionMatrix()
        }
        starMat.size = STAR_SIZE * (1 + arc * 1.1)

        // Leader-line anchor for the Tour caption.
        if (tour.index >= 1 && tour.index <= PLANETS.length) {
          const gi = tour.index - 1
          v3.copy(planetGroups[gi].position).project(camera)
          const w = host.clientWidth
          const h = host.clientHeight
          const sx = (v3.x * 0.5 + 0.5) * w
          const sy = (-v3.y * 0.5 + 0.5) * h
          const d = camera.position.distanceTo(planetGroups[gi].position)
          const rScr =
            (RADII[gi] / d) * ((h / 2) / Math.tan(((camera.fov / 2) * Math.PI) / 180))
          setSpotlight({ x: sx, y: sy, r: rScr * 1.5 })
        } else {
          setSpotlight(null)
        }
      } else {
        setSpotlight(null)
        flyKey = -999
        diveKey = null // a fresh dive re-captures its starting pose
        // Settle the lens + stars back to normal after a tour.
        if (camera.fov !== 55) {
          camera.fov = THREE.MathUtils.lerp(camera.fov, 55, k)
          if (Math.abs(camera.fov - 55) < 0.05) camera.fov = 55
          camera.updateProjectionMatrix()
        }
        if (starMat.size !== STAR_SIZE) {
          starMat.size = THREE.MathUtils.lerp(starMat.size, STAR_SIZE, k)
          if (Math.abs(starMat.size - STAR_SIZE) < 0.02) starMat.size = STAR_SIZE
        }
        controls.minDistance = 2

        // Returning from a world OR the user tapped recenter: glide the view
        // back to a centred, comfortable overview of the whole system.
        if (warp.restore || recenterRef.current) {
          controls.target.lerp(SUN_ORIGIN, k)
          const nl = THREE.MathUtils.lerp(controls.getDistance(), 135, k)
          camDir.copy(camera.position).sub(controls.target).normalize()
          camera.position.copy(controls.target).addScaledVector(camDir, nl)
          if (Math.abs(nl - 135) < 4 && controls.target.lengthSq() < 6) {
            warp.restore = false
            recenterRef.current = false
          }
        }
        // Otherwise the camera is entirely the user's — no snap-back to the sun.

        // Crisp close-ups: upgrade a planet's texture once you get near it.
        for (let i = 0; i < planetGroups.length; i++) {
          if (!upgraded[i] && camera.position.distanceTo(planetGroups[i].position) < 42) {
            upgradeTexture(i)
          }
        }
      }

      controls.update() // every frame — damping needs it
      // Skip the heavy render while an opaque world page covers the scene.
      if (!worldOpenRef.current) renderer.render(scene, camera)

      // Track the hovered body with the DOM label.
      const label = labelRef.current
      if (label && hovered) {
        hovered.getWorldPosition(v3).project(camera)
        const w = host.clientWidth
        const h = host.clientHeight
        label.style.transform = `translate(-50%, -130%) translate(${((v3.x * 0.5 + 0.5) * w).toFixed(0)}px, ${((-v3.y * 0.5 + 0.5) * h).toFixed(0)}px)`
        if (hovered.userData.kind === 'sun') {
          label.textContent = 'Ankur Singh · who I am'
        } else if (hovered.userData.kind === 'nmoon') {
          label.textContent = `${hovered.userData.label as string} · moon`
        } else if (hovered.userData.kind === 'moon') {
          const mn = hovered.userData.moon as { label: string; tag?: string }
          label.textContent = mn.tag ? `${mn.label} · ${mn.tag}` : mn.label
        } else {
          const nav: PlanetNav | undefined = PLANET_NAV[hovered.userData.name as string]
          label.textContent = nav
            ? `${nav.label.replace(' ↗', '')} · ${nav.tag}`
            : (hovered.userData.name as string)
        }
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('contextmenu', onContextMenu)
      controls.dispose()
      disposables.forEach((d) => d.dispose())
      stars.geometry.dispose()
      ;(stars.material as THREE.Material).dispose()
      milky.geometry.dispose()
      ;(milky.material as THREE.Material).dispose()
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={hostRef} aria-hidden="true" className="fixed inset-0 z-0 bg-[#02030a]">
      {/* Hover label — driven imperatively from the render loop. */}
      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 whitespace-nowrap rounded-md bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-slate-900 opacity-0 shadow-lg transition-opacity duration-200"
      />
    </div>
  )
}
